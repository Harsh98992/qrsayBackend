const AppError = require("../helpers/appError");
const catchAsync = require("../helpers/catchAsync");
const { checkDineInTableAvailability } = require("../helpers/dineInHelper");
const generateOrderID = require("../helpers/orderIdGenerator");
const { fetchOrderById } = require("../helpers/razorPayHelper");
const easyinvoice = require("easyinvoice");
const sendMail = require("../helpers/email");
const axios = require("axios");
const Order = require("../models/OrderModel");
const Table = require("../models/tableModel");
const io = require("../server"); // Make sure to import the correct 'io' object
const Restaurant = require("../models/restaurantModel");
const Customer = require("../models/CustomerModel");
const crypto = require("crypto");
const { getRazorPayKey } = require("../helpers/razorPayHelper");
// const sendCustomWhatsAppMessage = require("../helpers/whatsapp");
const {
  sendCustomWhatsAppMessage,
  sendTrackOrderWhatsAppMessage,
  sendRestaurantOrderMessage,
} = require("../helpers/whatsapp");
const generateOtp = require("../helpers/generateOtp");
const Room = require("../models/RoomModel");
const OrderTemp = require("../models/OrderModelTemp");

exports.validationBeforeOrder = catchAsync(async (req, res, next) => {
  const reqData = {
    ...req.body,
  };

  const restaurantDetail = await Restaurant.findOne({
    _id: reqData["restaurantId"],
  });
  if (!restaurantDetail) {
    return next(new AppError("Unable to find restaurant.", 400));
  }
  if (
    restaurantDetail &&
    restaurantDetail?.restaurantStatus?.toLowerCase() === "offline"
  ) {
    return next(
      new AppError("The restaurant is presently unable to take orders.", 400)
    );
  }
  for (const orderData of reqData?.orderSummary) {
    let dishAvailableFlag = false;
    for (const categoryData of restaurantDetail?.cuisine) {
      for (const dishData of categoryData?.items) {
        if (dishData._id.toString() === orderData?.dishId) {
          if (dishData?.availableFlag) {
            if (categoryData?.startTime && categoryData?.endTime) {
              const currDate = new Date(
                new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
              );
              console.log(currDate, "currDate");
              const startHours = categoryData?.startTime.split(":");
              const endHours = categoryData?.endTime.split(":");
              const tempDate = new Date(
                new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
              );
              tempDate.setHours(startHours[0]); // Set hours
              tempDate.setMinutes(startHours[1]); // Set minutes
              const tempDate2 = new Date(
                new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
              );
              tempDate2.setHours(endHours[0]); // Set hours
              tempDate2.setMinutes(endHours[1]); // Set minutes
              if (tempDate > tempDate2) {
                tempDate2.setDate(tempDate2.getDate() + 1);
              } else if (currDate < tempDate) {
                return next(
                  new AppError(
                    `We apologize, cost of the dish ${orderData.dishName} has been modified. Please remove the dish and place it back in the cart.`,
                    400
                  )
                );
              } else if (currDate > tempDate2) {
                return next(
                  new AppError(
                    `We apologize, cost of the dish ${orderData.dishName} has been modified. Please remove the dish and place it back in the cart.`,
                    400
                  )
                );
              }
            }
            dishAvailableFlag = true;

            if (dishData?.sizeAvailable?.length) {
              const selectedDish = dishData.sizeAvailable.filter((data) => {
                return (
                  data?.size?.toLowerCase() ===
                  orderData?.["itemSizeSelected"]?.["size"]?.toLowerCase()
                );
              });

              if (
                selectedDish?.length &&
                selectedDish[0]?.price !==
                  orderData?.["itemSizeSelected"]?.["price"]
              ) {
                return next(
                  new AppError(
                    `We apologize, cost of the dish ${orderData.dishName} has been modified. Please remove the dish and place it back in the cart.`,
                    400
                  )
                );
              }
            } else if (dishData?.dishPrice !== orderData?.dishPrice) {
              return next(
                new AppError(
                  `We apologize, cost of the dish ${orderData.dishName} has been modified. Please remove the dish and place it back in the cart.`,
                  400
                )
              );
            }
          } else {
            return next(
              new AppError(
                `We apologize, but the chosen dish ${orderData.dishName} is currently unavailable. Kindly remove it from your cart.`,
                400
              )
            );
          }
        }
      }
    }
    if (!dishAvailableFlag && orderData?.dishId) {
      return next(
        new AppError(
          `We apologize, but the chosen dish ${orderData.dishName} is currently unavailable. Kindly remove it from your cart.`,
          400
        )
      );
    }
  }
  if (
    reqData["customerPreferences"].preference?.toLowerCase() != "room service"
  ) {
    if (
      req.user &&
      req.user.blockedRestaurants.includes(reqData["restaurantId"])
    ) {
      return next(
        new AppError(
          "You have been restricted from accessing this restaurant's services. Kindly reach out to the restaurant for additional details",
          400
        )
      );
    }
    if (req.user) {
      const pendingOrder = await Order.findOne({
        customerId: req.user._id,
        orderStatus: "pending",
      });

      if (pendingOrder && pendingOrder._id) {
        return next(
          new AppError(
            "Please wait while your previous order is getting accepted by restaurant!"
          )
        );
      }
    }
    if (reqData["customerPreferences"].preference === "Dine In") {
      const checkDineInResult = await checkDineInTableAvailability(
        reqData["customerPreferences"].value,
        reqData["restaurantId"],
        req.user["_id"]
      );
      if (!checkDineInResult.result) {
        return next(new AppError(checkDineInResult.message, 400));
      }
    }
  }
  res.status(200).json({
    status: "success",
    data: {
      message:
        "Order validation successful! You can now proceed to place the order.",
    },
  });
});
exports.placeOrder = catchAsync(async (req, res, next) => {
  const reqData = {
    ...req.body,
  };
  const storeFlag = reqData["storeFlag"] ?? false;
  const restaurantDetail = await Restaurant.findOne({
    _id: reqData["restaurantId"],
  });
  if (!restaurantDetail) {
    return next(new AppError("Unable to find restaurant.", 400));
  }
  if (
    restaurantDetail &&
    restaurantDetail?.restaurantStatus?.toLowerCase() === "offline"
  ) {
    return next(
      new AppError("The restaurant is presently unable to take orders.", 400)
    );
  }

  for (const orderData of reqData?.orderSummary) {
    let dishAvailableFlag = false;
    for (const categoryData of restaurantDetail?.cuisine) {
      for (const dishData of categoryData?.items) {
        if (dishData._id.toString() === orderData?.dishId) {
          if (dishData?.availableFlag) {
            if (categoryData?.startTime && categoryData?.endTime) {
              const currDate = new Date(
                new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
              );
              const startHours = categoryData?.startTime.split(":");
              const endHours = categoryData?.endTime.split(":");
              const tempDate = new Date(
                new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
              );
              tempDate.setHours(startHours[0]); // Set hours
              tempDate.setMinutes(startHours[1]); // Set minutes
              const tempDate2 = new Date(
                new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
              );
              tempDate2.setHours(endHours[0]); // Set hours
              tempDate2.setMinutes(endHours[1]); // Set minutes
              if (tempDate > tempDate2) {
                tempDate2.setDate(tempDate2.getDate() + 1);
              } else if (currDate < tempDate) {
                return next(
                  new AppError(
                    `We apologize, cost of the dish ${orderData.dishName} has been modified. Please remove the dish and place it back in the cart.`,
                    400
                  )
                );
              } else if (currDate > tempDate2) {
                return next(
                  new AppError(
                    `We apologize, cost of the dish ${orderData.dishName} has been modified. Please remove the dish and place it back in the cart.`,
                    400
                  )
                );
              }
            }
            dishAvailableFlag = true;

            if (dishData?.sizeAvailable?.length) {
              const selectedDish = dishData.sizeAvailable.filter((data) => {
                return (
                  data?.size?.toLowerCase() ===
                  orderData?.["itemSizeSelected"]?.["size"]?.toLowerCase()
                );
              });

              if (
                selectedDish?.length &&
                selectedDish[0]?.price !==
                  orderData?.["itemSizeSelected"]?.["price"]
              ) {
                return next(
                  new AppError(
                    `We apologize, cost of the dish ${orderData.dishName} has been modified. Please remove the dish and place it back in the cart.`,
                    400
                  )
                );
              }
            } else if (dishData?.dishPrice !== orderData?.dishPrice) {
              return next(
                new AppError(
                  `We apologize, cost of the dish ${orderData.dishName} has been modified. Please remove the dish and place it back in the cart.`,
                  400
                )
              );
            }
          } else {
            return next(
              new AppError(
                `We apologize, but the chosen dish ${orderData.dishName} is currently unavailable. Kindly remove it from your cart.`,
                400
              )
            );
          }
        }
      }
    }
    if (!dishAvailableFlag && orderData?.dishId) {
      return next(
        new AppError(
          `We apologize, but the chosen dish ${orderData.dishName} is currently unavailable. Kindly remove it from your cart.`,
          400
        )
      );
    }
  }

  if (
    reqData["customerPreferences"].preference?.toLowerCase() ===
      "room service" ||
    reqData["customerPreferences"].preference?.toLowerCase() ===
      "grab and go" ||
    reqData["customerPreferences"].preference?.toLowerCase() === "dining"
  ) {
    if (
      reqData["customerPreferences"].preference?.toLowerCase() === "grab and go"
    ) {
      reqData["customerPreferences"].preference = "Take Away";
    }
    const orderId = generateOtp();
    const orderData = [
      {
        cookingInstruction: reqData["cookingInstruction"],
        orderSummary: reqData["orderSummary"],
        orderAmount: reqData["orderAmount"],
        gstAmount: reqData["gstAmount"],
        deliveryAmount: reqData["deliveryAmount"],
        discountAmount: reqData["discountAmount"],
      },
    ];
    let savedData = {
      orderId: orderId,

      customerName: reqData["customerPreferences"]?.userDetail?.name ?? "",
      customerEmail: "",
      customerPhoneNumber:
        reqData["customerPreferences"]?.userDetail?.phoneNumber ?? "",
      customerPreferences: reqData["customerPreferences"],
      orderDetails: orderData,
      restaurantId: reqData["restaurantId"],
    };
    if (reqData["paymentMethod"] === "payOnline") {
      const razorpayKeys = getRazorPayKey();

      const paymentDetails = await fetchOrderById(
        razorpayKeys["razorpay_key_id"],
        razorpayKeys["razorpay_key_secret"],
        req.body.razorpay_order_id
      );
      savedData = {
        ...savedData,
        payment_order_id: reqData["razorpay_order_id"],
        autoRejectFlag: restaurantDetail.autoRejectFlag ?? true,
        payment_transfer_id: reqData?.["razorpay_tranferData"]?.["id"] ?? "",
        payment_id: reqData["razorpay_payment_id"] ?? null,
        payment_signature: reqData["razorpay_signature"] ?? null,
        payment_time: paymentDetails?.items?.[0]?.["created_at"] ?? null,
        payment_method: paymentDetails?.items?.[0]?.["method"] ?? null,
        payment_amount: paymentDetails?.items?.[0]?.["amount"]
          ? paymentDetails?.items?.[0]?.["amount"] / 100
          : 0,
        transfer_amount: reqData?.["razorpay_tranferData"]?.["amount"] / 100,
      };
    } else {
      savedData = {
        ...savedData,
        payment_method: "Cash On Delivery",
      };
    }
    if (!storeFlag) {
      // send a mail to the customer that order has been placed successfully
      try {
        if (process.env.WHATSAPP_ORDER_STATUS === "true") {
          // send a WhatsApp message to the customer that order has been placed successfully
          // Assuming you have a function sendWhatsAppMessage(phoneNumber, message)
          sendRestaurantOrderMessage(
            restaurantDetail?.restaurantPhoneNumber,
            savedData
          );
          sendTrackOrderWhatsAppMessage(
            reqData["customerPreferences"]?.userDetail?.phoneNumber,
            `Order placed successfully!`,
            `${orderId}`
          );
        }
      } catch (error) {
        // print error
      }
    }
    if (storeFlag) {
      await OrderTemp.create(savedData);
      res.status(200).json({
        status: "success",
        data: {
          savedData: savedData,
        },
      });
    } else {
      await Order.create(savedData);
      res.status(200).json({
        status: "success",
        data: {
          message:
            "Order placed successfully! Thank you for your purchase. You will soon receive a confirmation once your order is verified by the restaurant.",

          savedData: savedData,
        },
      });
    }
  } else {
    if (
      req.user &&
      req.user.blockedRestaurants.includes(reqData["restaurantId"])
    ) {
      return next(
        new AppError(
          "You have been restricted from accessing this restaurant's services. Kindly reach out to the restaurant for additional details",
          400
        )
      );
    }
    if (req.user) {
      const pendingOrder = await Order.findOne({
        customerId: req.user._id,
        orderStatus: "pending",
      });

      if (pendingOrder && pendingOrder._id) {
        return next(
          new AppError(
            "Please wait while your previous order is getting accepted by restaurant!"
          )
        );
      }
    }
    if (
      reqData["customerPreferences"].preference?.toLowerCase() ===
        "take away" ||
      reqData["customerPreferences"].preference?.toLowerCase() ===
        "scheduled dining"
    ) {
      if (
        reqData["customerPreferences"].value &&
        reqData["customerPreferences"].value.toLowerCase() !== "asap"
      ) {
        const selectedTime = reqData["customerPreferences"].value;
        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const [selectedHours, selectedMinutes] = selectedTime
          .split(":")
          .map(Number);

        const differenceInMinutes =
          selectedHours * 60 +
          selectedMinutes -
          (currentHours * 60 + currentMinutes);

        if (parseInt(differenceInMinutes) < 15) {
          return next(
            new AppError(
              "Please select a time that is at least 15 minutes later than the current time for take away order!",
              400
            )
          );
        }
      }
    }
    if (reqData["customerPreferences"].preference === "Dine In") {
      const checkDineInResult = await checkDineInTableAvailability(
        reqData["customerPreferences"].value,
        reqData["restaurantId"],
        req.user["_id"]
      );
      if (!checkDineInResult.result) {
        return next(new AppError(checkDineInResult.message, 400));
      }
    }
    const orderId = generateOtp();
    const orderData = [
      {
        cookingInstruction: reqData["cookingInstruction"],
        orderSummary: reqData["orderSummary"],
        orderAmount: reqData["orderAmount"],
        gstAmount: reqData["gstAmount"],
        deliveryAmount: reqData["deliveryAmount"],
        discountAmount: reqData["discountAmount"],
      },
    ];
    let savedData = {
      orderId: orderId,
      customerId: req.user["_id"],
      customerName: req.user["name"],
      customerEmail: req.user["email"],
      customerPhoneNumber: req.user["phoneNumber"],
      customerPreferences: reqData["customerPreferences"],
      orderDetails: orderData,
      restaurantId: reqData["restaurantId"],
    };
    if (reqData["paymentMethod"] === "payOnline") {
      const razorpayKeys = getRazorPayKey();

      const paymentDetails = await fetchOrderById(
        razorpayKeys["razorpay_key_id"],
        razorpayKeys["razorpay_key_secret"],
        req.body.razorpay_order_id
      );
      savedData = {
        ...savedData,
        payment_order_id: reqData["razorpay_order_id"],
        autoRejectFlag: restaurantDetail.autoRejectFlag ?? true,
        payment_transfer_id: reqData?.["razorpay_tranferData"]?.["id"] ?? "",
        payment_id: reqData["razorpay_payment_id"] ?? null,
        payment_signature: reqData["razorpay_signature"] ?? null,
        payment_time: paymentDetails?.items?.[0]?.["created_at"] ?? null,
        payment_method: paymentDetails?.items?.[0]?.["method"] ?? null,
        payment_amount: paymentDetails?.items?.[0]?.["amount"]
          ? paymentDetails?.items?.[0]?.["amount"] / 100
          : 0,
        transfer_amount: reqData?.["razorpay_tranferData"]?.["amount"] / 100,
      };
    } else {
      savedData = {
        ...savedData,
        payment_method: "Cash On Delivery",
      };
    }
    if (storeFlag) {
      await OrderTemp.create(savedData);
      res.status(200).json({
        status: "success",
        data: {
          savedData: savedData,
        },
      });
    } else {
      await Order.create(savedData);
      res.status(200).json({
        status: "success",
        data: {
          message:
            "Order placed successfully! Thank you for your purchase. You will soon receive a confirmation once your order is verified by the restaurant.",

          savedData: savedData,
        },
      });
    }
    if (!storeFlag) {
      // send a mail to the customer that order has been placed successfully
      try {
        if (process.env.EMAIL_ORDER_STATUS === "true") {
          // send a mail to the customer that order has been placed successfully
          sendMail(
            req.user.email,
            "Order Placed Successfully",
            `Thank you for your purchase. You will soon receive a confirmation once your order is accepted by the restaurant.

  Order Id: ${orderId}

  Order Amount: ${reqData["orderAmount"]}

  Order Date: ${new Date().toLocaleString()}

  Order Status: Pending`
          );
        }

        if (process.env.SMS_ORDER_STATUS === "true") {
          // send an SMS to the customer that order has been placed successfully
          await axios.get(
            process.env.SMS_API_URL +
              orderId +
              "%7C" +
              "Pending" +
              "%7C" +
              "&flash=0&numbers=" +
              req.user.phoneNumber
          );
        }

        if (process.env.WHATSAPP_ORDER_STATUS === "true") {
          // send a WhatsApp message to the customer that order has been placed successfully
          // Assuming you have a function sendWhatsAppMessage(phoneNumber, message)
          sendRestaurantOrderMessage(
            restaurantDetail?.restaurantPhoneNumber,
            savedData
          );
          sendCustomWhatsAppMessage(
            req.user["phoneNumber"],
            `Order placed Successfully.`
          );
        }
      } catch (error) {}

      // send a mail to the restaurant that order has been placed successfully

      sendMail(
        restaurantDetail?.restaurantEmail,
        "New Order Received",
        `You have received a new order from ${req.user.name}.

        Order Id: ${orderId}

        Order Amount: ${reqData["orderAmount"]}

        Order Date: ${new Date().toLocaleString()}

        Order Status: Pending`
      );
    }
  }
});

