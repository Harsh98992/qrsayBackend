const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurantModel");
const catchAsync = require("../helpers/catchAsync");
const {
  getRestaurantDetail,

  updateRestaurantDetail,
  updateRestaurantBannerImage,
  updateRestaurantBannerImageForMobile,
  updateRestaurantBannerImageForSmall,
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
  updateRestaurantCashOnDelivery,
  updateRestaurantByPassAuth,
  updateRestaurantAutoReject,
  updateRestaurantDineInGstSetting,
  generateBill
} = require("../controllers/restaurantSettingController");
const authenticateController = require("../controllers/authenticaionController");
const {
  customerProtect,
} = require("../controllers/customerAuthenticationController");
const {
  getRestaurantDetailsFromRestaurantId,
} = require("../controllers/customerController");

restaurantSettingController = require("../controllers/restaurantSettingController");
const apicache = require("apicache");
const cache = apicache.middleware;

const cacheOptions = {
  defaultDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
};
router.get("/getRestaurant", getRestaurant);
router.get(
  "/getRestaurantById/:restaurantId",
  getRestaurantDetailsFromRestaurantId
);

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

router.post(
  "/generateBill",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner",'staff'),
  generateBill
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

router.put(
  "/updateRestaurantBannerImageForMobile",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  updateRestaurantBannerImageForMobile
);

router.put(
  "/updateRestaurantBannerImageForSmall",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  updateRestaurantBannerImageForSmall
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
  "/updateRestaurantCashOnDelivery",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  updateRestaurantCashOnDelivery
);
router.patch(
  "/updateRestaurantByPassAuth",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  updateRestaurantByPassAuth
);
router.patch(
  "/updateRestaurantAutoReject",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  updateRestaurantAutoReject
);
router.patch(
  "/updateRestaurantDineInGstSetting",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  updateRestaurantDineInGstSetting
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
router.get(
  "/getAllRooms",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  restaurantSettingController.getAllRooms
);

router.post(
  "/createTableEntry",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  restaurantSettingController.createTableEntry
);
router.post(
  "/createRoomEntry",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  restaurantSettingController.createRoomEntry
);
router.patch(
  "/editTableById",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  restaurantSettingController.editTableById
);
router.patch(
  "/editRoomById",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  restaurantSettingController.editRoomById
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
  "/deleteRoomById/:roomId",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner"),
  restaurantSettingController.deleteRoomById
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
