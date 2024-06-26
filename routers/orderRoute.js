const express = require("express");
const {
  customerProtect,
} = require("../controllers/customerAuthenticationController");
const {
  placeOrder,
  getRestaurantOrdersByStatus,
  changeOrderStatus,
  getCustomerOrder,
  getCustomerPaymentPendingOrder,
  changeOrderStatusByUser,
  changeOrderStatusByUserForCashOnDelivery,
  generateBill,
  getCustomerActiveOrder,
  getOrderwithOrderId,
  getRestaurantWithRoomService,
  getOrderwithRestaurantNameCustomerNameRoomName,
  validationBeforeOrder
} = require("../controllers/OrderController");
const authenticateController = require("../controllers/authenticaionController");
const { getPaymentGatewayCredentials } = require("../helpers/razorPayHelper");
const router = express.Router();

router.post("/validationBeforeOrder", customerProtect, validationBeforeOrder);
router.post("/placeOrder", customerProtect, placeOrder);
router.get("/customerOrder", customerProtect, getCustomerOrder);
router.get("/getOrderwithOrderId/:orderId", getOrderwithOrderId);
router.get("/getRestaurantWithRoomService", getRestaurantWithRoomService);
router.post(
  "/getOrderwithRestaurantNameCustomerNameRoomName",
  getOrderwithRestaurantNameCustomerNameRoomName
);
router.get(
  "/getCustomerPaymentPendingOrder",
  customerProtect,
  getCustomerPaymentPendingOrder
);
router.get("/getCustomerActiveOrder", customerProtect, getCustomerActiveOrder);
router.put(
  "/getRestaurantOrdersByStatus",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner", "staff"),
  getRestaurantOrdersByStatus
);
router.patch(
  "/changeOrderStatus",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner", "staff"),
  changeOrderStatus
);
router.patch(
  "/changeOrderStatusByUser",
  customerProtect,
  getPaymentGatewayCredentials,
  changeOrderStatusByUser
);
router.patch(
  "/changeOrderStatusByUserForCashOnDelivery",
  customerProtect,
  changeOrderStatusByUserForCashOnDelivery
);
router.get(
  "/generateBill/:orderId",

  generateBill
);

module.exports = router;
