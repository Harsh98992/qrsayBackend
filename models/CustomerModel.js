const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
// Define the user schema

const previousRestaurantSearch = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    restaurantId: {
        type: String,
    },
});

const addressSchema = new mongoose.Schema({
    address: {
        type: String,
        required: [true, "Please provide your address"],
    },

    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    pinCode: {
        type: Number,
    },
    landmark: {
        type: String,
        default: "",
    },
    phoneNumber: {
        type: Number,
        default: "",
    },
    googleLocationAddress: {
        type: String,
        default: "",
    },
});

const customerSchema = new mongoose.Schema({
    email: {
        type: String,
        validate: [validator.isEmail, "Please provide a valid email"],
    },
    name: {
        type: String,
    },
    phoneNumber: {
        type: String,
        default: "",
    },
    password: {
        type: String,
        minlength: 8,
        select: false, // not show password in output
    },
    addresses: [addressSchema],

    socialLogin: {
        type: String,
        required: [true, "Please provide your social login"],
        default: "",
    },
    previousRestaurant: [
        {
            type: previousRestaurantSearch,
            default: {},
        },
    ],
});

customerSchema.pre("save", async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified("password")) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

customerSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

customerSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

customerSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

customerSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

customerSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Create a User model based on the user schema
const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
