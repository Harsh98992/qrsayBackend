const express = require("express");
const {
    customerStoreRestaurant,
    getCustomer,
    deleteAddressOfRequestCustomerById,
    getCustomerPreviousRestaurant,
    addCustomerAddress,
    editCustomerAddress,
    getNearbyRestaurants,
    getAllRestaurants,
    getRestaurantDetailsFromRestaurantUrl,
    sendContactUsMail,
    getPromoCodesForRestaurantUrl,
    checkIfPromoCodeIsValid,
} = require("../controllers/customerController");
const {
    customerLogin,
    updateCustomerData
} = require("../controllers/customerAuthenticationController");
const customerAuthenticationController = require("../controllers/customerAuthenticationController");
const customerController = require("../controllers/customerController");
const { route } = require("./adminRoute");
const router = express.Router();
const authenticateController = require("../controllers/authenticaionController");
const sendWhatsappMsg = require("../helpers/whatsapp");
const apicache = require("apicache");
const cache = apicache.middleware;

// Configure apicache with options (if needed)
const cacheOptions = {
  // Specify caching duration (e.g., 5 minutes)
  defaultDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
};
router.post("/login", customerLogin);
router.post("/testlogin", async (req, res) => {
    await sendWhatsappMsg("8287231211", "231248");
    res.send({});
});

router.post(
    "/sendPhoneVerificationCode",
    customerAuthenticationController.sendPhoneVerificationCode
);

router.post(
    "/verifyPhoneVerificationCode",
    customerAuthenticationController.verifyPhoneVerificationCode
);

router.post("/storeRestaurant", customerStoreRestaurant);

router.patch(
    "/addCustomerAddress",
    customerAuthenticationController.customerProtect,
    addCustomerAddress
);

router.patch(
    "/editCustomerAddress",
    customerAuthenticationController.customerProtect,
    editCustomerAddress
);

router.get(
    "/getCustomer",
    customerAuthenticationController.customerProtect,

    getCustomer
);

router.delete(
    "/deleteAddressOfRequestCustomerById/:id",
    customerAuthenticationController.customerProtect,
    deleteAddressOfRequestCustomerById
);

router.post("/getCustomerPreviousRestaurant",
cache("5 minutes"),
getCustomerPreviousRestaurant);
router.post("/contactUs", sendContactUsMail);

// getNearbyRestaurants

router.get("/getNearbyRestaurants", getNearbyRestaurants);

router.get(
    "/getAllRestaurants",
    cache('5 minutes'),
    getAllRestaurants
);


router.get(
    "/getRestaurantDetailsFromRestaurantUrl/:restaurantUrl",
    cache(cacheOptions),
    getRestaurantDetailsFromRestaurantUrl
);

router.post("/whatsappLogin", customerAuthenticationController.whatsappLogin);

router.get(
    "/getPromoCodesForRestaurantUrl/:restaurantUrl",
    getPromoCodesForRestaurantUrl
);

router.post(
    "/checkIfPromoCodeIsValid",
    customerAuthenticationController.customerProtect,
    checkIfPromoCodeIsValid
);

router.post(
    "/updateCustomerData",
    customerAuthenticationController.customerProtect,
    updateCustomerData
);

router.get(
    "/isDineInAvailable/:restaurantId",
    customerAuthenticationController.customerProtect,
    customerController.isDineInAvailable
);

router.post(
    "/addPastLocation",
    customerAuthenticationController.customerProtect,
    customerController.addPastLocation
);



module.exports = router;
