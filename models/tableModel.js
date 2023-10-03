const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant", // Reference to the Restaurant model
        required: true,
    },
    tables: [
        {
            tableName: {
                type: String,
            },
            isAvailable: {
                type: Boolean,
                default: true,
            },
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
            },
            customerId: {
                type: mongoose.Schema.Types.ObjectId,
            },

            capacity: {
                type: Number,
            },
            tableType: {
                type: String,
            },
        },
    ],
});

const Table = mongoose.model("Table", tableSchema);

module.exports = Table;
