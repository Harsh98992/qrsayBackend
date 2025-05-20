const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const RoomCustomerLink = require("../models/RoomCustomerLinkModel");
const Room = require("../models/RoomModel");
const Restaurant = require("../models/restaurantModel");
const Customer = require("../models/CustomerModel");
const { sendCustomWhatsAppMessage } = require("../helpers/whatsapp");
const sendSMSMessage = require("../helpers/sms");

// Create a new room-customer link
exports.createRoomCustomerLink = catchAsync(async (req, res, next) => {
    const { roomId, roomName, customerPhoneNumber, customerName } = req.body;
    const restaurantId = req.user.restaurantKey;

    if (!roomId || !roomName || !customerPhoneNumber) {
        return next(
            new AppError(
                "Please provide room ID, room name, and customer phone number",
                400
            )
        );
    }

    // Validate phone number format (simple validation)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(customerPhoneNumber)) {
        return next(
            new AppError("Please provide a valid 10-digit phone number", 400)
        );
    }

    // Check if the room exists
    const roomExists = await Room.findOne({
        restaurantId: restaurantId,
        "room._id": roomId,
    });

    if (!roomExists) {
        return next(new AppError("Room not found", 404));
    }

    // Get restaurant details for the notification
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(new AppError("Restaurant not found", 404));
    }

    // Deactivate any existing active links for this room
    await RoomCustomerLink.updateMany(
        {
            restaurantId: restaurantId,
            roomId: roomId,
            isActive: true,
        },
        {
            isActive: false,
        }
    );

    // Create the new link
    const newLink = await RoomCustomerLink.create({
        restaurantId,
        roomId,
        roomName,
        customerPhoneNumber,
        customerName: customerName || "",
    });

    // Generate the ordering URL with phone number and room name
    const orderingUrl = `${req.protocol}://${req.get(
        "host"
    )}/restaurant?detail=${
        restaurant.restaurantUrl
    }&phoneNumber=${encodeURIComponent(
        customerPhoneNumber
    )}&roomName=${encodeURIComponent(roomName)}`;

    // Send WhatsApp notification
    try {
        const message = `Hello${
            customerName ? " " + customerName : ""
        }! Your room (${roomName}) has been linked to our ordering system. Use this link to place your order: ${orderingUrl}`;
        await sendCustomWhatsAppMessage(
            customerPhoneNumber,
            message,
            restaurant
        );

        // Update notification status
        await RoomCustomerLink.findByIdAndUpdate(newLink._id, {
            notificationSent: true,
        });
    } catch (error) {
        console.error("Failed to send WhatsApp notification:", error);
        // We continue even if notification fails
    }

    res.status(201).json({
        status: "success",
        data: {
            link: newLink,
            orderingUrl,
        },
    });
});

// Get all active room-customer links for a restaurant
exports.getActiveRoomCustomerLinks = catchAsync(async (req, res, next) => {
    const restaurantId = req.user.restaurantKey;

    const links = await RoomCustomerLink.find({
        restaurantId,
        isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
        status: "success",
        results: links.length,
        data: {
            links,
        },
    });
});

// Deactivate a room-customer link
exports.deactivateRoomCustomerLink = catchAsync(async (req, res, next) => {
    const { linkId } = req.params;
    const restaurantId = req.user.restaurantKey;

    const link = await RoomCustomerLink.findOneAndUpdate(
        {
            _id: linkId,
            restaurantId,
        },
        {
            isActive: false,
        },
        {
            new: true,
        }
    );

    if (!link) {
        return next(new AppError("Link not found or not authorized", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            link,
        },
    });
});

