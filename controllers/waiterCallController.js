const mongoose = require("mongoose");
const WaiterCall = require("../models/waiterCallModel");
const Table = require("../models/tableModel");
const AppError = require("../helpers/appError");
const catchAsync = require("../helpers/catchAsync");
const socketIO = require("../socket");

// Create a new waiter call
exports.callWaiter = catchAsync(async (req, res, next) => {
    try {
        const { restaurantId, name, tableId, message } = req.body;

        // Log the extracted parameters
        console.log("Extracted parameters:", {
            restaurantId,
            name,
            tableId,
            message,
        });

        // Validate MongoDB ObjectId format
        try {
            if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
                console.error("Invalid restaurantId format:", restaurantId);
                return next(new AppError("Invalid restaurant ID format", 400));
            }

            if (!mongoose.Types.ObjectId.isValid(tableId)) {
                console.error("Invalid tableId format:", tableId);
                return next(new AppError("Invalid table ID format", 400));
            }
        } catch (validationError) {
            console.error("Error validating ObjectIds:", validationError);
            return next(
                new AppError(
                    `Error validating IDs: ${validationError.message}`,
                    400
                )
            );
        }

        // Validate input
        if (!restaurantId) {
            return next(new AppError("Restaurant ID is required", 400));
        }

        // Check if name is missing but might be in a different property
        let customerName = name;
        if (!customerName && req.body.customerName) {
            customerName = req.body.customerName;
        }

        if (!customerName) {
            return next(new AppError("Customer name is required", 400));
        }

        if (!tableId) {
            return next(new AppError("Table ID is required", 400));
        }

        // Variable to store the table name
        let tableName;

        try {
            // Convert string IDs to ObjectIds for the query
            const restaurantObjId = new mongoose.Types.ObjectId(restaurantId);
            const tableObjId = new mongoose.Types.ObjectId(tableId);

            const tableData = await Table.findOne(
                {
                    restaurantId: restaurantObjId,
                    "tables._id": tableObjId,
                },
                {
                    "tables.$": 1,
                }
            );

            if (
                !tableData ||
                !tableData.tables ||
                tableData.tables.length === 0
            ) {
                console.error("Table not found with the provided IDs");
                return next(new AppError("Table not found", 404));
            }

            tableName = tableData.tables[0].tableName;
            console.log(`Found table with name: ${tableName}`);
        } catch (tableError) {
            console.error("Error finding table:", tableError);
            return next(
                new AppError(`Error finding table: ${tableError.message}`, 500)
            );
        }

        let waiterCall;
        try {
            // Create the waiter call document
            const waiterCallDoc = {
                restaurantId: restaurantId, // Mongoose will convert this to ObjectId
                tableId: tableId, // Mongoose will convert this to ObjectId
                customerName: customerName, // Use the customerName variable we defined above
                tableName,
                message: message || "",
            };

            waiterCall = await WaiterCall.create(waiterCallDoc);

            console.log(
                "Waiter call created successfully with ID:",
                waiterCall._id
            );
        } catch (createError) {
            console.error("Error creating waiter call:", createError);
            return next(
                new AppError(
                    `Failed to create waiter call: ${createError.message}`,
                    500
                )
            );
        }

        // Emit socket event to restaurant
        const io = socketIO.io;
        if (io) {
            const waiterCallData = {
                callId: waiterCall._id,
                restaurantId: waiterCall.restaurantId,
                tableId: waiterCall.tableId,
                tableName: waiterCall.tableName,
                customerName: waiterCall.customerName,
                message: waiterCall.message,
                createdAt: new Date(waiterCall.createdAt).toLocaleString(),
                status: waiterCall.status,
                rawDate: waiterCall.createdAt,
            };

            console.log(
                `Emitting new_waiter_call event to restaurant ${restaurantId}:`,
                waiterCallData
            );

            // Emit to all clients in the restaurant room
            io.emit("new_waiter_call", waiterCallData);

            // Also emit the waiter_call_created event
            io.emit("waiter_call_created", waiterCallData);

            // Log the event for debugging
            console.log(
                `Emitted waiter call events to all clients:`,
                waiterCallData
            );

            // Broadcast to all connected clients (for debugging)
            io.emit("new_waiter_call_broadcast", {
                ...waiterCallData,
                message: `New waiter call from ${waiterCallData.customerName} at table ${waiterCallData.tableName}`,
            });
        } else {
            console.error(
                "Socket.io instance not available for emitting waiter call events"
            );
        }

        res.status(201).json({
            success: true,
            message: "Waiter called successfully.",
            data: {
                waiterCall,
            },
        });
    } catch (error) {
        console.error("Error creating waiter call:", error);
        return next(
            new AppError("Failed to create waiter call: " + error.message, 500)
        );
    }
});

