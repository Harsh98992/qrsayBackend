const AppError = require("../helpers/appError");
const catchAsync = require("../helpers/catchAsync");
const { checkDineInTableAvailability } = require("../helpers/dineInHelper");
const generateOrderID = require("../helpers/orderIdGenerator");
const { fetchOrderById } = require("../helpers/razorPayHelper");
const easyinvoice = require("easyinvoice");
const sendMail = require("../helpers/email");

const Order = require("../models/OrderModel");
const Table = require("../models/tableModel");
const io = require("../server"); // Make sure to import the correct 'io' object
const Restaurant = require("../models/restaurantModel");
const Customer = require("../models/CustomerModel");
const sendCustomWhatsAppMessage = require("../helpers/whatsapp");

exports.placeOrder = catchAsync(async (req, res, next) => {
    //   console.log(req.body);
    const reqData = {
        ...req.body,
    };
    // const paymentDetails = await fetchOrderById(
    //     req.paymentData.paymentKey,
    //     req.paymentData.paymentSecret,
    //     req.body.razorpay_order_id
    // );
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
    const orderId = generateOrderID();
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
    const savedData = {
        orderId: orderId,
        customerId: req.user["_id"],
        customerName: req.user["name"],
        customerEmail: req.user["email"],
        customerPhoneNumber: req.user["phoneNumber"],
        customerPreferences: reqData["customerPreferences"],
        orderDetails: orderData,
        restaurantId: reqData["restaurantId"],
        // payment_order_id: reqData["razorpay_order_id"],
        // payment_id: reqData["razorpay_payment_id"],
        // payment_signature: reqData["razorpay_signature"],
        // payment_time: paymentDetails.items[0]["created_at"],
        // payment_method: paymentDetails.items[0]["method"],
        // payment_amount: paymentDetails.items[0]["amount"],
    };
    await Order.create(savedData);

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

            sendCustomWhatsAppMessage(
                req.user["phoneNumber"],
                `Your order  has been placed Successfully. Please verify the current status of your order at https://qrsay.com/orders.`
            );
        }
    } catch (error) {
        console.log(error);
    }

    // send a mail to the restaurant that order has been placed successfully

    const restaurantDetail = await Restaurant.findOne({
        _id: reqData["restaurantId"],
    });
    sendMail(
        restaurantDetail.email,
        "New Order Received",
        `You have received a new order from ${req.user.name}.

        Order Id: ${orderId}

        Order Amount: ${reqData["orderAmount"]}

        Order Date: ${new Date().toLocaleString()}

        Order Status: Pending`
    );

    res.status(200).json({
        status: "success",
        data: {
            message:
                "Order placed successfully! Thank you for your purchase. You will soon receive a confirmation once your order is verified by the restaurant.",

            savedData: savedData,
        },
    });
});