exports.paymentVerification = async (req, res, next) => {
  console.log("payment verification");
  // const receivedSignature = req.headers["x-razorpay-signature"];
  // const generatedSignature = crypto
  //   .createHmac("sha256", "123456789")
  //   .update(req.rawBody)
  //   .digest("hex");

  // if (receivedSignature !== generatedSignature) {
  //   return res.status(400).send("Invalid signature");
  // }

  const event = req.body;

  // Handle the payment.captured event
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    if (payment) {
      const orderData = await OrderTemp.findOne({
        payment_order_id: payment.order_id,
      });
      if (orderData?._doc) {
        console.log("came inside")
        const reqData = Object.assign({}, orderData._doc);
        reqData["payment_time"] = payment["created_at"] ?? null;
        reqData["payment_method"] = payment["method"] ?? null;
        reqData["payment_amount"] = payment["amount"]
          ? payment["amount"] / 100
          : 0;
        reqData["payment_id"] = payment["id"] ?? null;

        delete reqData["_id"];

        await Order.create(reqData);
        const io = req.io;

        io.to(reqData.restaurantId.toString()).emit("orderUpdate", {});
        try {
          if (process.env.WHATSAPP_ORDER_STATUS === "true") {
            // send a WhatsApp message to the customer that order has been placed successfully
            // Assuming you have a function sendWhatsAppMessage(phoneNumber, message)
            const restaurantDetail = await Restaurant.findOne({
              _id: reqData["restaurantId"],
            });
            console.log(restaurantDetail?.restaurantPhoneNumber,)
            sendRestaurantOrderMessage(
              restaurantDetail?.restaurantPhoneNumber,
              savedData
            );
            console.log( reqData["customerPreferences"]?.userDetail?.phoneNumber)
            sendTrackOrderWhatsAppMessage(
              reqData["customerPreferences"]?.userDetail?.phoneNumber,
              `Order placed successfully!`,
              `${orderId}`
            );
          }
          if (process.env.EMAIL_ORDER_STATUS === "true") {
            // send a mail to the customer that order has been placed successfully
            sendMail(
              req?.user?.email,
              "Order Placed Successfully",
              `Thank you for your purchase. You will soon receive a confirmation once your order is accepted by the restaurant.
  
            Order Id: ${orderId}
  
            Order Amount: ${reqData["orderAmount"]}
  
            Order Date: ${new Date().toLocaleString()}
  
              Order Status: Pending`
            );
          }
        } catch (error) {
          // print error
        }
      }
    } else {
      return new AppError("Some Issue happened with payment", 400);
    }
    // Process the payment capture event (e.g., update your database, notify user, etc.)
  } else {
    console.log(`Unhandled event type ${event.event}`);
  }

  // Respond to acknowledge receipt of the webhook
  res.status(200).send("Webhook received");
};
exports.getRestaurantOrdersByStatus = catchAsync(async (req, res, next) => {
  if (!req.body?.orderStatus) {
    return next(new AppError("Please provide order status!", 400));
  }
  const statusArray = req.body.orderStatus;

  const data = await Order.find({
    restaurantId: req.user.restaurantKey,
    orderStatus: { $in: statusArray },
  }).lean();

  if (!data && !data.length) {
    return next(new AppError("Something weent wrong", 400));
  }
  const response = data;

  for (const [i, orderData] of response.entries()) {
    const customer = await Customer.findById(orderData.customerId);

    if (!customer) {
      orderData["loyalFlag"] = false;
    }
    const loyalFlag = customer?.loyalRestaurants.includes(
      orderData.restaurantId
    );

    response[i]["loyalFlag"] = loyalFlag;
  }

  res.status(200).json({
    status: "success",

    data: {
      orderData: response,
    },
  });
});

