const escpos = require("escpos");
const { prependListener } = require("../models/promoCodeModel");
// install escpos-usb adapter module manually
escpos.USB = require("escpos-usb");
var _ = require("lodash");
// Select the adapter based on your printer type
const device = new escpos.USB();
const printer = new escpos.Printer(device);
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');

// encoding is optional
const generateBillHelper = async (
  orderData,
  restaurantDetail,
  kotFlag = false
) => {
  try {
    //  let printer=null;

    device.open(function (error) {
      let orderTypeStr = "";
      const options = { year: "numeric", month: "short", day: "numeric" };
      // Please convert the above style of the bill code into the typescript code for making the print content of the bill on the print window
      const orderDetail = _.cloneDeep(orderData);
      if (
        orderDetail.customerPreferences.preference.toLowerCase() ===
        "room service"
      ) {
        orderTypeStr =
          "Room Number :- " + orderDetail.customerPreferences.value;
      } else if (
        orderDetail.customerPreferences.preference.toLowerCase() === "delivery"
      ) {
        orderTypeStr =
          "Address :- " + orderDetail.customerPreferences.value.address;
      } else if (
        orderDetail.customerPreferences.preference.toLowerCase() === "dine in"
      ) {
        orderTypeStr =
          "Table Number :- " + orderDetail.customerPreferences.value;
      } else if (
        orderDetail.customerPreferences.preference.toLowerCase() === "dining"
      ) {
        orderTypeStr =
          "Table Number :- " + orderDetail.customerPreferences.value;
      } else if (
        orderDetail.customerPreferences.preference.toLowerCase() === "take away"
      ) {
        orderTypeStr = "Take Away :- " + orderDetail.customerPreferences.value;
      } else if (
        orderDetail.customerPreferences.preference.toLowerCase() ===
        "grab and go"
      ) {
        orderTypeStr = "Take Away :- " + orderDetail.customerPreferences.value;
      } else if (
        orderDetail.customerPreferences.preference.toLowerCase() ===
        "schedule dining"
      ) {
        orderTypeStr =
          "Schedule Dining :- " + orderDetail.customerPreferences.value;
      }

      if (
        orderDetail?.customerPreferences?.preference?.toLowerCase() ===
        "dine in"
      ) {
        for (const [index, order] of orderData.orderDetails.entries()) {
          if (index > 0) {
            orderDetail.orderDetails[0]["orderSummary"].push(
              ...order["orderSummary"]
            );
            orderDetail.orderDetails[0]["orderAmount"] += order["orderAmount"];
            orderDetail.orderDetails[0]["gstAmount"] += order["gstAmount"];
            orderDetail.orderDetails[0]["deliveryAmount"] +=
              order["deliveryAmount"];
            orderDetail.orderDetails[0]["discountAmount"] +=
              order["discountAmount"];
          }
        }
      }
      printer
        .font("a")
        .align("ct")

        .size(0, 0)
        .text(`${restaurantDetail.restaurantName?.toUpperCase()}`);
      if (!kotFlag) {
        printer
          .text(
            `${restaurantDetail.address.street?.toUpperCase()} ,${restaurantDetail.address.city?.toUpperCase()},${restaurantDetail.address.state.toUpperCase()},${
              restaurantDetail.address.pinCode
            }`
          )
          .text(
            `${
              restaurantDetail.gstNumber
                ? "GST Number:- " + restaurantDetail.gstNumber
                : ""
            }`
          );
      }
      printer
        .text(
          `${
            orderDetail.customerPreferences.preference.toLowerCase() ===
            "grab and go"
              ? "Take away"
              : orderDetail.customerPreferences.preference
          }`
        )
        .text(`${orderTypeStr}`);

      printer.marginBottom(10);
      printer.align("LT");
      printer.tableCustom([
        {
          text: `${new Date(orderDetail.orderDate).toLocaleDateString(
            "en-US",
            options
          )}`,
          align: "LEFT",
        },
        {
          text: `${new Date(orderDetail.orderDate).toLocaleTimeString()}`,
          align: "RIGHT",
        },
      ]);

      printer.align("LT");
      printer.text(`Order ID: ${orderDetail.orderId}`);
      if (!kotFlag) {
        printer.text(
          `Payment Status: : ${
            orderDetail.payment_method
              ? "Paid via " + orderDetail.payment_method
              : "Pending"
          }`
        );
      }
      printer.text(`${orderDetail.customerName}`);
      if (!kotFlag) {
        printer.text(
          `${orderDetail.customerPhoneNumber} - ${orderDetail.customerEmail}`
        );
      } else {
        printer.text(
          `Cooking Instructions: ${
            orderDetail?.orderDetails?.[0].cookingInstruction ?? ""
          }`
        );
      }
      if (!kotFlag) {
        printer.marginBottom(10).drawLine();
        printer
          .tableCustom(
            [
              { text: `Items`, align: "LEFT", width: 0.46 },
              { text: `Price`, align: "LEFT", width: 0.18 },
              { text: `Qty`, align: "CENTER", width: 0.18 },
              { text: `Amount`, align: "LEFT", width: 0.18 },
            ],
            { encoding: "cp857", size: [1, 1] } // Optional
          )
          .drawLine();
        for (const order of orderDetail.orderDetails[0].orderSummary) {
          const dishName = order.dishName;
          var checkIfFirst = true;
          if (order.extraSelected && order.extraSelected.length) {
            for (const extra of order.extraSelected) {
              if (checkIfFirst) {
                dishName += ` with ${extra.addOnDisplayName}(${extra.addOnsSelected[0].addOnName})`;
                checkIfFirst = false;
              } else {
                dishName += ` and ${extra.addOnDisplayName}(${extra.addOnsSelected[0].addOnName})`;
              }
            }
          }
          printer.tableCustom(
            [
              { text: `${dishName}`, align: "LEFT", width: 0.46 },
              { text: `${order.priceOneItem}`, align: "CENTER", width: 0.18 },
              { text: `${order.dishQuantity}`, align: "CENTER", width: 0.18 },
              { text: `${order.totalPrice}`, align: "CENTER", width: 0.18 },
            ],
            { encoding: "cp857", size: [1, 1] } // Optional
          );
        }
      } else {
        printer.marginBottom(10)
        .drawLine().tableCustom(
          [
            { text: `Items`, align: "LEFT", width: 0.80 },

            { text: `Qty`, align: "RIGHT",width: 0.20 },
          ],
          { encoding: "cp857", size: [1, 1] } // Optional
        ).drawLine()
        for (const order of orderDetail.orderDetails[0].orderSummary) {
          const dishName = order.dishName;
          var checkIfFirst = true;
          if (order.extraSelected && order.extraSelected.length) {
            for (const extra of order.extraSelected) {
              if (checkIfFirst) {
                dishName += ` with ${extra.addOnDisplayName}(${extra.addOnsSelected[0].addOnName})`;
                checkIfFirst = false;
              } else {
                dishName += ` and ${extra.addOnDisplayName}(${extra.addOnsSelected[0].addOnName})`;
              }
            }
          }
          printer.tableCustom(
            [
              { text: `${dishName}`, align: "LEFT", width: 0.80  },

              { text: `${order.dishQuantity}`, align: "RIGHT",width: 0.20 },
            ],
            { encoding: "cp857", size: [1, 1] } // Optional
          );
        }
      }
      printer.drawLine();
      //printer.alignLeft();
      printer.text(
        `Total Quantity: ${orderDetail.orderDetails[0].orderSummary.length}`
      );
      if (!kotFlag) {
        if (restaurantDetail.isGstApplicable) {
          printer.tableCustom([
            { text: "Net Amt. ", align: "LEFT" },
            {
              text: `${orderDetail.orderDetails[0].orderAmount}`,
              align: "RIGHT",
            },
          ]);
          printer.tableCustom([
            {
              text: `Tax(${
                orderDetail.customerPreferences.preference.toLowerCase() ===
                "dining"
                  ? restaurantDetail.customDineInGSTPercentage
                  : restaurantDetail.customGSTPercentage
              }%)`,
              align: "LEFT",
            },
            {
              text: `${orderDetail.orderDetails[0].gstAmount}`,
              align: "RIGHT",
            },
          ]);
        }
        printer.tableCustom([
          { text: "Total Amt.", align: "LEFT" },
          {
            text: `${
              orderDetail.orderDetails[0].orderAmount +
              orderDetail.orderDetails[0].gstAmount
            }`,
            align: "RIGHT",
          },
        ]);
        printer.drawLine();
        if (restaurantDetail.isGstApplicable) {
          printer.println("Tax Summary");

          printer
            .drawLine()
            .table([
              `Tax(${
                orderDetail.customerPreferences.preference.toLowerCase() ===
                "dining"
                  ? restaurantDetail.customDineInGSTPercentage
                  : restaurantDetail.customGSTPercentage
              }%)`,
              "Basic Amt.",
              "Tax Amt.",
            ])
            .drawLine()
            .tableCustom(
              [
                {
                  text: `CGST(${
                    orderDetail.customerPreferences.preference.toLowerCase() ===
                    "dining"
                      ? restaurantDetail.customDineInGSTPercentage / 2
                      : restaurantDetail.customGSTPercentage / 2
                  }%)`,
                  align: "LEFT",
                },
                {
                  text: `${orderDetail.orderDetails[0].orderAmount}`,
                  align: "LEFT",
                },
                {
                  text: `${orderDetail.orderDetails[0].gstAmount / 2}`,
                  align: "LEFT",
                },
              ],
              { encoding: "cp857", size: [1, 1] } // Optional
            )
            .tableCustom(
              [
                {
                  text: `SGST(${
                    orderDetail.customerPreferences.preference.toLowerCase() ===
                    "dining"
                      ? restaurantDetail.customDineInGSTPercentage / 2
                      : restaurantDetail.customGSTPercentage / 2
                  }%)`,
                  align: "LEFT",
                },
                {
                  text: `${orderDetail.orderDetails[0].orderAmount}`,
                  align: "LEFT",
                },
                {
                  text: `${orderDetail.orderDetails[0].gstAmount / 2}`,
                  align: "LEFT",
                },
              ],
              { encoding: "cp857", size: [1, 1] } // Optional
            );
        }
        printer
          .drawLine()
          .align("ct")

          .text(
            `Payable Amt.: ${
              orderDetail.orderDetails[0].orderAmount +
              orderDetail.orderDetails[0].gstAmount
            }`
          )

          .text("Thanks for your visit !!!")
          .text("Have a good day");
      }
      printer.cut();
      printer.close();
      return true;
    });
  } catch (err) {
    console.log(err);
    return false;
  }
};
module.exports = {
  generateBillHelper,
};