exports.getRestaurantOrdersByStatus = catchAsync(async (req, res, next) => {
    if (!req.body?.orderStatus) {
        return next(new AppError("Please provide order status!", 400));
    }
    const statusArray = req.body.orderStatus;

    const data = await Order.find({
        restaurantId: req.user.restaurantKey,
        orderStatus: { $in: statusArray },
    });
    res.status(200).json({
        status: "success",

        data: {
            orderData: data,
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
    if (!req.body?.orderId) {
        return next(new AppError("Missing Order Id!", 400));
    }
    const orderData = await Order.findOne({ _id: req.body.orderId });
    if (req.body.orderStatus === "rejected") {
        if (!req.body?.reason) {
            return next(
                new AppError("Please provide order cancel reason!", 400)
            );
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
                        orderId +
                        "%7C" +
                        "Rejected" +
                        "%7C" +
                        "&flash=0&numbers=" +
                        orderData.customerPhoneNumber
                );
            }

            if (process.env.WHATSAPP_ORDER_STATUS === "true") {
                // send a WhatsApp message to the customer that order has been placed successfully

                sendCustomWhatsAppMessage(
                    orderData.customerPhoneNumber,

                    `Your order  has been rejected by the restaurant. Please verify the current status of your order at https://qrsay.com/orders.`
                );
            }
        } catch (error) {
            console.log(error);
        }

        // send a mail to the restaurant that order has been placed successfully

        // send a mail to the restaurant that order has been rejected successfully by the restaurant

        const restaurantDetail = await Restaurant.findOne({
            _id: orderData.restaurantId,
        });

        sendMail(
            restaurantDetail.email,
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
            return next(
                new AppError("Please provide order prepration time!", 400)
            );
        }
        await Order.findOneAndUpdate(
            { _id: req.body.orderId },
            {
                $set: {
                    orderStatus:
                        orderData.customerPreferences.preference === "Dine In"
                            ? "processing"
                            : "pendingPayment",
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

            if (process.env.SMS_ORDER_STATUS === "true") {
                // send an SMS to the customer that order has been placed successfully

                await axios.get(
                    process.env.SMS_API_URL +
                        orderId +
                        "%7C" +
                        "Accepted" +
                        "%7C" +
                        "&flash=0&numbers=" +
                        orderData.customerPhoneNumber
                );
            }

            if (process.env.WHATSAPP_ORDER_STATUS === "true") {
                sendCustomWhatsAppMessage(
                    orderData.customerPhoneNumber,

                    `Your order  has been accepted by the restaurant. Please verify the current status of your order at https://qrsay.com/orders.`
                );
            }
        } catch (error) {
            console.log(error);
        }

        // send a mail to the restaurant that order has been accepted successfully

        const restaurantDetail = await Restaurant.findOne({
            _id: orderData.restaurantId,
        });

        sendMail(
            restaurantDetail.email,
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
                        orderId +
                        "%7C" +
                        "Completed" +
                        "%7C" +
                        "&flash=0&numbers=" +
                        orderData.customerPhoneNumber
                );
            }

            if (process.env.WHATSAPP_ORDER_STATUS === "true") {
                sendCustomWhatsAppMessage(
                    orderData.customerPhoneNumber,

                    `Your order  has been completed successfully. Please verify the current status of your order at https://qrsay.com/orders.`
                );
            }
        } catch (error) {
            console.log(error);
        }

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
                    payment_id: reqData["razorpay_payment_id"],
                    payment_signature: reqData["razorpay_signature"],
                    payment_time: paymentDetails.items[0]["created_at"],
                    payment_method: paymentDetails.items[0]["method"],
                    payment_amount: paymentDetails.items[0]["amount"],
                },
            }
        );
        // send a mail to the customer that order has been placed successfully
        try {
            sendCustomWhatsAppMessage(
                orderData.customerPhoneNumber,
                `Your order  has been accepted by the restaurant. Please verify the current status of your order at https://qrsay.com/orders.`
            );
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
            restaurantDetail.email,
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
exports.changeOrderStatusByUser = catchAsync(async (req, res, next) => {
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
    const paymentDetails = await fetchOrderById(
        process.env["razorpay_key_id"],
        process.env["razorpay_key_secret"],
        req.body.razorpay_order_id
    );
    await Order.findOneAndUpdate(
        { _id: req.body.orderId },
        {
            $set: {
                orderStatus: "processing",
                payment_order_id: reqData["razorpay_order_id"],
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
        restaurantDetail.email,
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
            restaurantDetail.email,
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
            for (
                let j = 0;
                j < orderData.orderDetails[i].orderSummary.length;
                j++
            ) {
                products.push({
                    quantity:
                        orderData.orderDetails[i].orderSummary[j].dishQuantity,
                    description:
                        orderData.orderDetails[i].orderSummary[j].dishName,
                    "tax-rate": 0, // Assuming a constant tax rate for all products
                    price: orderData.orderDetails[i].orderSummary[j]
                        .priceOneItem,
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
        console.log(error);
        return next(
            new AppError("An error occurred while generating the invoice.", 500)
        );
    }
});
