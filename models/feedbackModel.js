const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    emoji: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        comment: "Rating from 1-5 represented by emoji"
    },
    feedbackText: {
        type: String,
        required: false,
    },
    customerInfo: {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: false,
        },
        name: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
