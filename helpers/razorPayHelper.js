var Razorpay = require("razorpay");
const AppError = require("./appError");
const catchAsync = require("./catchAsync");
const Restaurant = require("../models/restaurantModel");
const crypto = require("crypto");
exports.fetchOrderById = async (key, secret, orderId) => {
    var instance = new Razorpay({
        key_id: key,
        key_secret: secret,
    });

    const result = await instance.orders.fetchPayments(orderId);
    return result;
};

exports.getPaymentGatewayCredentials = catchAsync(async (req, res, next) => {
    if (!req.body?.restaurantId) {
        return next(new AppError("Restaurant Id is missing!"));
    }
    const paymentData = await Restaurant.findById({
        _id: req.body.restaurantId,
    }).select("paymentgatewayData");
    if (!paymentData || !paymentData?.paymentgatewayData?.iv) {
        return next(
            new AppError("Payment information for the restaurant is absent!")
        );
    }
    const encryptedData = paymentData.paymentgatewayData;

    const secretKey = crypto
        .createHash("sha512")
        .update(process.env.payment_secret)
        .digest("hex")
        .substring(0, 32);
    const decipher = crypto.createDecipheriv(
        process.env.encryptionAlogrithm,
        secretKey,
        Buffer.from(encryptedData.iv, "hex")
    );
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, "hex"));
    let decryptedData = decipher.update(
        encryptedData.gatewayData,
        "hex",
        "utf8"
    );
    decryptedData += decipher.final("utf8");

    req.paymentData = JSON.parse(decryptedData);
    next();
});
