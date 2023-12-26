const { response } = require("express");
const AppError = require("../helpers/appError");
const catchAsync = require("../helpers/catchAsync");
const Restaurant = require("../models/restaurantModel");
const {
    uploadToImgur,
    compressImage,
    uploadToAwsS3,
} = require("../helpers/image");

async function returnDataWithImageUrls(req) {
    let initialImageUrl = "";
    let imgurUrl = "";
    let imageData = "";
    let imageDataWithoutPrefix = "";
    let compressedImage = "";
    let compressedImageimgurUrl = "";
    let s3Url = "";
    // let cloudinaryUrl = "";

    // console.log(req.body.imageUrl);

    if (req.body.imageUrl.startsWith("data:image/")) {
        imageDataWithoutPrefix = req.body.imageUrl.replace(
            /^data:image\/[a-z]+;base64,/,
            ""
        );

        // console.log(imageDataWithoutPrefix);

        imageData = req.body.imageUrl;

        try {
            console.log("Uploading to Imgur");
            imgurUrl = await uploadToImgur(imageData.split(",")[1]);
        } catch (err) {
            console.log(err);
            imgurUrl = req.body.imageUrl;
        }

        initialImageUrl = imgurUrl;

        try {
            imageData = req.body.imageUrl;

            restaurantId = req.user.restaurantKey;

            categoryId = req.body.dishCategory;

            dishName = req.body.dishName;

            fileFormat = req.body.imageUrl.split(";")[0].split("/")[1];

            key = `Images/restaurant/${restaurantId}/dishes/categories/${categoryId}/${dishName}.${fileFormat}`;

            console.log("Uploading to S3");

            s3Url = uploadToAwsS3(imageData, key);
        } catch (err) {
            console.log(err);
        }

        try {
            imageData = req.body.imageUrl;
            compressedImage = await compressImage(imageData);

            console.log("Uploading to Imgur");

            compressedImageimgurUrl = await uploadToImgur(compressedImage);

            console.log(compressedImageimgurUrl);
        } catch (err) {
            console.log(err);
        }
    } else {
        initialImageUrl = req.body.imageUrl;
    }

    console.log("initialImageUrl", initialImageUrl);
    console.log("compressedImageimgurUrl", compressedImageimgurUrl);
    console.log("imgurUrl", imgurUrl);

    return {
        dishName: req.body.dishName,
        dishPrice: req.body.dishPrice,
        dishActualPrice: req.body.dishActualPrice,
        applyDiscount: req.body.applyDiscount,
        dishType: req.body.dishType,
        dishDescription: req.body.dishDescription,
        dishOrderOption: req.body.dishOrderOption,
        imageUrl: compressedImageimgurUrl || imgurUrl || initialImageUrl,
        imgurUrl: imgurUrl,
        sizeAvailable: req.body.sizeAvailabe,
        chilliFlag: req.body.spicy,
        addOns: req.body.addOns,
        choicesAvailable: req.body.choicesAvailable,
    };
}

exports.addDishes = catchAsync(async (req, res, next) => {
    const data = await returnDataWithImageUrls(req);

    const key = `cuisine.$.items`;

    const result = await Restaurant.updateOne(
        {
            _id: req.user.restaurantKey,
            "cuisine._id": req.body.dishCategory,
        },
        { $push: { [key]: data } },

        { multi: true }
    );
    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});