// Get all waiter calls for a restaurant
exports.getWaiterCalls = catchAsync(async (req, res, next) => {
    try {
        let restaurantId;

        console.log("Received request to get waiter calls");

        if (req.user && req.user.restaurantKey) {
            // If user object exists, use the restaurantKey from it
            restaurantId = req.user.restaurantKey;
            console.log(`Using restaurantId from user object: ${restaurantId}`);
        } else if (req.query.restaurantId) {
            restaurantId = req.query.restaurantId;
            console.log(
                `Using restaurantId from query params: ${restaurantId}`
            );
        } else {
            // For development/testing, use a default restaurant ID if none is provided
            // This should be replaced with a proper authentication check in production
            console.log(
                "No restaurantId available, please provide one in query params"
            );
            return next(
                new AppError(
                    "Restaurant ID is required. Please provide it in query parameters.",
                    400
                )
            );
        }

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            console.error("Invalid restaurantId format:", restaurantId);
            return next(new AppError("Invalid restaurant ID format", 400));
        }

        console.log(`Fetching waiter calls for restaurant: ${restaurantId}`);

        const waiterCalls = await WaiterCall.find({
            restaurantId,
            status: { $in: ["pending", "acknowledged"] },
        }).sort({ createdAt: -1 });

        console.log(`Found ${waiterCalls.length} waiter calls`);

        res.status(200).json({
            success: true,
            data: {
                waiterCalls,
            },
        });
    } catch (error) {
        console.error("Error fetching waiter calls:", error);
        return next(
            new AppError(`Failed to fetch waiter calls: ${error.message}`, 500)
        );
    }
});

// Update waiter call status
exports.updateWaiterCallStatus = catchAsync(async (req, res, next) => {
    try {
        console.log("Received request to update waiter call status");
        console.log("Request data:", req.body);
        let callId = req.body.callId;
        let status = req.body.status;
        let restaurantId = req.body.restaurantId;
        // For debugging, log the request body
        console.log("callId:", callId);
        console.log("status:", status);
        console.log("restaurantId:", restaurantId);

        if (!callId) {
            return next(new AppError("Call ID is required", 400));
        }

        if (
            !status ||
            !["pending", "acknowledged", "resolved"].includes(status)
        ) {
            return next(new AppError("Valid status is required", 400));
        }

        // Validate callId format
        if (!mongoose.Types.ObjectId.isValid(callId)) {
            console.error("Invalid callId format:", callId);
            return next(new AppError("Invalid call ID format", 400));
        }

        // Create query object - only use callId for the query
        const query = { _id: callId };

        // We'll log the restaurantId but not use it in the query to avoid issues
        if (restaurantId) {
            console.log(`Restaurant ID provided: ${restaurantId}`);
            // Don't validate or add to query to avoid potential issues
        } else {
            console.log(
                "No restaurantId provided, proceeding with callId only"
            );
        }

        console.log("Update query:", query);

        const waiterCall = await WaiterCall.findOneAndUpdate(
            query,
            { status },
            { new: true }
        );

        console.log("Updated waiter call:", waiterCall);

        if (!waiterCall) {
            return next(new AppError("Waiter call not found", 404));
        }

        // Emit socket event to restaurant
        const io = socketIO.io;
        if (io) {
            const statusData = {
                callId: waiterCall._id,
                restaurantId: waiterCall.restaurantId,
                status: waiterCall.status,
                tableName: waiterCall.tableName,
                customerName: waiterCall.customerName,
            };

            console.log(
                `Emitting waiter_call_status_updated event to restaurant ${waiterCall.restaurantId}:`,
                statusData
            );

            // Emit to all clients
            io.emit("waiter_call_status_updated", statusData);

            // Also emit specific event based on status
            if (status === "acknowledged") {
                console.log(
                    `Emitting waiter_call_acknowledged event to all clients`
                );
                io.emit("waiter_call_acknowledged", statusData);
            } else if (status === "resolved") {
                console.log(
                    `Emitting waiter_call_resolved event to all clients`
                );
                io.emit("waiter_call_resolved", statusData);
            }

            // Log the event for debugging
            console.log(
                `Emitted waiter call status update to all clients:`,
                statusData
            );

            // Broadcast to all connected clients (for debugging)
            io.emit("waiter_call_status_broadcast", {
                ...statusData,
                message: `Waiter call status updated to ${status} for ${waiterCall.customerName} at table ${waiterCall.tableName}`,
            });
        } else {
            console.error(
                "Socket.io instance not available for emitting waiter call status events"
            );
        }

        res.status(200).json({
            success: true,
            message: "Waiter call status updated successfully.",
            data: {
                waiterCall,
            },
        });
    } catch (error) {
        console.error("Error updating waiter call status:", error);
        return next(
            new AppError(
                `Failed to update waiter call status: ${error.message}`,
                500
            )
        );
    }
});
