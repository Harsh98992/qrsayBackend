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
const sendCustomWhatsAppMessage = async (phoneNumber, message) => {
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
};
const sendTrackOrderWhatsAppMessage = async (phoneNumber, message, orderId) => {
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
};
const sendRestaurantOrderMessage = async (phoneNumber, orderData) => {

  try {
  let orderTypeStr = "";
  if (
    orderData.customerPreferences.preference.toLowerCase() === "room service"
  ) {
    orderTypeStr = "Room Number :- " + orderData.customerPreferences.value;
  } else if (
    orderData.customerPreferences.preference.toLowerCase() === "delivery"
  ) {
    orderTypeStr = "Address :- " + orderData.customerPreferences.value.address;
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
    orderData.customerPreferences.preference.toLowerCase() === "schedule dining"
  ) {
    orderTypeStr = "Schedule Dining :- " + orderData.customerPreferences.value;
  }

  if (orderData?.customerPreferences?.preference?.toLowerCase() === "dine in") {
    for (const [index, order] of orderData.orderDatas.entries()) {
      if (index > 0) {
        orderData.orderDatas[0]["orderSummary"].push(...order["orderSummary"]);
        orderData.orderDatas[0]["orderAmount"] += order["orderAmount"];
        orderData.orderDatas[0]["gstAmount"] += order["gstAmount"];
        orderData.orderDatas[0]["deliveryAmount"] += order["deliveryAmount"];
        orderData.orderDatas[0]["discountAmount"] += order["discountAmount"];
      }
    }
  }
  let dishStr = "";
  let count=1
  for (const order of orderData.orderDetails[0].orderSummary) {
    dishStr += `${count}. ${order.dishName}`;
    count+=1;
    var checkIfFirst = true;
    if (order.extraSelected && order.extraSelected.length) {
      dishStr += "( ";
      for (const extra of order.extraSelected) {
        if (checkIfFirst) {
          dishStr += `with ${extra.addOnDisplayName}(${extra.addOnsSelected[0].addOnName})`;
          checkIfFirst = false;
        } else {
          dishStr += `and ${extra.addOnDisplayName}(${extra.addOnsSelected[0].addOnName})`;
        }
      }
      dishStr += " )";
    }
    dishStr += ` = ${order.dishQuantity};\\n`;
  }
  console.log(dishStr);
  
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
        name: "orderrecivetest",
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
};
module.exports = {
  sendWhatsAppMessage,
  sendCustomWhatsAppMessage,
  sendTrackOrderWhatsAppMessage,
  sendRestaurantOrderMessage,
};
