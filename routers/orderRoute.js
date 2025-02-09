const express = require("express");
const {
  customerProtect,
} = require("../controllers/customerAuthenticationController");
const {
  placeOrder,
  storeOrder,
  getRestaurantOrdersByStatus,
  changeOrderStatus,
  getCustomerOrder,
  getLastOrder,
  getCustomerPaymentPendingOrder,
  changeOrderStatusByUser,
  changeOrderStatusByUserForCashOnDelivery,
  generateBill,
  getCustomerActiveOrder,
  getOrderwithOrderId,
  deleteOrderById,
  getRestaurantWithRoomService,
  getOrderwithRestaurantNameCustomerNameRoomName,
  validationBeforeOrder,
  paymentVerification,
  getOrderwithPaymentOrderId
} = require("../controllers/OrderController");
const authenticateController = require("../controllers/authenticaionController");
const { getPaymentGatewayCredentials } = require("../helpers/razorPayHelper");
const router = express.Router();

router.post("/validationBeforeOrder", customerProtect, validationBeforeOrder);
router.post("/placeOrder", customerProtect, placeOrder);
router.post("/verification", paymentVerification);
router.get("/customerOrder", customerProtect, getCustomerOrder);

// get last order of a customer of a restaurant
router.get("/getLastOrder/:restaurantId", customerProtect, getLastOrder);

router.get("/getOrderwithOrderId/:orderId", getOrderwithOrderId);
router.get("/getOrderwithPaymentOrderId/:orderId", getOrderwithPaymentOrderId);
router.delete(
  "/deleteOrderById/:orderId",
  authenticateController.protect,
  authenticateController.ristrictTo("restaurantOwner", "staff"),
  deleteOrderById
);
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
  // authenticateController.protect,
  // authenticateController.ristrictTo("restaurantOwner", "staff"),
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
