const socketIo = require("socket.io");
const Order = require("./models/OrderModel");
let io=null;
function initializeSocket(server) {
     io = socketIo(server, {
        cors: {
            origin: "*",
        },rejectUnauthorized: false
    });

    io.on("connection", (socket) => {
        // Listen for events and join the corresponding restaurant room
        socket.on("joinRestaurantRoom", (restaurantId) => {
            socket.join(restaurantId);

            // console.log("Restaurant room joined by " + restaurantId);
        });

        socket.on("joinCustomerRoom", (customerId) => {
            socket.join(customerId);

            // console.log("Customer room joined by " + customerId);
        });

        socket.on("orderAcceptedOrRejected", (orderData) => {
            const customerId = orderData["customerId"];

            socket.to(customerId).emit("orderAcceptedOrRejected", orderData);

            // console.log("Order accepted or rejected sent to " + customerId);
        });

        socket.on("orderPlaced", async (orderData) => {
            const restaurantId = orderData["restaurantId"];

            let completeOrderData;
            // check if _id is present in orderData
            if (orderData["_id"]) {
                completeOrderData = await Order.findById(orderData["_id"]);
            } else {
                let orderId = orderData["orderId"];

                completeOrderData = await Order.findOne({
                    orderId: orderId,
                });
            }

            if (completeOrderData) {
                // Send order data to the restaurant
                socket.to(restaurantId).emit("orderUpdate", completeOrderData);

                // console.log("Order update sent to " + restaurantId);
            } else {
                // console.log(  "Order with orderId " + orderId + " does not exist"        );
            }
        });
    });
}

module.exports = {initializeSocket, get io() {
    if (!io) {
      
    }
    return io;
  },};
