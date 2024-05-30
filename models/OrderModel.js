const { required, string, boolean } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderDetailSchema = new mongoose.Schema({
    orderAmount: {
        type: Number,
    },
    customerName: {
        type: String,
        default: "",
    },
    customerEmail: {
        type: String,
        default: "",
    },
    customerPhoneNumber: {
        type: String,
        default: "",
    },

    orderPlaceDateAndTime: {
        type: Date,
        default: Date.now,
    },
    gstAmount: {
        type: Number,
    },
    deliveryAmount: {
        type: Number,

        default: 0,
    },
    discountAmount: {
        type: Number,
        default: 0,
    },
    cookingInstruction: {
        type: String,
        default: "",
    },
    preprationTime: {
        type: String,
    },
    orderSummary: {
        type: [],
    },
});
const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId(),
        // required: [true, "Customer Id is missing"],
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Restaurant Id is missing"],
    },
    orderId: {
        type: String,
        required: [true, "Please provide orderId!"],
    },
    customerName: {
        type: String,
        default: "",
    },
    customerPhoneNumber: {
        type: String,
        default: "",
    },

    orderDate: {
        type: Date,
        default: Date.now,
    },
    orderDetails: {
        type: [orderDetailSchema],
    },

    customerEmail: {
        type: String,
        default: "",
    },

    customerPreferences: {
        type: Schema.Types.Mixed,
        default: {},
    },
    orderStatus: {
        type: String,
        default: "pending",
    },
    customerPhoneNumber: {
        type: String,
        default: "",
    },
    reason: {
        type: String,
        default: "",
    },
    payment_order_id: {
        type: String,
        default: "",
    },
    payment_transfer_id: {
        type: String,
        default: "",
    },
    transfer_amount:{
        type: Number,
    },
    
    payment_id: {
        type: String,
        default: "",
    },
    cashOnDeliveryAvailable: {
        type: Boolean,
        default: false,
    },
    paymentOnlineAvailable: {
        type: Boolean,
        default: false,
    },
    payment_signature: {
        type: String,
        default: "",
    },

    payment_time: {
        type: String,
    },
    payment_amount: {
        type: Number,
    },
    payment_method: {
        type: String,
    },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
