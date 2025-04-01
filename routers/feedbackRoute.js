const express = require("express");
const router = express.Router();
const {
    addFeedback,
    getFeedbackByRestaurant,
    getFeedbackStats,
} = require("../controllers/feedbackController");
const authenticateController = require("../controllers/authenticaionController");

// Public route to add feedback (no authentication required)
router.post("/", addFeedback);

// Routes for feedback - accessible to all users
router.get("/restaurant/:restaurantId", getFeedbackByRestaurant);

router.get("/stats/:restaurantId", getFeedbackStats);

module.exports = router;
