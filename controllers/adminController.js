const AppError = require("../helpers/appError");

const catchAsync = require("../helpers/catchAsync");
const Restaurant = require("../models/restaurantModel");
const User = require("../models/userModel");
const sendEmail = require("../helpers/email");
const crypto = require("crypto");
exports.getRestaurantsByStatus = catchAsync(async (req, res, next) => {
    // restaurantVerified = req.body.restaurantVerified ? true : false;

    // return this.http.get(`${this.apiUrl}/v1/admin/getRestaurantsByStatus/${restaurantVerified}`);

    const restaurantVerified = req.params.restaurantVerified;

    let restaurantData = await Restaurant.find({
        restaurantVerified: restaurantVerified,
    });

    res.status(200).json({
        status: "success",
        data: {
            restaurantDetail: restaurantData,
        },
    });
});

exports.getRestaurantDetail = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    let restaurantData = await Restaurant.find({ _id: id });
    let responseData = {};
    if (restaurantData && restaurantData.length) {
        responseData = restaurantData[0]._doc;
    }

    res.status(200).json({
        status: "success",
        data: {
            restaurantDetail: responseData,
        },
    });
});

exports.changeRestaurantStatus = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const restaurantVerified = req.body.restaurantVerified ? true : false;

    let restaurantData = await Restaurant.findOneAndUpdate(
        { _id: id },
        {
            $set: {
                restaurantVerified: restaurantVerified,
            },
        }
    );
    if (!restaurantData) {
        console.log("the restaurant data is not found for the id", id);
        return next(new AppError("Something went wrong!", 400));
    }

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.editRestaurant = catchAsync(async (req, res, next) => {
    const id = req.params.id;

    // find all the existing data
    let restaurantData = await Restaurant.find({ _id: id });

    // if the data is not found then return with error

    if (!restaurantData) {
        console.log("the restaurant data is not found for the id", id);

        return next(new AppError("Something went wrong!", 400));
    }

    let updateData = await Restaurant.findOneAndUpdate(
        { _id: id },
        {
            $set: {
                restaurantName: req.body.restaurantName,
                restaurantType: req.body.restaurantType,
                restaurantEmail: req.body.restaurantEmail,
                restaurantPhoneNumber: req.body.restaurantPhoneNumber,
            
                gstNumber: req.body.gstNumber,
                fssaiLicenseNumber: req.body.fssaiLicenseNumber,
                restaurantUrl: req.body.restaurantUrl,
                address: {
                    street: req.body.street,
                    city: req.body.city,
                    state: req.body.state,
                    pinCode: req.body.pinCode,
                    googleLocation: req.body.googleLocation,
                },
            },
        }
    );

    if (!updateData) {
        console.log(
            "the restaurant data is not found for the id",
            id,
            "so it is not updated   "
        );

        return next(new AppError("Something went wrong!", 400));
    }

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.viewAllUsersOfRestaurant = catchAsync(async (req, res, next) => {
    const id = req.params.id;

    userDetails = await User.find({ restaurantKey: id });

    if (!userDetails) {
        return next(new AppError("No user found for this restaurant!", 400));
    }

    res.status(200).json({
        status: "success",
        data: {
            userDetails,
        },
    });
});

exports.editRestaurant = catchAsync(async (req, res, next) => {
    const id = req.params.id;

    let restaurant = await Restaurant.findOne({ _id: id });

    if (!restaurant) {
        return next(new AppError("No Restaurant Found!", 400));
    } else {
        let updateData = await Restaurant.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    restaurantName: req.body.restaurantName,
                    restaurantType: req.body.restaurantType,
                    restaurantPhoneNumber: req.body.restaurantPhoneNumber,
                   
                    gstNumber: req.body.gstNumber,
                    fssaiLicenseNumber: req.body.fssaiLicenseNumber,
                    restaurantUrl: req.body.restaurantUrl,
                    email: req.body.email,
                    address: req.body.address,
                },
            }
        );

        if (!updateData) {
            console.log(
                "the restaurant data is not found for the id",
                id,
                "so it is not updated   "
            );

            return next(new AppError("Something went wrong!", 400));
        }
    }

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.sendEmailToRestaurant = catchAsync(async (req, res, next) => {
    // const data = {
    //     restaurantEmail:
    //         this.restaurantForm.get("restaurantEmail").value,
    //     subject: "Email from Digital Menu",
    //     message: message,
    // };
    data = req.body;

    await sendEmail(data.restaurantEmail, data.subject, data.message);

    res.status(200).json({
        status: "success",
        data: {
            message: "Email Sent Successfully!",
        },
    });
});

exports.updatePaymentGateway = catchAsync(async (req, res, next) => {
    // const id = req.params.id;
    const secretData = {
        restaurantAccountId: req.body.restaurantAccountId,
    };
    const algorithm = process.env.encryptionAlogrithm;
    const secretKey = crypto
        .createHash("sha512")
        .update(process.env.payment_secret)
        .digest("hex")
        .substring(0, 32);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);

    // Encrypt the data
    let encryptedData = cipher.update(
        JSON.stringify(secretData),
        "utf8",
        "hex"
    );
    encryptedData += cipher.final("hex");
    const authTag = cipher.getAuthTag();
    const paymentgatewayData = {
        gatewayData: encryptedData,
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex"),
    };
    let updateData = await Restaurant.findOneAndUpdate(
        { _id: req.body.restaurantId },
        {
            $set: {
                paymentgatewayData: paymentgatewayData,
            },
        }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});
