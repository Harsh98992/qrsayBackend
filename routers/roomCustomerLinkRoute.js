const express = require("express");
const router = express.Router();
const roomCustomerLinkController = require("../controllers/roomCustomerLinkController");
const authenticateController = require("../controllers/authenticaionController");
const customerAuthenticationController = require("../controllers/customerAuthenticationController");

// Routes for admin (hotel reception)
router.post(
    "/create",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    roomCustomerLinkController.createRoomCustomerLink
);

router.get(
    "/active",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    roomCustomerLinkController.getActiveRoomCustomerLinks
);

router.patch(
    "/deactivate/:linkId",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    roomCustomerLinkController.deactivateRoomCustomerLink
);

router.post(
    "/resend-notification/:linkId",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    roomCustomerLinkController.resendNotification
);

// Routes for customer
router.get("/validate", roomCustomerLinkController.validateRoomCustomerLink);

// DEBUG route - for testing only
router.post(
    "/generate-test-link",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    roomCustomerLinkController.generateTestLink
);

module.exports = router;
