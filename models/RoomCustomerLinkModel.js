const mongoose = require("mongoose");

const roomCustomerLinkSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        index: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room.room",
        required: true,
    },
    roomName: {
        type: String,
        required: true,
    },
    customerPhoneNumber: {
        type: String,
        required: true,
        index: true,
    },
    customerName: {
        type: String,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    notificationSent: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create indexes for common query patterns
roomCustomerLinkSchema.index({ restaurantId: 1, isActive: 1 });
roomCustomerLinkSchema.index({
    customerPhoneNumber: 1,
    roomName: 1,
    isActive: 1,
});

const RoomCustomerLink = mongoose.model(
    "RoomCustomerLink",
    roomCustomerLinkSchema
);

module.exports = RoomCustomerLink;
