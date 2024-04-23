const { number } = require("joi");
const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
    size: {
        type: "String",
        require: [true, "Size is required!"],
    },
    price: {
        type: "Number",
        require: [true, "Price is required!"],
    },
    sizeDescription: {
        type: "String",
    },
    defaultSize: {
        type: "Boolean",
        default: false,
    },
});
const dishSchema = new mongoose.Schema({
    dishPriority: {
        type: "Number",
        default: 1000,
    },
    applyDiscount: {
        type: Boolean,
        default: false,
    },
    dishActualPrice: {
        type: Number,
        required: true,
        min: 0,
        default:0,
    },
    dishName: {
        type: "String",
    },
    availableFlag: {
        type: "Boolean",
        default: true,
    },
    imageUrl: {
        type: "String",
    },
    imgurUrl: {
        type: "String",
    },
    cloudinaryUrl: {
        type: "String",
    },

    s3Url: {
        type: "String",
    },
    dishDescription: {
        type: "String",
    },
    dishPrice: {
        type: "Number",
    },
    dishOrderOption: {
        type: "String",
    },
    dishType: {
        type: "String",
    },
    chilliFlag: {
        type: "Boolean",
    },
    sizeAvailable: {
        type: [sizeSchema],
    },
    addOns: {
        type: [],
        default: [],
    },
    choicesAvailable: {
        type: [],
        default: [],
    },
    days: {
        type: [String],
        default: [],
    },
});
const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        default: "",
    },
    items: [dishSchema],
    categoryPriority: {
        type: Number,
        default: 1000,
    },
    categoryDescription: {
        type: String,
        default: "",
    },
    categoryImage: {
        type: String,
        default: "",
    },

    categoryAvailable: {
        type: Boolean,
        default: true,
    },

    endTime: {
        type: String,
    },

    startTime: {
        type: String,
    },
    timeAvailable: {
        type: Boolean,
        default: false,
    },

    days: {
        type: [String],
        default: [],
    },
    isVeg: {
        type: Boolean,
        default: true,
    },
    isNonVeg: {
        type: Boolean,
        default: false,
    },
});

const addressSchema = new mongoose.Schema({
    street: {
        type: "String",
    },
    city: {
        type: "String",
    },
    state: {
        type: "String",
    },
    pinCode: {
        type: "string",
    },
    googleLocation: {
        type: "string",
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    landmark: {
        type: "string",
    },
});

const socialSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    linkToPage: {
        type: String,
    },
});
const addOnSchema = new mongoose.Schema({
    addOnGroupName: {
        type: String,
        require: [true, "Please provide Add on group name!"],
    },
    addOnDisplayName: {
        type: String,
        require: [true, "Please provide Add on group name!"],
    },
    addOnMaxValue: {
        type: Number,
    },
    addOnMinValue: {
        type: Number,
    },
    addOns: [],
});
const choicesSchema = new mongoose.Schema({
    choicesGroupName: {
        type: String,
        require: [true, "Please provide Add on group name!"],
    },
    choicesDisplayName: {
        type: String,
        require: [true, "Please provide Add on group name!"],
    },
    choicesMinValue: {
        type: Number,
    },
    choicesMaxValue: {
        type: Number,
    },
    choicesGroup: [],
});
const contactSchema = new mongoose.Schema({
    contactType: {
        type: String,
        require: [true, "Please provide contact type!"],
    },
    contactDetails: {
        type: String,
        require: [true, "Please provide contact detail!"],
    },
});

const restaurantSchema = new mongoose.Schema({
    restaurantName: {
        type: "string",
        required: true,
        maxLength: 50,
    },
    disabled: {
        type: "boolean",
        default: false,
    },
    restaurantVerified: {
        type: "boolean",
        default: false,
    },

    restaurantUrl: {
        type: "string",
        default: "",
    },
    restaurantBackgroundImage: {
        type: "string",
        default: "",
    },
    restaurantPhoneNumber: {
        type: "string",
    },
    restaurantEmail: {
        type: "string",
    },
    restaurantStatus: {
        type: "string",
        enum: ["online", "offline"],
        default: "offline",
    },
    restaurantType: [],
    restaurantImages: [],
    restaurantId: {
        type: "ObjectId",
    },
    address: addressSchema,
    openTime: {
        type: "string",
    },
    closeTime: {
        type: "string",
    },
    gstNumber: {
        type: "String",
    },
    isPricingInclusiveOfGST: {
        type: "Boolean",
        default: false,
    },
    isGstApplicable: {
        type: "Boolean",
        default: false,
    },
    customGSTPercentage: {
        type: "Number",
        default: 0,
    },

    placeId: {
        type: "string",
    },

    addOns: [
        {
            type: addOnSchema,
            default: {},
        },
    ],
    dishChoices: [
        {
            type: choicesSchema,
            default: {},
        },
    ],
    fssaiLicenseNumber: {
        type: "String",
    },

    social_links: [
        {
            type: socialSchema,
            default: {},
        },
    ],

    cuisine: [
        {
            type: categorySchema,
            default: {},
        },
    ],
    contact: [
        {
            type: contactSchema,
            default: {},
        },
    ],

    showGoogleReview: {
        type: Boolean,
        default: true,
    },
    googlePlaceId: {
        type: String,
        default: "",
    },
    provideDelivery: {
        type: Boolean,

        default: false,
    },
    maxDeliveryDistance: {
        type: Number,
        default: 0,
    },
    minOrderValueForFreeDelivery: {
        type: Number,
        default: 0,
    },
    deliveryFeeBelowMinValue: {
        type: Number,
        default: 0,
    },
    minOrderValueForDelivery: {
        type: Number,
        default: 0,
    },

    facebookUrl: {
        type: String,
        default: "",
    },
    instagramUrl: {
        type: String,
        default: "",
    },

    youtubeUrl: {
        type: String,
        default: "",
    },
    twitterUrl: {
        type: String,
        default: "",
    },
    linkedInUrl: {
        type: String,
        default: "",
    },
    paymentgatewayData: {
        iv: String,
        gatewayData: {},
        authTag: String,
    },

    websiteUrl: {
        type: String,

        default: "",
    },
    openTime: {},
    closeTime: {},
    openDays: {
        type: [String],
        default: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ],
    },
});

const Restaurant = new mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
