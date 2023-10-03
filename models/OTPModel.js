const mongoose = require("mongoose");
const OTPSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: [true, "Please provide your phone number or email"],
        unique: true,
    },
    otp: {
        type: String,
        required: [true, "Please provide an otp"],
        minlength: 4,
    },

    firstAttempt: {
        type: Date,
        default: Date.now(),
    },

    attempts: {
        type: Number,
        default: 1,
    },

    identifierVerified: {
        type: Boolean,
        default: false,
    },
    otpCreatedAt: {
        type: Date,
        default: Date.now(),
    },
});

const IdentifierOTP = mongoose.model("IdentifierOTP", OTPSchema);

module.exports = IdentifierOTP;
