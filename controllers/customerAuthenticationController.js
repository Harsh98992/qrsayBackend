const catchAsync = require("../helpers/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../helpers/appError");
const Customer = require("../models/CustomerModel");
const Restaurant = require("../models/restaurantModel");
const { promisify } = require("util");
const jwtSign = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};
const IdentifierOTP = require("../models/OTPModel");
const sendWhatsAppMessage = require("../helpers/whatsapp");
const generateOtp = require("../helpers/generateOtp");

const sendSMSMessage = require("../helpers/sms");

exports.customerLogin = catchAsync(async (req, res, next) => {
    const { email, password, socialLogin } = req.body;
    if (socialLogin) {
        let user = await Customer.findOne({ email });
        if (!user) {
            user = await Customer.create({
                email: req.body.email,
                name: req.body.name,
                phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : "",
                password: "Trigger.11",
                socialLogin: "google",
            });
        }
        const token = jwtSign(user._id);
        res.status(200).json({
            status: "success",
            data: {
                userData: user,
                token,
            },
        });
    }
});

exports.customerProtect = catchAsync(async (req, res, next) => {
    let token = null;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        next(
            new AppError("You are not logged in! please log in to access.", 401)
        );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id);
    if (!customer) {
        return next(new AppError("User does not exist!", 401));
    }

    if (customer.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                "User recently changed password, please log in again!",
                401
            )
        );
    }

    req.user = customer;
    next();
});

exports.customerProtectNoError = catchAsync(async (req, res, next) => {
    let token = null;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next();
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id);
    if (!customer) {
        return next(new AppError("User does not exist!", 401));
    }

    if (customer.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                "User recently changed password, please log in again!",
                401
            )
        );
    }

    req.user = customer;
    next();
});

function isOtpExpired(otpCreatedAt) {
    const expirationTimeInSeconds = 1800;
    const currentTime = new Date();
    const elapsedTimeInSeconds = (currentTime - otpCreatedAt) / 1000;
    // console.log(expirationTimeInSeconds, currentTime, elapsedTimeInSeconds);
    return elapsedTimeInSeconds > expirationTimeInSeconds;
}
exports.sendPhoneVerificationCode = catchAsync(async (req, res, next) => {
    const phoneNumber = req.body.phoneNumber;
    const socialLogin = req.body.socialLogin; // Get socialLogin from request

    if (!phoneNumber) {
        return next(new AppError("Phone number is missing!", 400));
    }

    let identifierOtp = await IdentifierOTP.findOne({
        identifier: phoneNumber,
    });

    let OTP;

    if (identifierOtp) {
        OTP = identifierOtp.otp;

        if (isOtpExpired(identifierOtp.otpCreatedAt)) {
            OTP = generateOtp();
            identifierOtp.otpCreatedAt = new Date();
            console.log("Otp: " + OTP);
        }
        console.log("Otp: " + OTP);

        identifierOtp.otp = OTP;
        identifierOtp.attempts = identifierOtp.attempts + 1;

        if (identifierOtp.attempts > 5) {
            if (
                identifierOtp.firstAttempt &&
                (new Date() - identifierOtp.firstAttempt) / 1000 < 300
            ) {
                return next(
                    new AppError(
                        "You have exceeded the maximum number of attempts. Please try again after 5 minutes.",
                        400
                    )
                );
            }
            identifierOtp.firstAttempt = new Date();
            identifierOtp.attempts = 1;
            identifierOtp.otpCreatedAt = new Date();
        }
        await identifierOtp.save();
    } else {
        OTP = generateOtp();
        await IdentifierOTP.create({
            identifier: phoneNumber,
            otp: OTP,
            attempts: 1,
            otpCreatedAt: new Date(),
            firstAttempt: new Date(),

        });
    }

    let sendFunction = sendWhatsAppMessage; // Default send function

    if (socialLogin === "sms") {
        sendFunction = sendSMSMessage; // Set send function to send SMS
    }

    try {
        const response = await sendFunction(phoneNumber, OTP);

        res.status(200).json({
            status: "success",
            data: {
                message: `The One-Time Password (OTP) has been sent to ${phoneNumber}. Please check your ${
                    socialLogin === "sms"
                        ? "SMS messages."
                        : "WhatsApp messages."
                }`,
            },
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
            status: "error",
            message: `An error occurred while sending the OTP to your phone number. Please try again later.`,
        });
    }
});

