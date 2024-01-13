const AppError = require("../helpers/appError");
const axios = require("axios");
const catchAsync = require("../helpers/catchAsync");
const Restaurant = require("../models/restaurantModel");
const User = require("../models/userModel");
const IdentifierOTP = require("../models/OTPModel");
const Order = require("../models/OrderModel");
const Customer = require("../models/CustomerModel");
const ObjectId = require("mongoose").Types.ObjectId;
const PromoCode = require("../models/promoCodeModel");
const { application } = require("express");
const sendEmail = require("../helpers/email");

exports.getRestaurantDetail = catchAsync(async (req, res, next) => {
    let restaurantData = await Restaurant.find({ _id: req.user.restaurantKey });
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
exports.getRestaurant = catchAsync(async (req, res, next) => {
    const url = req.query.restaurant;

    if (!url) {
    }
    const data = await Restaurant.findOne({ restaurantUrl: url });

    res.status(201).json({
        status: "success",

        data: data,
    });
});

exports.updateRestaurantDetail = catchAsync(async (req, res, next) => {
    let IdentifierOTPDetail = await IdentifierOTP.findOne({
        identifier: req.body.restaurantEmail,
    });

    if (!IdentifierOTPDetail) {
        return next(new AppError("Please Verify Email First!", 400));
    }

    if (!IdentifierOTPDetail.identifierVerified) {
        return next(new AppError("Please Verify Email First!", 400));
    }

    let restaurantDetail = req.body;

    if (req.user && req.user.restaurantKey) {
        restaurantDetail = await Restaurant.findOneAndUpdate(
            { _id: req.user.restaurantKey },
            restaurantDetail
        );
    } else {
        restaurantDetail = await Restaurant.create(restaurantDetail);
        console.log(restaurantDetail);

        // update the restaurant key in user model
        await User.findOneAndUpdate(
            { _id: req.user._id },
            { restaurantKey: restaurantDetail._id }
        );
    }
    await IdentifierOTP.findOneAndDelete({
        identifier: req.body.restaurantEmail,
    });
    if (req.user && req.user.restaurantKey) {
        res.status(200).json({
            status: "success",
            data: {
                message: "Record Updated Successfully!",
                restaurantDetail: restaurantDetail,
            },
        });
    } else {
        res.status(200).json({
            status: "success",
            data: {
                message:
                    "We are grateful that you've opted for our service! Your eagerness to become a part of our community is truly valued. Currently, we are in the process of verifying your details to guarantee the utmost security and genuineness. Once this process concludes, you'll gain full access to the extensive range of features our website offers",

                restaurantDetail: restaurantDetail,
            },
        });
    }
});
exports.updateStoreSettings = catchAsync(async (req, res, next) => {
    let checkIdentifierOTP = false;
    if (req.body.restaurantEmail) {
        checkIdentifierOTP = true;
    } else {
        checkIdentifierOTP = false;
    }

    if (checkIdentifierOTP) {
        return next(new AppError("You can't change email!", 400));
    }

    let restaurantDetail = req.body;

    if (req.user?.restaurantKey) {
        restaurantDetail = await Restaurant.findOneAndUpdate(
            { _id: req.user.restaurantKey },
            restaurantDetail
        );
    } else {
        restaurantDetail = await Restaurant.create(restaurantDetail);

        await User.findOneAndUpdate(
            { _id: req.user._id },
            { restaurantKey: res._id }
        );
    }

    if (checkIdentifierOTP) {
        // delete email otp
        await IdentifierOTP.findOneAndDelete({
            identifier: req.body.restaurantEmail,
        });
    }

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
            restaurantDetail: restaurantDetail,
        },
    });
});

exports.addContactDetail = catchAsync(async (req, res, next) => {
    if (!req.body.contactType || !req.body.contactDetails) {
        return next(
            new AppError("Please provide contact type and contact detail!", 400)
        );
    }
    let restaurant = await Restaurant.findById({
        _id: req.user.restaurantKey,
    });

    if (!restaurant) {
        return next(new AppError("Restaurant not found", 400));
    }
    if (restaurant.contact?.length > 5) {
        return next(
            new AppError("You can add up to a maximum of five contacts.", 400)
        );
    }

    restaurant = await Restaurant.findOneAndUpdate(
        { _id: req.user.restaurantKey },
        {
            $push: {
                contact: {
                    contactType: req.body.contactType,
                    contactDetails: req.body.contactDetails,
                },
            },
        }, // Use the $push operator to add the new review to the 'reviews' array
        { new: true, upsert: true } // Return the updated document instead of the original one
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
            restaurantDetail: restaurant,
        },
    });
});

