const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurantModel");
const catchAsync = require("../helpers/catchAsync");
const {
    getRestaurantDetail,
    updateRestaurantDetail,
    updateRestaurantBannerImage,
    getRestaurantReview,
    getRestaurant,
    updateStoreSettings,
    changeRestaurantStatus,
    addContactDetail,
    getCustomerList,
    updateContactDetail,
    addPromoCode,
    deleteContactDetail,
    getPromoCode,
} = require("../controllers/restaurantController");

const restaurantController = require("../controllers/restaurantController");
const {
    updateRestaurantPlaceId,
    updateRestaurantImage,
    deleteRestaurantImage,
} = require("../controllers/restaurantSettingController");
const authenticateController = require("../controllers/authenticaionController");
const {
    customerProtect,
} = require("../controllers/customerAuthenticationController");

restaurantSettingController = require("../controllers/restaurantSettingController");
const apicache = require("apicache");
const cache = apicache.middleware;

const cacheOptions = {
    defaultDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
};
router.get("/getRestaurant", getRestaurant);

router.get(
    "/restaurantDetail",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner", "staff"),
    getRestaurantDetail
);

router.post(
    "/restaurantDetail",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    updateRestaurantDetail
);

router.patch(
    "/updateStoreSettings",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    updateStoreSettings
);

router.patch(
    "/addContactDetail",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    addContactDetail
);

router.delete(
    "/deleteContactDetail/:id",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    deleteContactDetail
);

router.patch(
    "/updateContactDetail",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    updateContactDetail
);

router.put(
    "/updateImage",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    updateRestaurantBannerImage
);
router.patch(
    "/changeRestaurantStatus",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    changeRestaurantStatus
);
router.patch(
    "/updateRestaurantImage",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    updateRestaurantImage
);
router.patch(
    "/deleteRestaurantImage",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    deleteRestaurantImage
);

router.get(
    "/getRestaurantImages",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    updateRestaurantImage
);

router.get("/reviews/:placeId", cache("5 minutes"), getRestaurantReview);
router.patch(
    "/placeId",
    authenticateController.protect,
    updateRestaurantPlaceId
);

router.get(
    "/getAllTables",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    restaurantSettingController.getAllTables
);

router.post(
    "/createTableEntry",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    restaurantSettingController.createTableEntry
);

router.patch(
    "/editTableById",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    restaurantSettingController.editTableById
);

router.patch(
    "/checkDineInTableAvailability",
    authenticateController.protect,
    customerProtect,
    restaurantSettingController.checkDineInAvailable
);
router.get(
    "/checkAciveDineIn/:restaurantId",
    restaurantSettingController.checkAciveDineIn
);

router.delete(
    "/deleteTableById/:tableId",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    restaurantSettingController.deleteTableById
);

router.patch(
    "/addPromoCode",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    addPromoCode
);

router.get(
    "/getPromoCode",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),

    getPromoCode
);

router.get(
    "/getCustomerList",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    getCustomerList
);

router.patch(
    "/loyal/add",
    authenticateController.protect,
    restaurantController.addLoyalRestaurant
);

router.patch(
    "/loyal/remove",
    authenticateController.protect,
    restaurantController.removeLoyalRestaurant
);

router.patch(
    "/block/add",
    authenticateController.protect,
    restaurantController.addBlockedRestaurant
);

router.patch(
    "/block/remove",
    authenticateController.protect,
    restaurantController.removeBlockedRestaurant
);

module.exports = router;
