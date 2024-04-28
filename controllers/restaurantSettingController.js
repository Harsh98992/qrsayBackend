const AppError = require("../helpers/appError");

const catchAsync = require("../helpers/catchAsync");
const Restaurant = require("../models/restaurantModel");
const User = require("../models/userModel");
const axios = require("axios");

const Table = require("../models/tableModel");
const { checkDineInTableAvailability } = require("../helpers/dineInHelper");
const Room = require("../models/RoomModel");
const { default: roundToNearestMinutes } = require("date-fns/fp/roundToNearestMinutes");

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

    checkifTableExists = await Room.findOne({
        restaurantId: restaurantId,
        tables: { $elemMatch: { tableName: req.body.tableName } },
    });

    if (checkifTableExists) {
        return next(new AppError("Table already exists!", 400));
    }

    const result = await Room.findOne({
        restaurantId: restaurantId,
    });

    if (!result) {
        await Room.create({
            restaurantId: restaurantId,
            tables: req.body,
        });
    } else {
        await Room.updateOne(
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
        console.log(req.body)
        const res=await Room.updateOne(
            {
                restaurantId: restaurantId,
            },
            { $push: { room: req.body } }
        );
        console.log(res)
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
    if (req.user) {
        const userId = req.user._id;
        const restaurantId = req.params.restaurantId;
        const queryResult = await Table.findOne(
            { restaurantId: restaurantId, "tables.customerId": userId },
            { "tables.$": 1 }
        );

        if (!queryResult || queryResult.tables[0].isAvailable) {
            res.status(200).json({
                status: "success",
                data: {
                    active: false,
                },
            });
        } else {
            res.status(200).json({
                status: "success",
                data: {
                    active: true,
                    tableName: queryResult.tables[0].tableName,
                },
            });
        }
    }
    res.status(200).json({
        status: "success",
    });
});