// Validate a room-customer link using phone number and room name
exports.validateRoomCustomerLink = catchAsync(async (req, res, next) => {
    const { phoneNumber, roomName } = req.query;

    console.log("[DEBUG] Received validation request with parameters:", {
        phoneNumber,
        roomName,
    });

    if (!phoneNumber || !roomName) {
        console.log("[DEBUG] Validation failed: Missing required parameters");
        return next(
            new AppError("Both phoneNumber and roomName are required", 400)
        );
    }

    // Trim the parameters to handle any whitespace issues
    const trimmedPhone = phoneNumber.trim();
    const trimmedRoom = roomName.trim();

    console.log(
        "[DEBUG] Looking for link with phone:",
        trimmedPhone,
        "and room:",
        trimmedRoom
    );

    // Find the link with phone number and room name
    const link = await RoomCustomerLink.findOne({
        customerPhoneNumber: trimmedPhone,
        roomName: trimmedRoom,
        isActive: true,
    });

    if (!link) {
        console.log(
            "[DEBUG] Phone+room validation failed: No active link found"
        );
        return next(
            new AppError(
                "No active link found for this phone number and room combination",
                400
            )
        );
    }

    console.log(
        "[DEBUG] Phone+room validation successful for room:",
        link.roomName
    );

    res.status(200).json({
        status: "success",
        data: {
            roomId: link.roomId,
            roomName: link.roomName,
            customerPhoneNumber: link.customerPhoneNumber,
        },
    });
});

// Resend notification for a room-customer link
exports.resendNotification = catchAsync(async (req, res, next) => {
    const { linkId } = req.params;
    const restaurantId = req.user.restaurantKey;

    const link = await RoomCustomerLink.findOne({
        _id: linkId,
        restaurantId,
        isActive: true,
    });

    if (!link) {
        return next(new AppError("Link not found or not active", 404));
    }

    // Get restaurant details for the notification
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(new AppError("Restaurant not found", 404));
    }

    // Generate the ordering URL with phone number and room name
    const orderingUrl = `${req.protocol}://${req.get(
        "host"
    )}/restaurant?detail=${
        restaurant.restaurantUrl
    }&phoneNumber=${encodeURIComponent(
        link.customerPhoneNumber
    )}&roomName=${encodeURIComponent(link.roomName)}`;

    // Send WhatsApp notification
    try {
        const message = `Hello${
            link.customerName ? " " + link.customerName : ""
        }! Your room (${
            link.roomName
        }) has been linked to our ordering system. Use this link to place your order: ${orderingUrl}`;
        await sendCustomWhatsAppMessage(
            link.customerPhoneNumber,
            message,
            restaurant
        );

        // Update notification status
        await RoomCustomerLink.findByIdAndUpdate(link._id, {
            notificationSent: true,
        });
    } catch (error) {
        console.error("Failed to send WhatsApp notification:", error);
        return next(new AppError("Failed to send notification", 500));
    }

    res.status(200).json({
        status: "success",
        message: "Notification sent successfully",
    });
});

// FOR DEBUGGING ONLY - Generate a test link for testing
// This endpoint should be removed or secured in production
exports.generateTestLink = catchAsync(async (req, res, next) => {
    // Only allow this in development environment
    if (process.env.NODE_ENV === "production") {
        return next(
            new AppError("This endpoint is not available in production", 403)
        );
    }

    const { roomId, roomName } = req.body;
    const restaurantId = req.user.restaurantKey;

    if (!roomId || !roomName) {
        return next(new AppError("Please provide room ID and room name", 400));
    }

    // Create the new link
    const newLink = await RoomCustomerLink.create({
        restaurantId,
        roomId,
        roomName,
        customerPhoneNumber: "1234567890", // Test phone number
        customerName: "Test Customer",
        notificationSent: true,
    });

    // Get restaurant details
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(new AppError("Restaurant not found", 404));
    }

    // Generate the ordering URL with phone number and room name
    const orderingUrl = `${req.protocol}://${req.get(
        "host"
    )}/restaurant?detail=${
        restaurant.restaurantUrl
    }&phoneNumber=${encodeURIComponent(
        "1234567890"
    )}&roomName=${encodeURIComponent(roomName)}`;

    console.log(
        "[DEBUG] Generated test link with phone:",
        "1234567890",
        "and room:",
        roomName
    );
    console.log("[DEBUG] Test ordering URL:", orderingUrl);

    res.status(201).json({
        status: "success",
        data: {
            link: newLink,
            orderingUrl,
            message: "This is a test link for debugging purposes only",
        },
    });
});
