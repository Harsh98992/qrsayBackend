const axios = require("axios");

const sendWhatsAppMessage = async (phoneNumber, otp) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer EAAgP3l9SczIBO6cdu9cAuuUVcaD1bYeAQlgIArbK5AimmiL6id0ZBvg6MZBRn9Moetojkda23lzegHp1nhituSmdZBKMw9vZBWKWZAoZCto18yKN8wZAyZBr38scT8ZAsDaFHVUTelArRx9xNcTFQcMM8Vdkq4uyM5b7ABnG9lxXwyUNXhx7pPiiZA7XdMPRD4ExFQ",
    },
  };
  const data = {
    messaging_product: "whatsapp",
    to: "91" + phoneNumber,
    type: "template",

    template: {
      name: "otp_",
      language: {
        code: "en",
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: `*${otp}*`,
            },
          ],
        },
      ],
    },
  };
  const res = await axios.post(
    "https://graph.facebook.com/v17.0/207695905761327/messages",
    data,
    config
  );

  return res;
};
const sendCustomWhatsAppMessage = async (phoneNumber, message,restaurant) => {
  if (process.env.NODE_ENV ) {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer EAAgP3l9SczIBO6cdu9cAuuUVcaD1bYeAQlgIArbK5AimmiL6id0ZBvg6MZBRn9Moetojkda23lzegHp1nhituSmdZBKMw9vZBWKWZAoZCto18yKN8wZAyZBr38scT8ZAsDaFHVUTelArRx9xNcTFQcMM8Vdkq4uyM5b7ABnG9lxXwyUNXhx7pPiiZA7XdMPRD4ExFQ",
        },
      };
      const data = {
        messaging_product: "whatsapp",
        to: "91" + phoneNumber,
        type: "template",

        template: {
          name: "order_status_update",
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: `${message}`,
                },
                {
                  type: "text",
                  text: toTitleCase(`${restaurant?.restaurantName}`),
                },
                {
                  type: "text",
                  text: `https://qrsay.com/restaurant?detail=${restaurant?.restaurantUrl}`,
                },
              ],
            },
          ],
        },
      };
      const res = await axios.post(
        "https://graph.facebook.com/v17.0/207695905761327/messages",
        data,
        config
      );

      return res;
    } catch {}
  }
};
const sendTrackOrderWhatsAppMessage = async (phoneNumber, message, orderId,restaurant) => {
  if (process.env.NODE_ENV ) {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer EAAgP3l9SczIBO6cdu9cAuuUVcaD1bYeAQlgIArbK5AimmiL6id0ZBvg6MZBRn9Moetojkda23lzegHp1nhituSmdZBKMw9vZBWKWZAoZCto18yKN8wZAyZBr38scT8ZAsDaFHVUTelArRx9xNcTFQcMM8Vdkq4uyM5b7ABnG9lxXwyUNXhx7pPiiZA7XdMPRD4ExFQ",
        },
      };
      const data = {
        messaging_product: "whatsapp",
        to: "91" + phoneNumber,
        type: "template",

        template: {
          name: "shipment_confirmation_2",
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: `${message}`,
                },
                {
                  type: "text",
                  text: `${orderId}`,
                },
                {
                  type: "text",
                  text: toTitleCase(`${restaurant?.restaurantName}`),
                },
                {
                  type: "text",
                  text: `https://qrsay.com/restaurant?detail=${restaurant?.restaurantUrl}`,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: `${orderId}`,
                },
              ],
            },
          ],
        },
      };
      const res = await axios.post(
        "https://graph.facebook.com/v17.0/207695905761327/messages",
        data,
        config
      );

      return res;
    } catch (e) {}
  }
};
function toTitleCase(str) {
  return str.split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

// Example usage


function dishNameWithExtra(order) {
  let orderStr = "";
  if (order?.itemSizeSelected?.size) {
    orderStr += ` [ Size:-${order.itemSizeSelected.size} ] `;
  }
  if (order.dishChoicesSelected && order.dishChoicesSelected?.length) {
    let str = "";
    for (const data of order.dishChoicesSelected) {
      for (const choice of data.choicesSelected) {
        str += `${choice.choiceName} ,`;
      }
    }
    const res = str.slice(0, -1);
    orderStr += `[ Choices:- ${res}] `;
  }

  if (order.extraSelected && order.extraSelected?.length) {
    let str = "";
    for (const data of order.extraSelected) {
      for (const addon of data.addOnsSelected) {
        str += `${addon.addOnName} ,`;
      }
    }
    const res = str.slice(0, -1);
    orderStr += `[ Extras:- ${res}] `;
  }
  return orderStr;
}
const sendRestaurantOrderMessage = async (phoneNumber, orderData) => {
  console.log("phoneNumber", phoneNumber);
  if (process.env.NODE_ENV) {
    try {
      let orderTypeStr = "";
      if (
        orderData.customerPreferences.preference.toLowerCase() ===
        "room service"
      ) {
        orderTypeStr = "Room Number :- " + orderData.customerPreferences.value;
      } else if (
        orderData.customerPreferences.preference.toLowerCase() === "delivery"
      ) {
        orderTypeStr =
          "Address :- " + orderData.customerPreferences.value.address;
      } else if (
        orderData.customerPreferences.preference.toLowerCase() === "dine in"
      ) {
        orderTypeStr = "Table Number :- " + orderData.customerPreferences.value;
      } else if (
        orderData.customerPreferences.preference.toLowerCase() === "dining"
      ) {
        orderTypeStr = "Table Number :- " + orderData.customerPreferences.value;
      } else if (
        orderData.customerPreferences.preference.toLowerCase() === "take away"
      ) {
        orderTypeStr = "Take Away :- " + orderData.customerPreferences.value;
      } else if (
        orderData.customerPreferences.preference.toLowerCase() === "grab and go"
      ) {
        orderTypeStr = "Take Away :- " + orderData.customerPreferences.value;
      } else if (
        orderData.customerPreferences.preference.toLowerCase() ===
        "schedule dining"
      ) {
        orderTypeStr =
          "Schedule Dining :- " + orderData.customerPreferences.value;
      }

      if (
        orderData?.customerPreferences?.preference?.toLowerCase() === "dine in"
      ) {
        for (const [index, order] of orderData.orderDetails.entries()) {
          if (index > 0) {
            orderData.orderDetails[0]["orderSummary"].push(
              ...order["orderSummary"]
            );
            orderData.orderDetails[0]["orderAmount"] += order["orderAmount"];
            orderData.orderDetails[0]["gstAmount"] += order["gstAmount"];
            orderData.orderDetails[0]["deliveryAmount"] +=
              order["deliveryAmount"];
            orderData.orderDetails[0]["discountAmount"] +=
              order["discountAmount"];
          }
        }
      }
      let dishStr = "";
      let count = 1;
      for (const order of orderData.orderDetails[0].orderSummary) {
        dishStr += `${count}. ${order.dishName}`;
        count += 1;
        let orderStr = dishNameWithExtra(order);

        dishStr += `${orderStr} `;
        dishStr += ` = ${order.dishQuantity};\\n`;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer EAAgP3l9SczIBO6cdu9cAuuUVcaD1bYeAQlgIArbK5AimmiL6id0ZBvg6MZBRn9Moetojkda23lzegHp1nhituSmdZBKMw9vZBWKWZAoZCto18yKN8wZAyZBr38scT8ZAsDaFHVUTelArRx9xNcTFQcMM8Vdkq4uyM5b7ABnG9lxXwyUNXhx7pPiiZA7XdMPRD4ExFQ",
        },
      };
      const data = {
        messaging_product: "whatsapp",
        to: "91" + phoneNumber,
        type: "template",

        template: {
          name: "new_order_received",
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: `${orderData?.customerName ?? ""}`,
                },
                {
                  type: "text",
                  text: `${orderData?.orderId ?? ""}`,
                },
                {
                  type: "text",
                  text: `${orderData?.customerName ?? ""}`,
                },
                {
                  type: "text",
                  text: `${orderData?.customerPhoneNumber ?? ""}`,
                },
                {
                  type: "text",
                  text: `${orderData?.customerPreferences?.preference ?? ""}`,
                },
                {
                  type: "text",
                  text: `${orderTypeStr ?? ""}`,
                },
                {
                  type: "text",
                  text: `${dishStr ?? ""}`,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: `${orderData.orderId}`,
                },
              ],
            },
          ],
        },
      };
      console.log("message sended")
      const res = await axios.post(
        "https://graph.facebook.com/v17.0/207695905761327/messages",
        data,
        config
      );

      return res;
    } catch (e) {
      console.log(e, "err");
    }
  }
};
module.exports = {
  sendWhatsAppMessage,
  sendCustomWhatsAppMessage,
  sendTrackOrderWhatsAppMessage,
  sendRestaurantOrderMessage,
};
