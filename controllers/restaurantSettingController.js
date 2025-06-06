const AppError = require("../helpers/appError");

const catchAsync = require("../helpers/catchAsync");
const Restaurant = require("../models/restaurantModel");
const User = require("../models/userModel");
const axios = require("axios");

const Table = require("../models/tableModel");
const { checkDineInTableAvailability } = require("../helpers/dineInHelper");
const Room = require("../models/RoomModel");
const {
    default: roundToNearestMinutes,
} = require("date-fns/fp/roundToNearestMinutes");
const { generateBillHelper } = require("../helpers/printer");
exports.updateRestaurantPlaceId = catchAsync(async (req, res, next) => {
    if (!req.body.placeId) {
        return next(new AppError("Please provide place id!", 400));
    }

    if (req.body.placeId === "") {
        console.log("Place ID does not exist.");
        return next(new AppError("Place ID does not exist!", 400));
    } else {
        const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
        const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${req.body.placeId}&key=${API_KEY}`;

        axios
            .get(apiUrl)

            .then((response) => {
                if (response.data.status === "OK") {
                    console.log("Place exists!");
                    console.log("Place details:", response.data.result);

                    Restaurant.findOneAndUpdate(
                        { _id: req.user.restaurantKey },
                        {
                            placeId: req.body.placeId,
                        }
                    ).then((result) => {
                        res.status(200).json({
                            status: "success",
                            data: {
                                message: "Record Updated Successfully!",
                            },
                        });
                    });
                } else if (response.data.status === "ZERO_RESULTS") {
                    console.log("Place ID does not exist.");
                    return next(new AppError("Place ID does not exist!", 400));
                } else if (response.data.status === "INVALID_REQUEST") {
                    console.log(response.data.error_message);
                    return next(
                        new AppError("Please provide a valid place id!", 400)
                    );
                } else {
                    console.log("Error:", response.data.status);
                    return next(new AppError("Error occurred!", 400));
                }
            })
            .catch((error) => {
                console.error(
                    "Error occurred while making the API request:",
                    error
                );
                return next(new AppError("Error occurred!", 400));
            });
    }
});

exports.updateRestaurantImage = catchAsync(async (req, res, next) => {
    if (!req.body.image) {
        return next(new AppError("Please upload a image!", 400));
    }
    await Restaurant.updateOne(
        { _id: req.user.restaurantKey },
        { $push: { restaurantImages: req.body.image } }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});
exports.updateRestaurantCashOnDelivery = catchAsync(async (req, res, next) => {
    await Restaurant.findOneAndUpdate(
        { _id: req.user.restaurantKey },
        { provideCashOnDelivery: req.body.cashOnDelivery ?? false }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.updateRestaurantDineInGstSetting = catchAsync(
    async (req, res, next) => {
        // if (req?.isDineInGstApplicable===null || req?.isDineInGstApplicable===undefined) {
        //   return next(new AppError("Please provide valid data!", 400));
        // }
        await Restaurant.findOneAndUpdate(
            { _id: req.user.restaurantKey },
            {
                isDineInPricingInclusiveOfGST:
                    req.body.isDineInPricingInclusiveOfGST ?? false,
                isDineInGstApplicable: req.body.isDineInGstApplicable ?? false,
                customDineInGSTPercentage:
                    req.body.customDineInGSTPercentage ?? 0,
            }
        );

        res.status(200).json({
            status: "success",
            data: {
                message: "Record Updated Successfully!",
            },
        });
    }
);
exports.updateRestaurantByPassAuth = catchAsync(async (req, res, next) => {
    await Restaurant.findOneAndUpdate(
        { _id: req.user.restaurantKey },
        { byPassAuth: req.body.byPassAuth ?? false }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});
exports.updateDineInAvailablity = catchAsync(async (req, res, next) => {
    await Restaurant.findOneAndUpdate(
        { _id: req.user.restaurantKey },
        {
            isDineInAvailableRestaurant:
                req.body.isDineInAvailableRestaurant ?? false,
        }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});
exports.updateRestaurantAutoReject = catchAsync(async (req, res, next) => {
    await Restaurant.findOneAndUpdate(
        { _id: req.user.restaurantKey },
        { autoRejectFlag: req.body.autoRejectFlag ?? true }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.deleteRestaurantImage = catchAsync(async (req, res, next) => {
    if (!req.body.image) {
        return next(new AppError("Please upload a image!", 400));
    }
    await Restaurant.updateOne(
        { _id: req.user.restaurantKey },
        { $pull: { restaurantImages: req.body.image } }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.getAllTables = catchAsync(async (req, res, next) => {
    const restaurantId = req.user.restaurantKey;

    if (!restaurantId) {
        return next(new AppError("Please provide restaurant id!", 400));
    }

    const tables = await Table.findOne({ restaurantId: restaurantId });

    // if (!tables) {
    //     return next(new AppError("No tables found!", 404));
    // }

    res.status(200).json({
        status: "success",
        data: {
            tables,
        },
    });
});
exports.getAllRooms = catchAsync(async (req, res, next) => {
    const restaurantId = req.user.restaurantKey;

    if (!restaurantId) {
        return next(new AppError("Please provide restaurant id!", 400));
    }

    const rooms = await Room.findOne({ restaurantId: restaurantId });
    console.log(rooms);
    // if (!tables) {
    //     return next(new AppError("No tables found!", 404));
    // }

    res.status(200).json({
        status: "success",
        data: {
            rooms,
        },
    });
});
exports.createTableEntry = catchAsync(async (req, res, next) => {
    const restaurantId = req.user.restaurantKey;

    if (!restaurantId) {
        return next(new AppError("Please provide restaurant id!", 400));
    }

    checkifTableExists = await Table.findOne({
        restaurantId: restaurantId,
        tables: { $elemMatch: { tableName: req.body.tableName } },
    });

    if (checkifTableExists) {
        return next(new AppError("Table already exists!", 400));
    }

    const result = await Table.findOne({
        restaurantId: restaurantId,
    });
    console.log(result);
    if (!result) {
        await Table.create({
            restaurantId: restaurantId,
            tables: req.body,
        });
    } else {
        await Table.updateOne(
            {
                restaurantId: restaurantId,
            },
            { $push: { tables: req.body } }
        );
    }

    res.status(201).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});
exports.createRoomEntry = catchAsync(async (req, res, next) => {
    const restaurantId = req.user.restaurantKey;

    if (!restaurantId) {
        return next(new AppError("Please provide restaurant id!", 400));
    }

    const checkifRoomExists = await Room.findOne({
        restaurantId: restaurantId,
        room: { $elemMatch: { roomName: req.body.roomName?.toLowerCase() } },
    });

    if (checkifRoomExists) {
        return next(new AppError("Room already exists!", 400));
    }

    const result = await Room.findOne({
        restaurantId: restaurantId,
    });

    if (!result) {
        await Room.create({
            restaurantId: restaurantId,
            room: req.body,
        });
    } else {
        console.log(req.body);
        const res = await Room.updateOne(
            {
                restaurantId: restaurantId,
            },
            { $push: { room: req.body } }
        );
        console.log(res);
    }

    res.status(201).json({
        status: "success",
        data: {
            message: "Record Updated Successfully!",
        },
    });
});

exports.editTableById = catchAsync(async (req, res, next) => {
    const tableId = req.body.tableId;
    const restaurantId = req.user.restaurantKey;
    if (!req.body.tableName) {
        return next(new AppError("Please provide table number!", 400));
    }

    const result = await Table.updateOne(
        { restaurantId: restaurantId, "tables._id": tableId },

        {
            $set: {
                "tables.$.tableName": req.body.tableName,
                "tables.$.capacity": req.body.capacity,
                "tables.$.isAvailable": req.body.isAvailable,
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
exports.editRoomById = catchAsync(async (req, res, next) => {
    const roomId = req.body.roomId;
    const restaurantId = req.user.restaurantKey;
    if (!req.body.roomName) {
        return next(new AppError("Please provide room number!", 400));
    }

    const result = await Room.updateOne(
        { restaurantId: restaurantId, "room._id": roomId },

        {
            $set: {
                "room.$.roomName": req.body.roomName,
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

exports.deleteTableById = catchAsync(async (req, res, next) => {
    const tableId = req.params.tableId;
    if (!tableId) {
        return next(new AppError("Table name is missing.", 400));
    }
    const result = await Table.findOneAndUpdate(
        { restaurantId: req.user.restaurantKey },
        { $pull: { tables: { _id: tableId } } }
    );
    if (!result) {
        return next(new AppError("Something went wrong!", 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            message: "Record deleted successfully.",
        },
    });
});
exports.deleteRoomById = catchAsync(async (req, res, next) => {
    const roomId = req.params.roomId;
    if (!roomId) {
        return next(new AppError("Room name is missing.", 400));
    }
    const result = await Room.findOneAndUpdate(
        { restaurantId: req.user.restaurantKey },
        { $pull: { room: { _id: roomId } } }
    );
    if (!result) {
        return next(new AppError("Something went wrong!", 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            message: "Record deleted successfully.",
        },
    });
});
exports.checkDineInAvailable = catchAsync(async (req, res, next) => {
    const checkDineInResult = await checkDineInTableAvailability(
        req.body.tableName,
        req.body.restaurantId,
        req.user._id
    );
    if (!checkDineInResult.result) {
        return next(new AppError(checkDineInResult.message, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            message: "The selection of the table was successful.",
        },
    });
});
exports.checkAciveDineIn = catchAsync(async (req, res, next) => {
    const restaurantId = req.params.restaurantId;

    // Get all tables for the restaurant
    const tables = await Table.findOne({ restaurantId: restaurantId });

    // Check if user is logged in to determine active dine-in status
    if (req.user) {
        const userId = req.user._id;
        const queryResult = await Table.findOne(
            { restaurantId: restaurantId, "tables.customerId": userId },
            { "tables.$": 1 }
        );

        if (!queryResult || queryResult.tables[0].isAvailable) {
            return res.status(200).json({
                status: "success",
                data: {
                    active: false,
                    tables: tables,
                },
            });
        } else {
            return res.status(200).json({
                status: "success",
                data: {
                    active: true,
                    tableName: queryResult.tables[0].tableName,
                    tables: tables,
                },
            });
        }
    }

    // If no user is logged in, just return the tables
    return res.status(200).json({
        status: "success",
        data: {
            active: false,
            tables: tables,
        },
    });
});
exports.generateBill = catchAsync(async (req, res, next) => {
    const orderDetail = req.body?.orderDetail;
    const restaurantDetail = req.body?.restaurantDetail;
    const kotFlag = req.body?.kotFlag ? true : false;

    if (orderDetail && restaurantDetail) {
        const result = await generateBillHelper(
            orderDetail,
            restaurantDetail,
            kotFlag
        );
        if (result === false) {
            res.status(200).json({
                status: "success",
                data: {
                    state: "fail",
                },
            });
            return;
        }
    }
    res.status(200).json({
        status: "success",
        data: {
            state: "pass",
        },
    });
});
