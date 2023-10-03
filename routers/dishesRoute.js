const express = require("express");
const router = express.Router();

const authenticateController = require("../controllers/authenticaionController");
const {
    addExtraIngredent,
    updateExtraIngredent,
    deleteExtraIngredent,
    addDishes,
    addVaraint,
    addCategory,
    getCategory,
    editCategory,
    deleteCategory,
    addAddons,
    editAddons,
    deleteAddons,
    deleteDish,
    editDishes,
    addDishChoices,
    deleteChoices,
    editDishChoices,
} = require("../controllers/dishesController");

router.post(
    "/extraIngredents",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    addExtraIngredent
);
router.patch(
    "/extraIngredents/edit",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    updateExtraIngredent
);
router.delete(
    "/extraIngredents/delete/:id",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    deleteExtraIngredent
);

router.post(
    "/addDish",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    addDishes
);
router.put(
    "/editDish",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    editDishes
);
router.put(
    "/deleteDish/:id",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    deleteDish
);
router.put(
    "/addVariants",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    addVaraint
);
router.patch(
    "/addCategory",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    addCategory
);

router.patch(
    "/editCategory",
    authenticateController.protect,

    authenticateController.ristrictTo("restaurantOwner"),
    editCategory
);
router.delete(
    "/deleteCategory/:id",
    authenticateController.protect,

    authenticateController.ristrictTo("restaurantOwner"),

    deleteCategory
);


router.patch(
    "/addAddons",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    addAddons
);
router.patch(
    "/addDishChoices",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    addDishChoices
);
router.patch(
    "/editAddons",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    editAddons
);
router.patch(
    "/editDishChoices",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    editDishChoices
);
router.delete(
    "/deleteAddons/:id",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    deleteAddons
);
router.delete(
    "/deleteChoices/:id",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    deleteChoices
);
router.get(
    "/getCategory",
    authenticateController.protect,
    authenticateController.ristrictTo("restaurantOwner"),
    getCategory
);
module.exports = router;
