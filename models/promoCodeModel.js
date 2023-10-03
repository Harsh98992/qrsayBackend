const mongoose = require("mongoose");

const individualPromoCodeSchema = new mongoose.Schema({
    codeName: {
        type: String,
        required: [true, "Please provide Promo Code name!"],
        unique: true,
    },
    description: {
        type: String,
    },
    discountAmount: {
        type: Number,
        required: [true, "Please provide Discount amount!"],
    },
    discountType: {
        type: String,
        enum: ["Percentage", "flat"],
        required: [true, "Please provide Discount type!"],
    },
    minOrderValue: {
        type: Number,
        required: [true, "Please provide minimum order value!"],
    },
    startDate: {
        type: Date,
        required: [true, "Please select start date!"],
    },
    endDate: {
        type: Date,
        required: [true, "Please select end date!"],
    },
    perUserLimit: {
        type: Number,
    },
    totalUsageLimit: {
        type: Number,
    },
    applicableFor: {
        type: String,
        enum: ["new", "all"],
        required: true,
    },
    mealTime: {
        type: String,
    },
    runThisOffer: {
        type: Boolean,
    },

    usedCount: {
        type: Number,
    },
    days: {
        type: [String],

    },
    maxDiscount: {
        type: Number,
        required: [true, "Please provide maximum discount amount!"],
    },
    active: {
        default: true,
        type: Boolean,
    },
});

const promoCodeSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant", // Reference to the Restaurant model
        required: true,
    },
    promoCodes: [individualPromoCodeSchema],
});

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

module.exports = PromoCode;