exports.getCustomerOrder = catchAsync(async (req, res, next) => {
  const result = await Order.aggregate([
    {
      $match: { customerId: req.user._id }, // Match the specific user by ID
    },
    {
      $lookup: {
        from: "restaurants", // The collection you want to "join" with (roles in this case)
        localField: "restaurantId", // Local field in the users collection (foreign key)
        foreignField: "_id", // Foreign field in the roles collection
        as: "restaurantData", // The alias for the joined data (you can choose any name)
      },
    },
  ]);

  res.status(200).json({
    status: "success",

    data: {
      orderData: result,
    },
  });
});
exports.getCustomerPaymentPendingOrder = catchAsync(async (req, res, next) => {
  const result = await Order.findOne({
    customerId: req.user._id,
    orderStatus: "pendingPayment",
  });
  res.status(200).json({
    status: "success",

    data: {
      orderData: result,
    },
  });
});
exports.getCustomerActiveOrder = catchAsync(async (req, res, next) => {
  const result = await Order.find({
    customerId: req.user._id,
    orderStatus: { $in: ["pending", "processing", "pendingPayment"] },
  });
  res.status(200).json({
    status: "success",

    data: {
      orderData: result,
    },
  });
});
const dineInOrderHelper = async (orderData, req, res, next) => {
  const checkDineInResult = await checkDineInTableAvailability(
    orderData.customerPreferences.value,
    orderData.restaurantId,
    orderData.customerId
  );
  if (!checkDineInResult.result) {
    return next(new AppError(checkDineInResult.message, 400));
  }
  const queryResult = await Table.findOne(
    {
      restaurantId: orderData.restaurantId,
      "tables.customerId": orderData.customerId,
    },
    { "tables.$": 1 }
  );

  if (!queryResult) {
    const result = await Table.updateOne(
      {
        restaurantId: orderData.restaurantId,
        "tables.tableName": orderData.customerPreferences.value,
      },

      {
        $set: {
          "tables.$.isAvailable": false,
          "tables.$.orderId": req.body.orderId,
          "tables.$.customerId": orderData.customerId,
        },
      },
      { multi: true }
    );
  } else {
    orderData["orderDetails"][0].preprationTime = req.body.preprationTime;
    const previousOrderId = queryResult.tables[0].orderId;
    const previousOrderData = await Order.findOne({ _id: previousOrderId });

    if (!previousOrderData) {
      return;
    }
    const newOrderData = [
      ...previousOrderData.orderDetails,
      ...orderData.orderDetails,
    ];

    const result = await Order.updateOne(
      { _id: previousOrderId },

      {
        $set: {
          orderDetails: newOrderData,
        },
      },
      { multi: true }
    );
    await Order.deleteOne({ _id: orderData._id });
  }
};
const unlockTable = async (orderData, completeflag = true, req, res, next) => {
  const queryResult = await Table.findOne({
    restaurantId: orderData.restaurantId,
    tables: {
      $elemMatch: { key: "customerId", value: orderData.customerId },
    },
  });

  if (completeflag || !queryResult) {
    const updateRes = await Table.updateOne(
      {
        restaurantId: orderData.restaurantId,
        "tables.orderId": req.body.orderId,
      },

      {
        $set: {
          "tables.$.isAvailable": true,
        },
        $unset: {
          "tables.$.orderId": 1,
          "tables.$.customerId": 1,
        },
      }
    );
  }
};

