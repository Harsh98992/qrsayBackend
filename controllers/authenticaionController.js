const catchAsync = require("../helpers/catchAsync");
const User = require("../models/userModel");
const IdentifierOTP = require("../models/OTPModel");
const Restaurant = require("../models/restaurantModel");
const jwt = require("jsonwebtoken");
const AppError = require("../helpers/appError");
const { promisify } = require("util");
const sendEmail = require("../helpers/email");
const crypto = require("crypto");
const generateOtp = require("../helpers/generateOtp");
const { ifError } = require("assert");
const { authSchema } = require("../helpers/validationSchema");
const { error, log } = require("console");
const Joi = require("joi");
const Customer = require("../models/CustomerModel");
const jwtSign = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};
const createSendToken = (user, statusCode, req, res) => {
    const token = jwtSign(user._id);

    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        data: {
            token,
            user,
        },
    });
};

exports.signUp = catchAsync(async (req, res, next) => {
    let emailUser = await User.findOne({ email: req.body.email });

    if (emailUser) {
        return next(new AppError("User already exists with this email", 400));
    }

    let phoneNumberUser = await User.findOne({
        phoneNumber: req.body.phoneNumber,
    });

    if (phoneNumberUser) {
        return next(
            new AppError("User already exists with this phone number", 400)
        );
    }

    const newUser = await User.create({
        name: req.body.name,

        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        role: "restaurantOwner",
    });

    const token = jwtSign(newUser._id);
    const userDetail = {
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        emailVerified: newUser.emailVerified,
    };
    res.status(201).json({
        status: "success",
        data: {
            token,
            user: userDetail,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const result = await authSchema.validateAsync(req.body);

    if (error.isJoi == true) {
        error.status = 422;
        return next(error);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        next(new AppError("Incorrect email or password", 401));
        return;
    }
    const correct = await user.correctPassword(password, user.password);

    if (!correct) {
        next(new AppError("Incorrect email or password", 401));
        return;
    }
    const restaurantData = await Restaurant.findOne({
        _id: user.restaurantKey,
    }).select("restaurantVerified");

    const userDetail = {
        name: user.name,
        restaurantName: user.restaurantName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        emailVerified: user.emailVerified,
        restaurantVerified: restaurantData?.restaurantVerified ?? false,
    };

    const token = jwtSign(user._id);
    res.status(200).json({
        status: "success",
        data: {
            token,
            user: userDetail,
        },
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token = null;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(
            new AppError("You are not logged in! please log in to access.", 401)
        );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    let user = await User.findById(decoded.id);
    if (!user) {
        // check if in the database of the customer
        user = await Customer.findById(decoded.id);
    }

    if (!user) {
        return next(new AppError("User does not exists!", 401));
    }

    if (user.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                "User recently changed password please log in again!",
                401
            )
        );
    }

    req.user = user;
    next();
});

exports.ristrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role) && req.user.role !== "admin") {
            return next(
                new AppError(
                    "You do not have access to perform this action!",
                    403
                )
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    const restaurantData = await Restaurant.findOne({
        _id: user.restaurantKey,
    });

    if (!user) {
        return next(new AppError("There is no user with email address.", 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
        const resetURL = `${req.get(
            "origin"
        )}/admin/resetPassword/${resetToken}`;
        const emailText = `<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Forgot Password</h2>
    <p>Dear User,</p>
    <p>We have received a request to reset your password. To proceed with the password reset, click on the link below:</p>
    <h3><a href="${resetURL}" target="_blank">Reset Password</a></h3>
    <p>If you didn't request a password reset, you can safely ignore this email.</p>
    <p>Thank you!</p>
    <p>Digital Menu</p>
  </div>`;
        await sendEmail(user.email, "Password reset", emailText);
        if (restaurantData?.restaurantEmail) {
            await sendEmail(
                restaurantData?.restaurantEmail,
                "Password reset",
                emailText
            );
        }

        res.status(200).json({
            status: "success",
            data: {
                message:
                    "The password reset link has been sent to your email. Please check your email inbox.",
            },
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                "There was an error sending the email. Try again later!"
            ),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError("Token is invalid or has expired", 400));
    }
    user.password = req.body.password;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
        return next(
            new AppError(
                "The provided old password is incorrect. Please try again.",
                400
            )
        );
    }

    user.password = req.body.newPassword;

    await user.save();

    res.status(200).json({
        status: "success",
        data: {
            message: "Password Changed Successfully!",
        },
    });
});
exports.sendEmailVerificationOtp = catchAsync(async (req, res, next) => {
    const { email } = req.body || {};
    if (!email) {
        return next(new AppError("Email is missing!", 400));
    }

    const OTP = generateOtp();
    let emailOtp = await IdentifierOTP.findOne({ identifier: email });
    if (emailOtp) {
        // if the email exists, update the attempt count and the OTP
        emailOtp.otp = OTP;
        emailOtp.attempts = emailOtp.attempts + 1;

        if (emailOtp.attempts > 5) {
            if (
                emailOtp.firstAttempt &&
                (new Date() - emailOtp.firstAttempt) / 1000 < 300
            ) {
                return next(
                    new AppError(
                        "You have exceeded the maximum number of attempts. Please try again after 5 minute.",
                        400
                    )
                );
            }
            emailOtp.firstAttempt = new Date();
            emailOtp.attempts = 1;
        }
        await emailOtp.save();
    } else {
        await IdentifierOTP.create({
            identifier: email,
            otp: OTP,
            attempts: 1,
            firstAttempt: new Date(),
        });
    }
    const emailText = `<h2>OTP Verification</h2>
        <p>Dear User,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h3 style="background-color: #f2f2f2; padding: 10px; display: inline-block;">${OTP}</h3>
        <p>Please use this OTP to verify your account.</p>
        <p><strong>Note:</strong> This OTP is valid for a limited time and should not be shared with anyone.</p>
        <p>Thank you for using our service!</p>`;

    try {
        await sendEmail(email, "OTP Verification Code", emailText);

        res.status(200).json({
            status: "success",
            data: {
                message:
                    "The One-Time Password (OTP) has been sent to " +
                    email +
                    ". Please check your inbox.",
            },
        });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({
            status: "error",
            message:
                "An error occurred while sending the OTP to your email address. Please try again later.",
        });
    }
});

exports.validateEmailFromOtp = catchAsync(async (req, res, next) => {
    const otp = req.body.otp;
    const email = req.body.email;

    if (!otp || !email) {
        return next(
            new AppError(
                "One-Time Password (OTP) and Email are required to verify your account.",
                400
            )
        );
    }

    const IdentifierOTPDetail = await IdentifierOTP.findOne({
        identifier: email,
    });

    console.log("IdentifierOTPDetail: ", IdentifierOTPDetail);

    if (!IdentifierOTPDetail) {
        return next(
            new AppError(
                "We are sorry, but the Email you entered is incorrect. Please double-check the Email you received and try again.",

                400
            )
        );
    }

    if (IdentifierOTPDetail.otp !== otp) {
        console.log(
            "OTP: ",
            otp,
            "IdentifierOTPDetail.otp: ",
            IdentifierOTPDetail.otp
        );

        return next(
            new AppError(
                "We are sorry, but the One-Time Password (OTP) you entered is incorrect. Please double-check the OTP you received and try again.",
                400
            )
        );
    }

    if (IdentifierOTPDetail.identifier !== email) {
        return next(
            new AppError(
                "We are sorry, but the Email you entered is incorrect. Please double-check the Email you received and try again.",
                400
            )
        );
    }

    IdentifierOTPDetail.identifierVerified = true;
    await IdentifierOTPDetail.save();

    res.status(200).send({
        status: "success",
        data: {
            message:
                "Congratulations! Your Email has been successfully verified and the details have been saved.",
        },
    });
});

exports.createUser = catchAsync(async (req, res, next) => {
    let { userName, role, email, phoneNo, password } = req.body;
    await User.create({
        name: userName,

        email: email,
        phoneNumber: phoneNo,
        role: role,
        password: password,
    });
    res.status(200).send({
        status: "success",
        data: {
            message: "Sucessfully Created!",
        },
    });
});

exports.addUser = catchAsync(async (req, res, next) => {
    const { name, email, phoneNumber, role, password } = req.body;
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string()
            .email()
            .messages({ "string.email": `Email must be a valid email.` })
            .required(),
        phoneNumber: Joi.string()
            .regex(/^[0-9]{10}$/)
            .messages({
                "string.pattern.base": `Phone number must have 10 digits.`,
            })
            .required(),

        role: Joi.string().required(),
        password: Joi.string()
            .messages({
                "string.pattern.base": `Password must be at least 8 characters long.`,
            })
            .required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new AppError(error.details[0].message, 400));
    }

    // checking the validation for the request body for email existance

    let user = await User.findOne({ email: email });

    if (user) {
        return next(new AppError("User already exists with this email", 400));
    }

    // checking the validation for the request body for phone number existance

    user = await User.findOne({ phoneNumber: phoneNumber });

    if (user) {
        return next(
            new AppError("User already exists with this phone number", 400)
        );
    }

    user = await User.create({
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        role: role,
        password: password,
        restaurantKey: req.user.restaurantKey,
    });
    res.status(200).send({
        status: "success",
        data: {
            message: "Sucessfully Created!",
        },
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const id = req.params.id;

    let user = await User.findById(id);

    if (!user) {
        return next(new AppError("No user found with that ID", 404));
    }

    // if ( user.restaurantKey.toString() !== req.user.restaurantKey.toString()) {
    //     return next(
    //         new AppError("You are not authorized to access this user", 401)
    //     );
    // }

    if (user.restaurantKey.toString() !== req.user.restaurantKey.toString()) {
        return next(
            new AppError("You are not authorized to access this user", 401)
        );
    }

    if (user.role === "admin" && req.user.role !== "admin") {
        return next(new AppError("You cannot delete an admin", 400));
    }

    user = await User.findByIdAndDelete(id);

    res.status(200).send({
        status: "success",
        data: {
            message: "Sucessfully Deleted!",
        },
    });
});

exports.editUser = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
        return next(new AppError("No user found with that ID", 404));
    }

    if (user.role === "admin" && req.user.role !== "admin") {
        return next(new AppError("You cannot edit an admin", 400));
    }

    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 12);
    }

    //   if (req.body.email) {
    //     const schema = Joi.object({
    //       email: Joi.string()
    //         .email()
    //         .messages({ "string.email": `Email must be a valid email.` })
    //         .required(),
    //     });

    //     const { error } = schema.validate(req.body);

    //     if (error) {
    //       return next(new AppError(error.details[0].message, 400));
    //     }

    //     // checking the validation for the request body for email existance

    //     user_email = await User.findOne({ email: req.body.email });

    //     if (user_email) {
    //       return next(new AppError("User already exists with this email", 400));
    //     }
    //   }

    //   if (req.body.phoneNumber) {
    //     const schema = Joi.object({
    //       phoneNumber: joi

    //         .string()
    //         .regex(/^[0-9]{10}$/)
    //         .messages({
    //           "string.pattern.base": `Phone number must have 10 digits.`,
    //         })
    //         .required(),
    //     });

    //     const { error } = schema.validate(req.body);

    //     if (error) {
    //       return next(new AppError(error.details[0].message, 400));
    //     }

    //     // checking the validation for the request body for phone number existance

    //     userPhone = await User.findOne({ phoneNumber: req.body.phoneNumber });

    //     if (userPhone) {
    //       return next(
    //         new AppError("User already exists with this phone number", 400)
    //       );
    //     }
    //   }

    if (
        user.restaurantKey.toString() !== req.user.restaurantKey.toString() &&
        req.user.role !== "admin"
    ) {
        return next(
            new AppError("You are not authorized to access this user", 401)
        );
    }

    if (user.role === "admin" && req.user.role !== "admin") {
        return next(new AppError("You cannot edit an admin", 400));
    }

    if (user.role === "restaurantOwner" && req.user.role !== "admin") {
        if (user._id.toString() !== req.user._id.toString()) {
            return next(
                new AppError("You are not authorized to access this user", 401)
            );
        }
    }

    let query = { $set: {} };

    // check if body contains the key for the role and if the role is to be changed to staff
    if (req.body.role && req.body.role === "staff") {
        // then we need to check that atleast one restaurant owner is present in the restaurant except the one who is updating the user
        const restaurant = await Restaurant.findOne({
            _id: req.user.restaurantKey,
        });

        if (!restaurant) {
            return next(new AppError("Restaurant not found", 404));
        }

        const restaurantOwners = await User.find({
            restaurantKey: req.user.restaurantKey,
            role: "restaurantOwner",
        });

        // remove the user who is updating the user
        const index = restaurantOwners.findIndex(
            (owner) => owner._id.toString() === req.user._id.toString()
        );

        if (index > -1) {
            restaurantOwners.splice(index, 1);
        }

        if (restaurantOwners.length === 0) {
            return next(
                new AppError(
                    "You cannot change the role of this user to staff as there are no other restaurant owners in the restaurant",
                    400
                )
            );
        }
    }

    for (let key in req.body) {
        if (user[key] && user[key] !== req.body[key]) {
            query.$set[key] = req.body[key];
        }

        const updatedUser = await User.updateOne({ _id: id }, query);
    }

    res.status(200).send({
        status: "success",
        data: {
            message: "Sucessfully Updated!",
        },
    });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find({ restaurantKey: req.user.restaurantKey });
    res.status(200).send({
        status: "success",
        data: {
            users,
        },
    });
});

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (user.restaurantKey.toString() !== req.user.restaurantKey.toString()) {
        return next(
            new AppError("You are not authorized to access this user", 401)
        );
    }

    res.status(200).send({
        status: "success",
        data: {
            user,
        },
    });
});

exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).send({
        status: "success",
        data: {
            user,
        },
    });
});
