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
  const res = await axios.post("https://graph.facebook.com/v17.0/207695905761327/messages", data, config);

  return res;
};
const sendCustomWhatsAppMessage = async (phoneNumber, message) => {
  try {

    console.log("running sendCustomWhatsAppMessage");
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
    const res = await axios.post("https://graph.facebook.com/v17.0/207695905761327/messages", data, config);

    return res;
  } catch {}
};
module.exports ={ sendWhatsAppMessage,sendCustomWhatsAppMessage};