exports.editDishes = catchAsync(async (req, res, next) => {
    let data = await returnDataWithImageUrls(req);

    const id = req.body.dishId;
    const key = `cuisine.$.items`;
    let result = await Restaurant.updateOne(
        {
            _id: req.user.restaurantKey,
            "cuisine._id": req.body.previousDishCategory,
        },
        { $pull: { [key]: { _id: id } } }
    );
    if (result.modifiedCount) {
        result = await Restaurant.updateOne(
            {
                _id: req.user.restaurantKey,
                "cuisine._id": req.body.dishCategory,
            },
            { $push: { [key]: data } },

            { multi: true }
        );

        res.status(200).json({
            status: "success",
            data: {
                message: "Record Updated Successfully!",
            },
        });
    } else {
        return next(new AppError("Unable to find Dish!", 400));
    }
});
exports.addExtraIngredent = catchAsync(async (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return next(
            new AppError("Please provide extraIngredent name and price!", 400)
        );
    }
    const checkAvailable = Restaurant.findOne(
        {
            _id: req.user.restaurantKey,
        },
        {
            addOns: {
                $elemMatch: {
                    addOnGroupName: req.body.name,
                },
            },
        }
    ).select("_id");
    console.log(checkAvailable);
    if (checkAvailable) {
        return next(new AppError("Record already exists!", 400));
    }
    const data = {
        name: req.body.name.toLowerCase(),
        price: req.body.price,
    };

    await Restaurant.findOneAndUpdate(
        { _id: req.user.restaurantKey },
        { $push: { extraIngredents: data } }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.updateExtraIngredent = catchAsync(async (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return next(
            new AppError("Please provide extraIngredent name and price!", 400)
        );
    }
    const data = {
        name: req.body.name.toLowerCase(),
        price: req.body.price,
    };

    const result = await Restaurant.updateOne(
        { _id: req.user.restaurantKey, "extraIngredents._id": req.body.id },
        {
            $set: {
                "extraIngredents.$.price": data.price,
                "extraIngredents.$.name": data.name,
            },
        }
    );

    // check_if_a_dish_is_using_this_extra_ingredent = await Restaurant.find({
    //     _id: req.user.restaurantKey,
    //     cuisine: {
    //         $elemMatch: {
    //             items: {
    //                 $elemMatch: {
    //                     addOns: {
    //                         $elemMatch: {
    //                             $elemMatch: {
    //                                 name: data.name,
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //     },
    // }).select("_id");

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.deleteExtraIngredent = catchAsync(async (req, res, next) => {
    if (!req.params.id) {
        return next(new AppError("Unable to find extra ingredents!", 400));
    }

    const userId = req.params.id;
    const result = await Restaurant.updateOne(
        { _id: req.user.restaurantKey },
        { $pull: { extraIngredents: { _id: userId } } },
        { multi: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.deleteDish = catchAsync(async (req, res, next) => {
    if (!req.params.id) {
        return next(new AppError("Unable to find Dish!", 400));
    }

    const id = req.params.id;

    const result = await Restaurant.updateOne(
        {
            _id: req.user.restaurantKey,
            "cuisine._id": req.body.categoryId,
        },
        { $pull: { "cuisine.$.items": { _id: id } } },

        { multi: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});
exports.addVaraint = catchAsync(async (req, res, next) => {
    const data = req.body.data;
    // const key = `cuisine.${req.body.dishCategory}`;
    const key = "cuisine.starter.dishName";
    const result = await Restaurant.findOne(
        {
            _id: req.user.restaurantKey,
        },
        {
            [key]: "fdasfa",
        }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});
//Todo make the update and delete api for category
exports.addCategory = catchAsync(async (req, res, next) => {
    if (!req.body.category) {
        return next(new AppError("Please provide category!", 400));
    }
    const categoryValue = { categoryName: req.body.category.toLowerCase() };
    const checkExists = await Restaurant.find({
        _id: req.user.restaurantKey,
        cuisine: {
            $elemMatch: {
                categoryName: categoryValue.categoryName,
            },
        },
    }).select("_id");
    if (checkExists.length) {
        return next(new AppError("Category already exists!", 400));
    }

    const result = await Restaurant.updateOne(
        { _id: req.user.restaurantKey },
        { $push: { cuisine: categoryValue } },

        { multi: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.editCategory = catchAsync(async (req, res, next) => {
    const categoryId = req.body.categoryId;

    const newCategoryName = req.body.categoryName;

    if (!newCategoryName) {
        return next(new AppError("New category name is required.", 400));
    }

    let restaurant = await Restaurant.findOne({
        _id: req.user.restaurantKey,
    });

    if (!restaurant) {
        return next(
            new AppError(
                "Restaurant not found or category not associated with the restaurant.",
                404
            )
        );
    }

    let checkExists = await Restaurant.find({
        _id: req.user.restaurantKey,
        cuisine: {
            $elemMatch: {
                categoryName: newCategoryName,
                _id: { $ne: categoryId }, // exclude the category being edited
            },
        },
    }).select("_id");

    if (checkExists.length) {
        return next(new AppError("Category already exists!", 400));
    }

    // first get all the cuisine
    let cuisine = restaurant.cuisine;

    // find the category to be updated
    let category = cuisine.find((category) => category._id == categoryId);

    // update the category name
    category.categoryName = newCategoryName;

    // update the cuisine

    restaurant.cuisine = cuisine;

    // save the restaurant
    // await restaurant.save();

    const result = await Restaurant.updateOne(
        { _id: req.user.restaurantKey, "cuisine._id": categoryId },

        {
            $set: {
                "cuisine.$.categoryName": newCategoryName,
            },
        },
        { multi: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Category updated successfully.",
        },
    });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const categoryId = req.params.id;

    const restaurant = await Restaurant.findOne({
        _id: req.user.restaurantKey,
        "cuisine._id": categoryId,
    });

    if (!restaurant) {
        return next(
            new AppError(
                "Restaurant not found or category not associated with the restaurant.",
                404
            )
        );
    }

    const updatedCategories = restaurant.cuisine.filter(
        (category) => category._id.toString() !== categoryId
    );

    if (restaurant.cuisine.length === updatedCategories.length) {
        return next(new AppError("Category not found in the restaurant.", 404));
    }

    // check if the cuisine is associated with any dish
    const checkExists = await Restaurant.find({
        _id: req.user.restaurantKey,

        cuisine: {
            $elemMatch: {
                _id: categoryId,

                items: {
                    $exists: true,
                    $ne: [],
                },
            },
        },
    }).select("_id");

    if (checkExists.length) {
        return next(
            new AppError(
                "Category is associated with some dishes. Please remove the dishes first.",

                400
            )
        );
    }

    restaurant.cuisine = updatedCategories;

    await restaurant.save();

    res.status(204).json({
        status: "success",
        data: null,
    });
});

exports.getCategory = catchAsync(async (req, res, next) => {
    const result = await Restaurant.findOne({
        _id: req.user.restaurantKey,
    });
    let categoryResult = [];

    if (result && result.cuisine && result.cuisine.length) {
        for (const data of result.cuisine) {
            categoryResult.push({
                categoryName: data.categoryName,
                _id: data._id,
            });
        }
    }
    res.status(200).json({
        status: "success",
        data: {
            category: categoryResult,
            addOns: result?.addOns,
            dishChoices: result?.dishChoices,
        },
    });
});
exports.addAddons = catchAsync(async (req, res, next) => {
    const data = {
        addOnGroupName: req.body.addOnGroupName.toLowerCase(),
        addOnDisplayName: req.body.addOnDisplayName.toLowerCase(),
        addOnMaxValue: req.body.addOnMaxValue,
        addOnMinValue: req.body.addOnMinValue,
        addOns: req.body.addOns,
    };
    const checkAvailable = await Restaurant.findOne(
        {
            _id: req.user.restaurantKey,
        },
        {
            addOns: {
                $elemMatch: {
                    addOnGroupName: data.addOnGroupName,
                },
            },
        }
    );

    if (checkAvailable && checkAvailable.addOns.length) {
        return next(new AppError("Record already exists!", 400));
    }
    const result = await Restaurant.updateOne(
        { _id: req.user.restaurantKey },
        { $push: { addOns: data } },

        { multi: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.addDishChoices = catchAsync(async (req, res, next) => {
    const data = {
        choicesGroupName: req.body.choicesGroupName.toLowerCase(),
        choicesDisplayName: req.body.choicesDisplayName.toLowerCase(),
        choicesMinValue: req.body.choicesMinValue,
        choicesMaxValue: req.body.choicesMaxValue,
        choicesGroup: req.body.choicesGroup,
    };
    const checkAvailable = await Restaurant.findOne(
        {
            _id: req.user.restaurantKey,
        },
        {
            dishChoices: {
                $elemMatch: {
                    choicesGroupName: data.choicesGroupName,
                },
            },
        }
    );

    if (checkAvailable && checkAvailable.dishChoices.length) {
        return next(new AppError("Record already exists!", 400));
    }
    const result = await Restaurant.updateOne(
        { _id: req.user.restaurantKey },
        { $push: { dishChoices: data } },

        { multi: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.editAddons = catchAsync(async (req, res, next) => {
    const data = {
        addOnGroupName: req.body.addOnGroupName.toLowerCase(),
        addOnMaxValue: req.body.addOnMaxValue,
        addOnMinValue: req.body.addOnMinValue,
        addOns: req.body.addOns,
    };

    const checkAvailable = await Restaurant.findOne(
        {
            _id: req.user.restaurantKey,
        },
        {
            addOns: {
                $elemMatch: {
                    addOnGroupName: data.addOnGroupName,
                },
            },
        }
    );

    if (checkAvailable && checkAvailable.addOns.length) {
        return next(new AppError("Record already exists!", 400));
    }

    const result = await Restaurant.updateOne(
        { _id: req.user.restaurantKey, "addOns._id": req.body._id },

        {
            $set: {
                "addOns.$.addOnGroupName": data.addOnGroupName,
                "addOns.$.addOnMaxValue": data.addOnMaxValue,
                "addOns.$.addOnMinValue": data.addOnMinValue,
                "addOns.$.addOns": data.addOns,
            },
        },
        { multi: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.deleteAddons = catchAsync(async (req, res, next) => {
    if (!req.params.id) {
        return next(new AppError("Unable to find AddOn!", 400));
    }

    data = {
        id: req.params.id,
    };

    const id = req.params.id;
    const result = await Restaurant.updateOne(
        { _id: req.user.restaurantKey },
        { $pull: { addOns: { _id: id } } }
    );

    check_if_a_dish_is_using_this_addon = await Restaurant.find({
        _id: req.user.restaurantKey,
        cuisine: {
            $elemMatch: {
                items: {
                    $elemMatch: {
                        addOns: {
                            $elemMatch: {
                                $elemMatch: {
                                    id: data.id,
                                },
                            },
                        },
                    },
                },
            },
        },
    }).select("_id");

    if (check_if_a_dish_is_using_this_addon.length) {
        return next(
            new AppError(
                "This addon is being used by some dish. Please remove it from the dish first.",
                400
            )
        );
    }

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.deleteChoices = catchAsync(async (req, res, next) => {
    if (!req.params.id) {
        return next(new AppError("Unable to find AddOn!", 400));
    }

    data = {
        // name: req.body.name,
        id: req.params.id,
    };

    const id = req.params.id;
    const result = await Restaurant.updateOne(
        { _id: req.user.restaurantKey },
        { $pull: { dishChoices: { _id: id } } }
    );

    check_if_a_dish_is_using_this_choices = await Restaurant.find({
        _id: req.user.restaurantKey,
        cuisine: {
            $elemMatch: {
                items: {
                    $elemMatch: {
                        choicesAvailable: {
                            $elemMatch: {
                                $elemMatch: {
                                    _id: data.id,
                                },
                            },
                        },
                    },
                },
            },
        },
    }).select("_id");

    if (check_if_a_dish_is_using_this_choices.length) {
        return next(
            new AppError(
                "This choices is being used by some dish. Please remove it from the dish first.",
                400
            )
        );
    }

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});
exports.editDishChoices = catchAsync(async (req, res, next) => {
    const data = {
        choicesGroupName: req.body.choicesGroupName.toLowerCase(),
        choicesDisplayName: req.body.choicesDisplayName.toLowerCase(),
        choicesMinValue: req.body.choicesMinValue,
        choicesMaxValue: req.body.choicesMaxValue,
        choicesGroup: req.body.choicesGroup,
    };
    const checkAvailable = await Restaurant.findOne(
        {
            _id: req.user.restaurantKey,
        },
        {
            dishChoices: {
                $elemMatch: {
                    choicesGroupName: data.choicesGroupName,
                },
            },
        }
    );

    if (checkAvailable && checkAvailable.dishChoices.length) {
        return next(new AppError("Record already exists!", 400));
    }
    const result = await Restaurant.findOneAndUpdate(
        { _id: req.user.restaurantKey, "dishChoices._id": req.body._id },

        {
            $set: {
                "dishChoices.$.choicesGroupName": data.choicesGroupName,
                "dishChoices.$.choicesDisplayName": data.choicesDisplayName,
                "dishChoices.$.choicesMinValue": data.choicesMinValue,
                "dishChoices.$.choicesMaxValue": data.choicesMaxValue,
                "dishChoices.$.choicesGroup": data.choicesGroup,
            },
        },
        { multi: true }
    );
    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});
