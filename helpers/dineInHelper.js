const Order = require("../models/OrderModel");
const Table = require("../models/tableModel");

exports.checkDineInTableAvailability = async (
    tableName,
    restaurantId,
    userId
) => {
    if (!tableName) {
        return { result: false, message: "Please provide table name!" };
    }
    const queryResult = await Table.findOne(
        { restaurantId: restaurantId, "tables.tableName": tableName },
        { "tables.$": 1 }
    );

    if (!queryResult || queryResult.tables.length === 0) {
        return { result: false, message: "The table name was not found!" };
    }
    const tableData = queryResult.tables[0];

    if (!tableData?.isAvailable) {
        if (
            tableData.customerId &&
            tableData.customerId.valueOf() !== userId.valueOf()
        ) {
            return {
                result: false,
                message:
                    "The table has been reserved.Please choose any other table or please get in touch with the owner of the restaurant.!",
            };
        }
    }
    return {
        result: true,
        message: "Table Selected Successfully!",
    };
};