exports.deleteContactDetail = catchAsync(async (req, res, next) => {
    if (!req.params.id) {
        return next(new AppError("Contatct Id not found!", 400));
    }

    await Restaurant.findOneAndUpdate(
        { _id: req.user.restaurantKey },
        {
            $pull: {
                contact: {
                    _id: req.params.id,
                },
            },
        }, // Use the $push operator to add the new review to the 'reviews' array
        { new: true, upsert: true } // Return the updated document instead of the original one
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.updateContactDetail = catchAsync(async (req, res, next) => {
    if (!req.body.contactType || !req.body.contactDetails) {
        return next(
            new AppError("Please provide contact type and contact detail!", 400)
        );
    }
    let restaurant = await Restaurant.findById({
        _id: req.user.restaurantKey,
    });

    if (!restaurant) {
        return next(new AppError("Restaurant not found", 400));
    }
    const result = await Restaurant.updateOne(
        { _id: req.user.restaurantKey, "contact._id": req.body.contactId },

        {
            $set: {
                "contact.$.contactType": req.body.contactType,
                "contact.$.contactDetails": req.body.contactDetails,
            },
        },
        { multi: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.updateRestaurantBannerImage = catchAsync(async (req, res, next) => {
    if (!req.body.image) {
        return next(new AppError("Please upload a image!", 400));
    }

    await Restaurant.findOneAndUpdate(
        { _id: req.user.restaurantKey },
        {
            restaurantBackgroundImage: req.body.image,
        }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});
exports.changeRestaurantStatus = catchAsync(async (req, res, next) => {
    if (!req.body.restaurantStatus) {
        return next(new AppError("Please provide a status!", 400));
    }
    await Restaurant.findOneAndUpdate(
        { _id: req.user.restaurantKey },
        {
            restaurantStatus: req.body.restaurantStatus,
        }
    );

    sendEmail({
        email: req.user.email,
        subject: "Restaurant Status",
        message: `Your restaurant is ${req.body.restaurantStatus} now!`,
    });

    res.status(200).json({
        status: "success",
        data: {
            message: `Restaurant is ${req.body.restaurantStatus} now!`,
        },
    });
});
exports.getRestaurantImages = catchAsync(async (req, res, next) => {
    const restaurantData = await Restaurant.find({
        restaurantId: req.user.restaurantKey,
    });

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.getRestaurantReview = catchAsync(async (req, res, next) => {
    const placeId = req.params.placeId;
    if (placeId) {
        const result = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&&fields=name,rating,reviews&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        res.status(200).json({
            status: "success",
            data: {
                reviewData: result.data,
            },
        });
    } else {
        res.status(200).json({
            status: "success",
            data: {
                reviewData: [],
            },
        });
    }
});

exports.getCustomerList = catchAsync(async (req, res, next) => {
    const restaurantId = req.user.restaurantKey;

    // Find the restaurant based on restaurantId
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return next(new AppError("No restaurant found with that ID", 404));
    }

    // Find all orders associated with the restaurant
    const orders = await Order.find({ restaurantId });

    // Extract unique customerIds from orders
    const customerIds = [...new Set(orders.map((order) => order.customerId))];

    // Find customer information for each customerId, but only include limited fields
    const customers = await Customer.find({ _id: { $in: customerIds } }).select(
        "name email phoneNumber"
    );

    res.status(200).json({
        status: "success",
        data: {
            customers,
        },
    });
});

exports.getPromoCode = catchAsync(async (req, res, next) => {
    const restaurantId = req.user.restaurantKey;

    let restaurant = await Restaurant.findById({
        _id: restaurantId,
    });

    if (!restaurant) {
        return next(new AppError("Restaurant not found", 404));
    }

    let promoCode = await PromoCode.findOne({ restaurantId: restaurantId });

    if (!promoCode) {
        promoCode = await PromoCode.create({
            restaurantId: restaurantId,
            promoCodes: [],
        });
    }

    if (!promoCode) {
        return next(new AppError("Promo Code not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            promoCodes: promoCode.promoCodes,
        },
    });
});

exports.addPromoCode = catchAsync(async (req, res, next) => {
    const restaurantId = req.user.restaurantKey;

    let restaurant = await Restaurant.findById({
        _id: restaurantId,
    });

    if (!restaurant) {
        return next(new AppError("Restaurant not found", 404));
    }

    let promoCode = PromoCode.findOne({ restaurantId: restaurantId });

    if (!promoCode) {
        promoCode = await promoCode.create({
            restaurantId: restaurantId,
            promoCodes: [
                {
                    codeName: req.body.codeName,
                    description: req.body.description,
                    discountAmount: req.body.discountAmount,
                    discountType: req.body.discountType,
                    minOrderValue: req.body.minOrderValue,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    perUserLimit: req.body.perUserLimit,
                    totalUsageLimit: req.body.totalUsageLimit,
                    applicableFor: req.body.applicableFor,
                    mealTime: req.body.mealTime,
                    runThisOffer: req.body.runThisOffer,
                    maxDiscount: req.body.maxDiscount,
                    active: req.body.active,
                    days: req.body.days,
                },
            ],
        });
    } else {
        promoCode = await promoCode.findOneAndUpdate(
            { restaurantId: restaurantId },
            {
                $push: {
                    promoCodes: {
                        codeName: req.body.codeName,
                        description: req.body.description,
                        discountAmount: req.body.discountAmount,
                        discountType: req.body.discountType,
                        minOrderValue: req.body.minOrderValue,
                        startDate: req.body.startDate,
                        endDate: req.body.endDate,
                        perUserLimit: req.body.perUserLimit,
                        totalUsageLimit: req.body.totalUsageLimit,
                        applicableFor: req.body.applicableFor,
                        mealTime: req.body.mealTime,
                        runThisOffer: req.body.runThisOffer,
                        maxDiscount: req.body.maxDiscount,
                        active: req.body.active,
                        days: req.body.days,
                    },
                },
            },

            { new: true, upsert: true } // Return the updated document instead of the original one
        );
    }

    res.status(200).json({
        status: "success",
        data: {
            message: "PromoCode added successfully!",
        },
    });
});

// exports.addLoyalRestaurant = catchAsync(async (req, res, next) => {
//     const { customerId } = req.params;
//     const restaurantId = req.user.id;

//     const customer = await Customer.findByIdAndUpdate(customerId, {
//         $addToSet: { loyalRestaurants: restaurantId }
//     }, { new: true, runValidators: true });

//     res.status(200).json({
//         status: 'success',
//         data: {
//             customer
//         }
//     });
// });

// exports.removeLoyalRestaurant = catchAsync(async (req, res, next) => {
//     const { customerId } = req.params;
//     const restaurantId = req.user.id;

//     const customer = await Customer.findByIdAndUpdate(customerId, {
//         $pull: { loyalRestaurants: restaurantId }
//     }, { new: true, runValidators: true });

//     res.status(200).json({
//         status: 'success',
//         data: {
//             customer
//         }
//     });
// });

// exports.addBlockedRestaurant = catchAsync(async (req, res, next) => {
//     const { customerId } = req.params;
//     const restaurantId = req.user.id;

//     const customer = await Customer.findByIdAndUpdate(customerId, {
//         $addToSet: { blockedRestaurants: restaurantId }
//     }, { new: true, runValidators: true });

//     res.status(200).json({
//         status: 'success',
//         data: {
//             customer
//         }
//     });
// });

// exports.removeBlockedRestaurant = catchAsync(async (req, res, next) => {
//     const { customerId } = req.params;
//     const restaurantId = req.user.id;

//     const customer = await Customer.findByIdAndUpdate(customerId, {
//         $pull: { blockedRestaurants: restaurantId }
//     }, { new: true, runValidators: true });

//     res.status(200).json({
//         status: 'success',
//         data: {
//             customer
//         }
//     });
// });

// loyalRestaurants: [
//     {
//         type: mongoose.Schema.ObjectId,
//         ref: "Restaurant",
//     },
// ],
// blockedRestaurants: [
//     {
//         type: mongoose.Schema.ObjectId,
//         ref: "Restaurant",
//     },
// ],

exports.addLoyalRestaurant = catchAsync(async (req, res, next) => {
    const { customerId } = req.params.customerId;
    const restaurantId = req.user.restaurantKey;

    // push the restaurantId to the loyalRestaurants array of the customer

    const customer = await Customer.findByIdAndUpdate(
        customerId,
        {
            $addToSet: { loyalRestaurants: restaurantId },
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            customer,
        },
    });
});

exports.removeLoyalRestaurant = catchAsync(async (req, res, next) => {
    const { customerId } = req.params.customerId;
    const restaurantId = req.user.restaurantKey;

    // push the restaurantId to the loyalRestaurants array of the customer

    const customer = await Customer.findByIdAndUpdate(
        customerId,
        {
            $pull: { loyalRestaurants: restaurantId },
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            customer,
        },
    });
});

exports.addBlockedRestaurant = catchAsync(async (req, res, next) => {
    const { customerId } = req.params.customerId;
    const restaurantId = req.user.restaurantKey;

    // push the restaurantId to the loyalRestaurants array of the customer

    const customer = await Customer.findByIdAndUpdate(
        customerId,
        {
            $addToSet: { blockedRestaurants: restaurantId },
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            customer,
        },
    });
});

exports.removeBlockedRestaurant = catchAsync(async (req, res, next) => {
    const { customerId } = req.params.customerId;
    const restaurantId = req.user.restaurantKey;

    // push the restaurantId to the loyalRestaurants array of the customer

    const customer = await Customer.findByIdAndUpdate(
        customerId,
        {
            $pull: { blockedRestaurants: restaurantId },
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            customer,
        },
    });
});