exports.changeOrderStatus = catchAsync(async (req, res, next) => {
  if (!req.body.orderId) {
    return next(new AppError("Missing Order Id!", 400));
  }
  const orderData = await Order.findOne({ _id: req.body.orderId });
  const restaurantDetail = await Restaurant.findOne({
    _id: orderData.restaurantId,
  });

  if (req.body.orderStatus === "rejected") {
    if (!req.body?.reason) {
      return next(new AppError("Please provide order cancel reason!", 400));
    }
    if (orderData.customerPreferences.preference === "Dine In") {
      await unlockTable(orderData, false, req, res, next);
    }

    await Order.findOneAndUpdate(
      { _id: req.body.orderId },
      { orderStatus: "rejected", reason: req.body.reason }
    );

    try {
      if (process.env.EMAIL_ORDER_STATUS === "true") {
        // send a mail to the customer that order has been placed successfully
        sendMail(
          orderData.customerEmail,
          "Order rejected by restaurant",
          `Your order has been rejected by the restaurant.

            Order Id: ${orderData.orderId}

            Order Amount: ${orderData.orderDetails[0].orderAmount}

            Order Date: ${new Date().toLocaleString()}

            Order Status: Rejected`
        );
      }

      if (process.env.SMS_ORDER_STATUS === "true") {
        // send an SMS to the customer that order has been placed successfully

        await axios.get(
          process.env.SMS_API_URL +
            orderData.orderId +
            "%7C" +
            "Rejected" +
            "%7C" +
            "&flash=0&numbers=" +
            orderData.customerPhoneNumber
        );
      }

      if (process.env.WHATSAPP_ORDER_STATUS === "true") {
        console.log(
          "orderData.customerPhoneNumber",
          orderData.customerPhoneNumber
        );

        console.log("whatsapp message", `Rejected by the restaurant.`);
        // send a WhatsApp message to the customer that order has been placed successfully
        whatsappHelper(
          restaurantDetail,
          orderData,
          "Rejected by the restaurant."
        );
      }
    } catch (error) {
      // print eroro
      console.log(error);
    }

    // send a mail to the restaurant that order has been placed successfully

    // send a mail to the restaurant that order has been rejected successfully by the restaurant

    sendMail(
      restaurantDetail?.restaurantEmail,
      "Order rejected successfully by restaurant",
      `You have rejected an order from ${orderData.customerName}.

            Order Id: ${orderData.orderId}

            Order Amount: ${orderData.orderDetails[0].orderAmount}

            Order Date: ${new Date().toLocaleString()}

            Order Status: Rejected`
    );
  } else if (req.body.orderStatus === "accepted") {
    if (!orderData) {
      return next(new AppError("Unable to find order!", 400));
    }
    if (!req.body?.preprationTime) {
      return next(new AppError("Please provide order prepration time!", 400));
    }
    await Order.findOneAndUpdate(
      { _id: req.body.orderId },
      {
        $set: {
          orderStatus:
            orderData.customerPreferences.preference === "Dine In"
              ? "processing"
              : "processing",
          cashOnDeliveryAvailable: req.body.cashOnDeliveryAvailable,
          paymentOnlineAvailable: req.body.paymentOnlineAvailable,
          "orderDetails.0.preprationTime": req.body.preprationTime,
        },
      },
      { new: true }
    );

    try {
      if (process.env.EMAIL_ORDER_STATUS === "true") {
        // send a mail to the customer that order has been placed successfully

        sendMail(
          orderData.customerEmail,

          "Order accepted by restaurant",

          `Your order has been accepted by the restaurant.

    Order Id: ${orderData.orderId}

    Order Amount: ${orderData.orderDetails[0].orderAmount}

    Order Date: ${new Date().toLocaleString()}

    Order Status: Accepted`
        );
      }

      try {
        if (process.env.SMS_ORDER_STATUS === "true") {
          // send an SMS to the customer that order has been placed successfully

          await axios.get(
            process.env.SMS_API_URL +
              req.body.orderId +
              "%7C" +
              "Accepted" +
              "%7C" +
              "&flash=0&numbers=" +
              orderData.customerPhoneNumber
          );
        }
      } catch (error) {
        console.log("error", error);
      }
      if (process.env.WHATSAPP_ORDER_STATUS === "true") {
        whatsappHelper(restaurantDetail, orderData, `Accepted by restaurant.`);
      }
    } catch (error) {
      console.log("error", error);
    }

    // send a mail to the restaurant that order has been accepted successfully

    sendMail(
      restaurantDetail?.restaurantEmail,
      "Order accepted by your restaurant",
      `You have accepted an order from ${orderData.customerName}.

    Order Id: ${orderData.orderId}

    Order Amount: ${orderData.orderDetails[0].orderAmount}

    Order Date: ${new Date().toLocaleString()}

    Order Status: Accepted`
    );

    if (orderData.customerPreferences.preference === "Dine In") {
      await dineInOrderHelper(orderData, req, res, next);
    }
  } else if (req.body.orderStatus === "completed") {
    await Order.findOneAndUpdate(
      { _id: req.body.orderId },
      { orderStatus: "completed" }
    );

    try {
      if (process.env.EMAIL_ORDER_STATUS === "true") {
        // send a mail to the customer that order has been placed successfully
        sendMail(
          orderData.customerEmail,
          "Order completed successfully",
          `Your order has been completed successfully.

            Order Id: ${orderData.orderId}

            Order Amount: ${orderData.orderDetails[0].orderAmount}

            Order Date: ${new Date().toLocaleString()}

            Order Status: Completed`
        );
      }

      if (process.env.SMS_ORDER_STATUS === "true") {
        // send an SMS to the customer that order has been placed successfully

        await axios.get(
          process.env.SMS_API_URL +
            req.body.orderId +
            "%7C" +
            "Completed" +
            "%7C" +
            "&flash=0&numbers=" +
            orderData.customerPhoneNumber
        );
      }

      if (process.env.WHATSAPP_ORDER_STATUS === "true") {
        whatsappHelper(restaurantDetail, orderData, `Completed.`);
      }
    } catch (error) {}

    if (orderData.customerPreferences.preference === "Dine In") {
      await unlockTable(orderData, true, req, res, next);
    }
  } else if (req.body.orderStatus === "processing") {
    // const paymentDetails = await fetchOrderById(
    //     req.paymentData.paymentKey,
    //     req.paymentData.paymentSecret,
    //     req.body.razorpay_order_id
    // );
    await Order.findOneAndUpdate(
      { _id: req.body.orderId },
      {
        $set: {
          orderStatus: "processing",
          payment_order_id: reqData["razorpay_order_id"],
          payment_transfer_id: reqData?.["razorpay_tranferData"]?.["id"] ?? "",
          payment_id: reqData["razorpay_payment_id"],
          payment_signature: reqData["razorpay_signature"],
          payment_time: paymentDetails.items[0]["created_at"],
          payment_method: paymentDetails.items[0]["method"],
          payment_amount: paymentDetails.items[0]["amount"] / 100,
        },
      }
    );
    // send a mail to the customer that order has been placed successfully
    try {
      whatsappHelper(restaurantDetail, orderData, `Aaccepted by restaurant.`);
    } catch {}
    sendMail(
      orderData.customerEmail,
      "Order accepted by restaurant",
      `Your order has been accepted by the restaurant.

            Order Id: ${orderData.orderId}

            Order Amount: ${orderData.orderDetails[0].orderAmount}

            Order Date: ${new Date().toLocaleString()}

            Order Status: Processing`
    );

    // send a mail to the restaurant that order has been placed successfully

    const restaurantDetail = await Restaurant.findOne({
      _id: orderData.restaurantId,
    });

    sendMail(
      restaurantDetail?.restaurantEmail,
      "Order accepted by restaurant",
      `You have accepted an order from ${orderData.customerName}.

            Order Id: ${orderData.orderId}

            Order Amount: ${orderData.orderDetails[0].orderAmount}

            Order Date: ${new Date().toLocaleString()}

            Order Status: Processing`
    );
  }

  res.status(200).json({
    status: "success",

    data: {
      message: `The order has been successfully ${req.body.orderStatus}.`,
    },
  });
});
const whatsappHelper = (restaurantData, orderData, message = "") => {
  if (restaurantData?.byPassAuth) {
    if (orderData["customerPreferences"]?.userDetail?.phoneNumber) {
      sendTrackOrderWhatsAppMessage(
        orderData["customerPreferences"]?.userDetail?.phoneNumber,
        `${message}`,
        `${orderData.orderId}`
      );
    }
  } else {
    sendCustomWhatsAppMessage(
      orderData.customerPhoneNumber,

      `${message}`
    );
  }
};
exports.changeOrderStatusByUser = catchAsync(async (req, res, next) => {
  if (!req.body.orderId) {
    return next(new AppError("Missing Order Id!", 400));
  }
  const orderData = await Order.findOne({ _id: req.body.orderId });
  if (!orderData) {
    return next(new AppError("Order Id is missing!"));
  }
  const reqData = {
    ...req.body,
  };
  const razorpayKeys = getRazorPayKey();
  const paymentDetails = await fetchOrderById(
    razorpayKeys["razorpay_key_id"],
    razorpayKeys["razorpay_key_secret"],
    req.body.razorpay_order_id
  );
  await Order.findOneAndUpdate(
    { _id: req.body.orderId },
    {
      $set: {
        orderStatus: "processing",
        payment_order_id: reqData["razorpay_order_id"],
        payment_transfer_id: reqData?.["razorpay_tranferData"]?.["id"] ?? "",
        payment_id: reqData["razorpay_payment_id"],
        payment_signature: reqData["razorpay_signature"],
        payment_time: paymentDetails.items[0]["created_at"],
        payment_method: paymentDetails.items[0]["method"],
        payment_amount: paymentDetails.items[0]["amount"] / 100,
      },
    }
  );

  // send a mail to the customer that order has been placed successfully
  sendMail(
    orderData.customerEmail,
    "payment done successfully",
    `Your order has been placed successfully after online payment.

        Order Id: ${orderData.orderId}

        Order Amount: ${orderData.orderDetails[0].orderAmount}

        Order Date: ${new Date().toLocaleString()}

        Order Status: Processing`
  );

  // send a mail to the restaurant that order has been placed successfully

  const restaurantDetail = await Restaurant.findOne({
    _id: orderData.restaurantId,
  });

  sendMail(
    restaurantDetail?.restaurantEmail,
    "Payment done successfully for an order",
    `You have received a new order from ${orderData.customerName}.

        Order Id: ${orderData.orderId}

        Order Amount: ${orderData.orderDetails[0].orderAmount}

        Order Date: ${new Date().toLocaleString()}

        Order Status: Processing`
  );

  res.status(200).json({
    status: "success",

    data: {
      message: `The order has been successfully processing.`,
    },
  });
});
exports.changeOrderStatusByUserForCashOnDelivery = catchAsync(
  async (req, res, next) => {
    if (!req.body?.orderId) {
      return next(new AppError("Missing Order Id!", 400));
    }
    const orderData = await Order.findOne({ _id: req.body.orderId });
    if (!orderData) {
      return next(new AppError("Order Id is missing!"));
    }
    const reqData = {
      ...req.body,
    };

    const customerDetail = await Customer.findOne({
      _id: orderData.customerId,
    });

    const restaurantDetail = await Restaurant.findOne({
      _id: orderData.restaurantId,
    });

    await Order.findOneAndUpdate(
      { _id: req.body.orderId },
      {
        $set: {
          orderStatus: "processing",

          payment_method: "Cash On Delivery",
        },
      }
    );
    // send a mail to the customer that order has been placed successfully after cash on delivery payment
    sendMail(
      customerDetail.email,
      "Order Placed Successfully",
      `The order has been successfully placed by choosing cash on delivery payment method.

            Order Id: ${orderData.orderId}

            Order Amount: ${orderData.orderDetails[0].orderAmount}

            Order Date: ${new Date().toLocaleString()}

            Order Status: Processing`
    );
    // send a mail to the restaurant that order has been placed successfully

    sendMail(
      restaurantDetail?.restaurantEmail,
      "Payment done successfully for an order",
      `You have received a new order from ${customerDetail.name}.

            Order Id: ${orderData.orderId}

            Order Amount: ${orderData.orderDetails[0].orderAmount}

            Order Date: ${new Date().toLocaleString()}

            Order Status: Processing`
    );

    res.status(200).json({
      status: "success",

      data: {
        message: `The order has been successfully processing.`,
      },
    });
  }
);

