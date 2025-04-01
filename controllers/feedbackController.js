const Feedback = require("../models/feedbackModel");
const Restaurant = require("../models/restaurantModel");
const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const mongoose = require("mongoose");

// Add new feedback
exports.addFeedback = catchAsync(async (req, res, next) => {
    const { restaurantId, emoji, feedbackText, customerInfo } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(new AppError("Restaurant not found", 404));
    }

    // console.log("Restaurant found:", restaurant);


    console.log("Feedback details:", { restaurantId, emoji, feedbackText, customerInfo });

    // Create new feedback
    const feedback = await Feedback.create({
        restaurantId,
        emoji,
        feedbackText,
        customerInfo: customerInfo || {},
    });
    console.log("Feedback added successfully.");

    res.status(201).json({
        status: "success",
        data: {
            feedback,
        },
    });
});

// Get all feedback for a restaurant
exports.getFeedbackByRestaurant = catchAsync(async (req, res, next) => {
    const { restaurantId } = req.params;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(new AppError("Restaurant not found", 404));
    }

    // Get all feedback for the restaurant
    const feedback = await Feedback.find({ restaurantId }).sort({
        createdAt: -1,
    });

    res.status(200).json({
        status: "success",
        results: feedback.length,
        data: {
            feedback,
        },
    });
});

// Get feedback statistics for a restaurant
exports.getFeedbackStats = catchAsync(async (req, res, next) => {
    const { restaurantId } = req.params;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(new AppError("Restaurant not found", 404));
    }

    // Get feedback statistics
    const stats = await Feedback.aggregate([
        {
            $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) },
        },
        {
            $group: {
                _id: "$emoji",
                count: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    // Calculate total and average
    const totalFeedback = await Feedback.countDocuments({ restaurantId });
    let totalScore = 0;
    stats.forEach((stat) => {
        totalScore += stat._id * stat.count;
    });
    const averageRating = totalFeedback > 0 ? totalScore / totalFeedback : 0;

    res.status(200).json({
        status: "success",
        data: {
            stats,
            totalFeedback,
            averageRating,
        },
    });
});
