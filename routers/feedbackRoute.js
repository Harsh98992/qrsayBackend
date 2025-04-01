const express = require("express");
const router = express.Router();
const {
    addFeedback,
    getFeedbackByRestaurant,
    getFeedbackStats,
    checkFeedbackCollection,
} = require("../controllers/feedbackController");
const authenticateController = require("../controllers/authenticaionController");

// Public route to add feedback (no authentication required)
router.post("/", addFeedback);

// Routes for feedback - accessible to all users
router.get("/restaurant/:restaurantId", getFeedbackByRestaurant);

router.get("/stats/:restaurantId", getFeedbackStats);

// Route to check if feedback collection exists
router.get("/check-collection", checkFeedbackCollection);

module.exports = router;