exports.verifyPhoneVerificationCode = catchAsync(async (req, res, next) => {
    const otp = req.body.otp;
    const phoneNumber = req.body.phoneNumber;

    if (!otp || !phoneNumber) {
        return next(
            new AppError(
                "One-Time Password (OTP) and Phone Number are required to verify your account.",
                400
            )
        );
    }

    let identifierOtp = await IdentifierOTP.findOne({
        identifier: phoneNumber,
    });

    if (!identifierOtp) {
        return next(
            new AppError(
                "We are sorry, but the Phone Number you entered is incorrect. Please double-check the Phone Number you received and try again.",
                400
            )
        );
    }

    if (identifierOtp.otp !== otp) {
        return next(
            new AppError(
                "We are sorry, but the One-Time Password (OTP) you entered is incorrect. Please double-check the OTP you received and try again.",
                400
            )
        );
    }

    if (identifierOtp.identifier !== String(phoneNumber)) {
        return next(
            new AppError(
                "We are sorry, but the Phone Number you entered is incorrect. Please double-check the Phone Number you received and try again.",
                400
            )
        );
    }

    if (isOtpExpired(identifierOtp.otpCreatedAt)) {
        return next(
            new AppError(
                "The One-Time Password (OTP) has expired. Please request a new OTP.",
                400
            )
        );
    }

    identifierOtp.identifierVerified = true;

    await identifierOtp.save();

    res.status(200).send({
        status: "success",
        data: {
            message:
                "Congratulations! Your Phone Number has been successfully verified.",
        },
    });
});

exports.whatsappLogin = catchAsync(async (req, res, next) => {
    const phoneNumber = req.body.phoneNumber;

    if (!phoneNumber) {
        return next(
            new AppError(
                "Phone Number is required to verify your account.",
                400
            )
        );
    }

    const identifierOtp = await IdentifierOTP.findOne({
        identifier: phoneNumber,
    });

    if (!identifierOtp) {
        return next(
            new AppError(
                "We are sorry, but the Phone Number you entered is incorrect. Please double-check the Phone Number you received and try again.",
                400
            )
        );
    }

    if (!identifierOtp.identifierVerified) {
        return next(
            new AppError(
                "We are sorry, but the Phone Number you entered is incorrect. Please double-check the Phone Number you received and try again.",
                400
            )
        );
    }

    let customer = await Customer.findOne({
        phoneNumber: phoneNumber,
    });

    if (!customer) {
        customer = await Customer.create({
            phoneNumber: phoneNumber,
            socialLogin: "whatsapp",
        });
    }

    // delete the OTP
    await IdentifierOTP.findOneAndDelete({
        identifier: phoneNumber,
    });

    const token = jwtSign(customer._id);

    res.status(200).json({
        status: "success",
        data: {
            userData: customer,
            token,
        },
    });
});
exports.updateCustomerData = catchAsync(async (req, res, next) => {
    let checkIdentifierOTP = false;

    if (req.body.phoneNumber) {
        checkIdentifierOTP = true;
    }

    if (checkIdentifierOTP) {
        let IdentifierOTPDetail = await IdentifierOTP.findOne({
            identifier: req.body.phoneNumber,
        });

        if (!IdentifierOTPDetail) {
            return next(new AppError("Please Verify Phone Number First!", 400));
        }

        if (!IdentifierOTPDetail.identifierVerified) {
            return next(new AppError("Please Verify Phone Number First!", 400));
        }
    }

    let customerDetail = req.body;

    if (req.user && req.user._id) {
        // check which field is updated
        for (const key in customerDetail) {
            if (customerDetail.hasOwnProperty(key)) {
                const element = customerDetail[key];
                if (element === req.user[key]) {
                    delete customerDetail[key];
                }
            }
        }

        // check if updated field details are not used by other user
        for (const key in customerDetail) {
            if (key === "email" || key === "phoneNumber") {
                if (customerDetail.hasOwnProperty(key)) {
                    const element = customerDetail[key];
                    const user = await Customer.findOne({ [key]: element });
                    if (user) {
                        return next(
                            new AppError(
                                `This ${key} is already used by another user!`,

                                400
                            )
                        );
                    }
                }
            }
        }

        customerDetail = await Customer.findOneAndUpdate(
            { _id: req.user._id },
            customerDetail
        );
    }

    if (checkIdentifierOTP) {
        // delete email otp
        await IdentifierOTP.findOneAndDelete({
            identifier: req.body.phoneNumber,
        });
    }

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
            customerDetail: customerDetail,
        },
    });
});
