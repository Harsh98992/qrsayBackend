const Feedback = require("../models/feedbackModel");
const Restaurant = require("../models/restaurantModel");
const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

// Add new feedback
exports.addFeedback = catchAsync(async (req, res, next) => {
    const { restaurantId, emoji, feedbackText, customerInfo } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(new AppError("Restaurant not found", 404));
    }

    // console.log("Restaurant found:", restaurant);

    console.log("Feedback details:", {
        restaurantId,
        emoji,
        feedbackText,
        customerInfo,
    });

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

    console.log(`Getting feedback for restaurant: ${restaurantId}`);

    // Check if restaurant exists
    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            console.log(`Restaurant not found: ${restaurantId}`);
            // Instead of returning an error, return an empty array
            // Set cache control headers to prevent caching
            res.setHeader(
                "Cache-Control",
                "no-store, no-cache, must-revalidate, proxy-revalidate"
            );
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            res.setHeader("Surrogate-Control", "no-store");

            return res.status(200).json({
                status: "success",
                results: 0,
                timestamp: new Date().toISOString(),
                message:
                    "No restaurant found with this ID, returning empty feedback",
                data: {
                    feedback: [],
                },
            });
        }
    } catch (error) {
        console.log(`Error finding restaurant: ${error.message}`);
        // Instead of returning an error, return an empty array
        // Set cache control headers to prevent caching
        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");

        return res.status(200).json({
            status: "success",
            results: 0,
            timestamp: new Date().toISOString(),
            message: "Error finding restaurant, returning empty feedback",
            data: {
                feedback: [],
            },
        });
    }

    // Get all feedback for the restaurant
    const feedback = await Feedback.find({ restaurantId }).sort({
        createdAt: -1,
    });

    console.log(
        `Found ${feedback.length} feedback items for restaurant: ${restaurantId}`
    );

    // Set cache control headers to prevent caching
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    res.status(200).json({
        status: "success",
        results: feedback.length,
        timestamp: new Date().toISOString(),
        data: {
            feedback,
        },
    });
});

// Get feedback statistics for a restaurant
exports.getFeedbackStats = catchAsync(async (req, res, next) => {
    const { restaurantId } = req.params;

    console.log(`Getting feedback stats for restaurant: ${restaurantId}`);

    // Check if restaurant exists
    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            console.log(`Restaurant not found for stats: ${restaurantId}`);
            // Instead of returning an error, return empty stats
            // Set cache control headers to prevent caching
            res.setHeader(
                "Cache-Control",
                "no-store, no-cache, must-revalidate, proxy-revalidate"
            );
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            res.setHeader("Surrogate-Control", "no-store");

            return res.status(200).json({
                status: "success",
                timestamp: new Date().toISOString(),
                message:
                    "No restaurant found with this ID, returning empty stats",
                data: {
                    stats: [],
                    totalFeedback: 0,
                    averageRating: 0,
                },
            });
        }
    } catch (error) {
        console.log(`Error finding restaurant for stats: ${error.message}`);
        // Instead of returning an error, return empty stats
        // Set cache control headers to prevent caching
        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");

        return res.status(200).json({
            status: "success",
            timestamp: new Date().toISOString(),
            message: "Error finding restaurant, returning empty stats",
            data: {
                stats: [],
                totalFeedback: 0,
                averageRating: 0,
            },
        });
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

    // Set cache control headers to prevent caching
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    res.status(200).json({
        status: "success",
        timestamp: new Date().toISOString(),
        data: {
            stats,
            totalFeedback,
            averageRating,
        },
    });
});

// Check if feedback collection exists
exports.checkFeedbackCollection = catchAsync(async (req, res, next) => {
    try {
        // Get database connection string from environment variables
        const dbUrl = process.env.DATABASE.replace(
            "<PASSWORD>",
            process.env.DATABASE_PASSWORD
        );

        // Connect to MongoDB
        const client = new MongoClient(dbUrl);
        await client.connect();

        // Get database name from connection string
        const dbName = dbUrl.split("/").pop().split("?")[0];
        const db = client.db(dbName);

        // Get list of collections
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map((c) => c.name);

        // Check if feedback collection exists
        const feedbackCollectionExists = collectionNames.includes("feedbacks");

        // Get count of feedback documents
        let feedbackCount = 0;
        if (feedbackCollectionExists) {
            feedbackCount = await db.collection("feedbacks").countDocuments();
        }

        // Close connection
        await client.close();

        // Return result
        res.status(200).json({
            status: "success",
            data: {
                feedbackCollectionExists,
                feedbackCount,
                collections: collectionNames,
            },
        });
    } catch (error) {
        console.error("Error checking feedback collection:", error);
        return next(new AppError("Error checking feedback collection", 500));
    }
});
