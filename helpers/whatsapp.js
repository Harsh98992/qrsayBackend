const axios = require("axios");


// const sendWhatsAppMessage = async (phoneNumber, otp) => {
//     const config = {
//         headers: {
//             "Content-Type": "application/json",
//             Authorization:
//                 "Bearer EAANSoaeKzUMBOz1tKdjf5iZAVjtBJaUDR2I6uIZARQjMxUAoGFLDnFoTnaKFIBCXHe8xiaQnAZADfE2lZBnoVhjKj995qk7XOCO89WWGVw87Rd2oqrAEjlQaXIWgLipFZB9t5dCcFwLItEQ2GXfutDv5v5ggjbPgZBf7XcG6GKjxnNldmKpiRq5tWViSAIopxN",
//         },
//     };
//     const data = {
//         messaging_product: "whatsapp",
//         to: "91" + phoneNumber,
//         type: "template",

//         template: {
//             name: "otp_ ",
//             language: {
//                 code: "en",
//             },
//             components: [
//                 {
//                     type: "body",
//                     parameters: [
//                         {
//                             type: "text",
//                             text: `${otp}`,
//                         },
//                     ],
//                 },
//             ],
//         },
//     };
//     const res = await axios.post(
//         "https://graph.facebook.com/v18.0/207695905761327/messages",
//         data,
//         config
//     );

//     return res;
// };


const sendWhatsAppMessage = async (phoneNumber, otp) => {
    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization:
                "Bearer EAANSoaeKzUMBO6tjbfi5bvEIvphOzn9zg5PnfafIZBVvnJ698dScZCtiRNaMXiVCcVvmK16XwR617ZBekIcgxGFwjjLnK4HuXeQ1u7EZBPQpBDQ0wNwYCu6uTBAKtf8CfcyvSwxBAqnN24Glbare869fHh3XE3AEw5wBJhuoyjxsKWQSX9dsQvr7qKjYZCFCu",
        },
    };
    const data = {
        messaging_product: "whatsapp",
        to: "91" + phoneNumber,
        type: "template",

        template: {
            name: "saying_thanks",
            language: {
                code: "en",
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: `there is the *OTP : '${otp}'* for Digital menu`,
                        },
                    ],
                },
            ],
        },
    };
    const res = await axios.post(
        "https://graph.facebook.com/v17.0/112127151975295/messages",
        data,
        config
    );

    return res;
};
const sendCustomWhatsAppMessage = async (phoneNumber, message) => {
    try{
    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization:
                "Bearer EAANSoaeKzUMBO6tjbfi5bvEIvphOzn9zg5PnfafIZBVvnJ698dScZCtiRNaMXiVCcVvmK16XwR617ZBekIcgxGFwjjLnK4HuXeQ1u7EZBPQpBDQ0wNwYCu6uTBAKtf8CfcyvSwxBAqnN24Glbare869fHh3XE3AEw5wBJhuoyjxsKWQSX9dsQvr7qKjYZCFCu",
        },
    };
    const data = {
        messaging_product: "whatsapp",
        to: "91" + phoneNumber,
        type: "template",

        template: {
            name: "saying_thanks",
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
        "https://graph.facebook.com/v17.0/112127151975295/messages",
        data,
        config
    );

    return res;
    }
    catch{

    }
};
module.exports = sendWhatsAppMessage;
module.exports=sendCustomWhatsAppMessage;