exports.generateBill = catchAsync(async (req, res, next) => {
  if (!req.params.orderId) {
    return next(new AppError("Missing Order Id!", 400));
  }

  try {
    const orderData = await Order.findOne({ _id: req.params.orderId });

    if (!orderData) {
      return next(new AppError("Order Data is missing!"));
    }

    const restaurantDetail = await Restaurant.findOne({
      _id: orderData.restaurantId,
    });

    const customerDetail = await Customer.findOne({
      _id: orderData.customerId,
    });

    const orderAmount = orderData.orderDetails.reduce(
      (total, detail) => total + detail.orderAmount,
      0
    );

    products = [];

    // for (let i = 0; i < orderData.orderDetails[0].orderSummary.length; i++) {
    //     products.push({
    //         quantity: orderData.orderDetails.orderSummary[i].dishQuantity,
    //         description: orderData.orderDetails.orderSummary[i].dishName,
    //         // "tax-rate": 6, // Assuming a constant tax rate for all products
    //         price: orderData.orderDetails.orderSummary[i].priceOneItem,
    //     });
    // }

    for (let i = 0; i < orderData.orderDetails.length; i++) {
      for (let j = 0; j < orderData.orderDetails[i].orderSummary.length; j++) {
        products.push({
          quantity: orderData.orderDetails[i].orderSummary[j].dishQuantity,
          description: orderData.orderDetails[i].orderSummary[j].dishName,
          "tax-rate": 0, // Assuming a constant tax rate for all products
          price: orderData.orderDetails[i].orderSummary[j].priceOneItem,
        });
      }
    }

    // Define dynamic data for the invoice
    const data = {
      customize: {
        // Customize enables you to provide your own templates
        // Please review the documentation for instructions and examples
        // "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
      },
      images: {
        // The logo on top of your invoice
        logo: "https://public.easyinvoice.cloud/img/logo_en_original.png",
        // The invoice background
        // background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      },
      sender: {
        company: restaurantDetail.restaurantName,
        address: restaurantDetail.address.street,
        city: restaurantDetail.address.city,
        state: restaurantDetail.address.state,
        pinCode: restaurantDetail.address.pinCode,
      },
      client: {
        company: customerDetail.name,
        phoneNumber: customerDetail.phoneNumber,
      },
      information: {
        number: orderData.orderId,
        date: orderData.orderDate,
      },
      // products: orderData.orderDetails.map((detail) => ({
      //     quantity: detail.dishQuantity,
      //     description: detail.dishName,
      //     "tax-rate": 6, // Assuming a constant tax rate for all products
      //     price: detail.totalPrice,
      // })),

      products: products,

      settings: {
        currency: "INR",
      },
    };

    const easyInvoice = await easyinvoice.createInvoice(data);

    res.status(200).json({
      status: "success",
      data: {
        invoiceData: easyInvoice,
        totalAmount: orderAmount,
      },
    });
  } catch (error) {
    return next(
      new AppError("An error occurred while generating the invoice.", 500)
    );
  }
});

exports.getRestaurantWithRoomService = catchAsync(async (req, res, next) => {
  const result = await Room.find({
    restaurantId: { $exists: true },
  }).populate({ path: "restaurantId", select: "restaurantName _id" });
  console.log(result);
  res.status(200).json({
    status: "success",
    data: {
      restaurantData: result,
    },
  });
});

exports.getOrderwithPaymentOrderId = catchAsync(async (req, res, next) => {
  if (!req.params?.orderId) {
    return next(new AppError("Please provide order Id!", 400));
  }
  const result = await Order.findOne({
    payment_order_id: req.params?.orderId,
  }).lean();
  if (!result) {
    return next(
      new AppError("Unable to find order for payment order id!", 400)
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      orderData: result,
    },
  });
});
exports.getOrderwithOrderId = catchAsync(async (req, res, next) => {
  if (!req.params?.orderId) {
    return next(new AppError("Please provide order Id!", 400));
  }
  const result = await Order.findOne({ orderId: req.params.orderId }).lean();
  if (!result) {
    return next(new AppError("Unable to find order!", 400));
  }
  res.status(200).json({
    status: "success",
    data: {
      orderData: result,
    },
  });
});
exports.deleteOrderById = catchAsync(async (req, res, next) => {
  if (!req.params?.orderId) {
    return next(new AppError("Please provide order Id!", 400));
  }
  const result = await Order.deleteOne({ _id: req.params.orderId }).lean();
  if (!result) {
    return next(new AppError("Unable to find order!", 400));
  }
  res.status(200).json({
    status: "success",
    data: {
      message: "Record deleted successfully.",
    },
  });
});

// Customer name, restaurant name! Room /name

exports.getOrderwithRestaurantNameCustomerNameRoomName = catchAsync(
  async (req, res, next) => {
    if (!req.body?.customerName) {
      return next(new AppError("Please provide customer name!", 400));
    }
    if (!req.body?.restaurnatId) {
      return next(new AppError("Please provide restaurant name!", 400));
    }
    if (!req.body?.roomName) {
      return next(new AppError("Please provide room name!", 400));
    }

    const result = await Order.findOne({
      restaurantId: req.body.restaurnatId,
      "customerPreferences.value": {
        $regex: new RegExp(req.body.roomName, "i"),
      },
      customerName: { $regex: new RegExp(req.body.customerName, "i") },
    });

    if (!result) {
      return next(new AppError("Unable to find order!", 400));
    }
    res.status(200).json({
      status: "success",
      data: {
        orderData: result,
      },
    });
  }
);
