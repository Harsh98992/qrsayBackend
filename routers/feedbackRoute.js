const express = require("express");
const router = express.Router();
const {
    addFeedback,
    getFeedbackByRestaurant,
    getFeedbackStats
} = require("../controllers/feedbackController");
const authenticateController = require("../controllers/authenticaionController");

// Public route to add feedback (no authentication required)
router.post("/", addFeedback);

// Protected routes for restaurant owners and staff
router.get(
    "/restaurant/:restaurantId",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner", "staff"),
    getFeedbackByRestaurant
);

router.get(
    "/stats/:restaurantId",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner", "staff"),
    getFeedbackStats
);

module.exports = router;
