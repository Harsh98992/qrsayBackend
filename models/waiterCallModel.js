const mongoose = require("mongoose");

const waiterCallSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table.tables",
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    tableName: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ["pending", "acknowledged", "resolved"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Add index for better performance
// waiterCallSchema.index({ restaurantId: 1, status: 1 });
// waiterCallSchema.index({ createdAt: 1 });

const WaiterCall = mongoose.model("WaiterCall", waiterCallSchema);

module.exports = WaiterCall;
