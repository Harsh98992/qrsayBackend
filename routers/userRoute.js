const express = require("express");
const router = express.Router();
const authenticateController = require("../controllers/authenticaionController");

router.post("/signup", authenticateController.signUp);
router.post("/login", authenticateController.login);
router.post("/forgotPassword", authenticateController.forgotPassword);
router.patch("/resetPassword/:token", authenticateController.resetPassword);
router.post("/createUser", authenticateController.createUser);
router.patch(
    "/updatePassword",
    authenticateController.protect,
    authenticateController.updatePassword
);

router.post(
    "/emailVerification",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    authenticateController.sendEmailVerificationOtp
);

router.put(
    "/verifyEmailOtp",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    authenticateController.validateEmailFromOtp
);
router.get(
    "/getAllUsers",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    authenticateController.getAllUsers
);

router.post(
    "/addUser",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),

    authenticateController.addUser
);

router.delete(
    "/deleteUser/:id",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    authenticateController.deleteUser
);

router.patch(
    "/editUser/:id",
    authenticateController.protect,
    authenticateController.editUser
);

router.get(
    "/getUser/:id",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    authenticateController.getUser
);

router.get(
    "/getMe",
    authenticateController.protect,
    authenticateController.getMe
);

module.exports = router;
