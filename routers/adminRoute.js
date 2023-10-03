const express = require("express");
const {
    getRestaurantsByStatus,
    getRestaurantDetail,
    changeRestaurantStatus,
    viewAllUsersOfRestaurant,
    editRestaurant,
    sendEmailToRestaurant,
    updatePaymentGateway,
} = require("../controllers/adminController");
const authenticateController = require("../controllers/authenticaionController");
const { getPaymentGatewayCredentials } = require("../helpers/razorPayHelper");
const router = express.Router();

router.get(
    "/getRestaurantsByStatus/:restaurantVerified",
    authenticateController.protect,
    authenticateController.ristrictTo("admin", "restaurantOwner"),
    getRestaurantsByStatus
);

router.get(
    "/getRestaurantDetail/:id",
    authenticateController.protect,
    authenticateController.ristrictTo("admin", "restaurantOwner"),
    getRestaurantDetail
);
router.patch(
    "/changeRestaurantStatus/:id",
    authenticateController.protect,
    authenticateController.ristrictTo("admin", "restaurantOwner"),
    changeRestaurantStatus
);

router.get(
    "/viewAllUsersOfRestaurant/:id",
    authenticateController.protect,
    authenticateController.ristrictTo("admin", "restaurantOwner"),
    viewAllUsersOfRestaurant
);

router.patch(
    "/editRestaurant/:id",
    authenticateController.protect,
    authenticateController.ristrictTo("admin", "restaurantOwner"),
    editRestaurant
);

router.post(
    "/sendEmailToRestaurant",
    authenticateController.protect,
    authenticateController.ristrictTo("admin", "restaurantOwner"),
    sendEmailToRestaurant
);
router.post(
    "/updatePaymentGateway",
   
    // authenticateController.protect,
    // authenticateController.ristrictTo("admin", "restaurantOwner"),
    updatePaymentGateway
);

module.exports = router;
