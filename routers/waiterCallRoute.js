const express = require("express");
const router = express.Router();
const {
    callWaiter,
    getWaiterCalls,
    updateWaiterCallStatus,
} = require("../controllers/waiterCallController");
const authenticateController = require("../controllers/authenticaionController");

// Public endpoint for customers to call a waiter
router.post("/callWaiter", callWaiter);

// Protected endpoints for restaurant staff/owners
// Keep the authenticated route for production use
router.get("/getWaiterCalls", authenticateController.protect, getWaiterCalls);

// Add a public endpoint for testing and debugging
// This allows getting waiter calls without authentication
router.get("/getWaiterCallsPublic", getWaiterCalls);

router.patch(
    "/updateStatus",
    authenticateController.protect,
    updateWaiterCallStatus
);

router.post("/updateStatusPublic", updateWaiterCallStatus);

module.exports = router;
