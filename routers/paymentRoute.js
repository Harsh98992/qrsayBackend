const express = require("express");
const app = express();
const router = express.Router();
const https = require("https");
const qs = require("querystring");

const checksum_lib = require("../helpers/Paytm/checksum");
const config = require("../helpers/Paytm/paytmConfig");
const PaytmChecksum = require("paytmchecksum");
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });
// const PaytmChecksum = require('./PaytmChecksum');
var Razorpay = require("razorpay");
const AppError = require("../helpers/appError");
const { createRazorPayOrder } = require("../controllers/paymentController");
const { getPaymentGatewayCredentials } = require("../helpers/razorPayHelper");
const {
    customerProtect,
} = require("../controllers/customerAuthenticationController");

router.post(
    "/razorpay",
    customerProtect,
    getPaymentGatewayCredentials,
    createRazorPayOrder
);
router.post("/getCheckSum", [parseUrl, parseJson], (req, res) => {
    // Route for making payment
    var paytmParams = {};

    paytmParams.body = {
        requestType: "Payment",
        mid: config.PaytmConfig.mid,
        websiteName: config.PaytmConfig.website,
        orderId: "ORDERID_98765",
        callbackUrl: "https://localhost:4200",
        WEBSITE: config.PaytmConfig.website,
        TXN_AMOUNT: "1.00",
        txnAmount: {
            value: "1.00",
            currency: "INR",
        },
        userInfo: {
            custId: "CUST_001",
        },
    };
    PaytmChecksum.generateSignature(
        JSON.stringify(paytmParams.body),
        config.PaytmConfig.key
    ).then(function (checksum) {
        paytmParams.head = {
            signature: checksum,
        };

        var post_data = JSON.stringify(paytmParams);

        var options = {
            /* for Staging */
            hostname: "securegw-stage.paytm.in",

            /* for Production */
            // hostname: 'securegw.paytm.in',

            port: 443,
            path: "/theia/api/v1/initiateTransaction?mid=YOUR_MID_HERE&orderId=ORDERID_98765",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": post_data.length,
            },
        };
        res.status(200).json({
            status: "success",
            data: {
                params: paytmParams,
            },
        });
        // var response = "";
        // var post_req = https.request(options, function (post_res) {
        //     post_res.on("data", function (chunk) {
        //         response += chunk;
        //     });

        //     post_res.on("end", function () {
        //         console.log("Response: ", response);
        //     });
        // });

        // post_req.write(post_data);
        // post_req.end();
    });
    // var params = {};
    // params["MID"] = config.PaytmConfig.mid;
    // params["WEBSITE"] = config.PaytmConfig.website;
    // params["CHANNEL_ID"] = "WEB";
    // params["INDUSTRY_TYPE_ID"] = "Retail";
    // params["ORDER_ID"] = "121";
    // params["CUST_ID"] = paymentDetails.customerId;
    // params["TXN_AMOUNT"] = paymentDetails.amount;
    // params["CALLBACK_URL"] = "http://localhost:4200";
    // params["EMAIL"] = paymentDetails.customerEmail;
    // params["MOBILE_NO"] = paymentDetails.customerPhone;
    // params["stagging"] = "false";

    // checksum_lib.genchecksum(
    //     params,
    //     config.PaytmConfig.key,
    //     function (err, checksum) {
    //         var isVerifySignature = checksum_lib.verifychecksum(
    //             params,
    //             config.PaytmConfig.key,
    //             checksum
    //         );
    //         if (isVerifySignature) {
    //             console.log("Checksum Matched");
    //         } else {
    //             console.log("Checksum Mismatched");
    //         }
    //         params["CHECKSUMHASH"] = checksum;

    //         res.status(200).json({
    //             status: "success",
    //             data: {
    //                 params,
    //             },
    //         });
    //     }
    // );
});
module.exports = router;
