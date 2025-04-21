const socketIo = require("socket.io");
const Order = require("./models/OrderModel");
let io = null;
function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: [
                "https://qrsay-testing.web.app",
                "https://qrsay.web.app",
                "http://localhost:4200/",
                "*"
            ],
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        },
        rejectUnauthorized: false,
    });

    io.on("connection", (socket) => {
        // Listen for events and join the corresponding restaurant room
        socket.on("joinRestaurantRoom", (restaurantId) => {
            socket.join(restaurantId);
            console.log("Restaurant room joined by " + restaurantId);

            // Emit a confirmation event back to the client
            socket.emit("joined_restaurant_room", {
                restaurantId,
                timestamp: new Date(),
            });
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

        // Waiter call events
        socket.on("waiter_call_acknowledged", (data) => {
            const restaurantId = data["restaurantId"];
            console.log(
                `Waiter call acknowledged for restaurant ${restaurantId}:`,
                data
            );
            io.emit("waiter_call_status_updated", data);
        });

        socket.on("waiter_call_resolved", (data) => {
            const restaurantId = data["restaurantId"];
            console.log(
                `Waiter call resolved for restaurant ${restaurantId}:`,
                data
            );
            io.emit("waiter_call_status_updated", data);
        });

        socket.on("waiter_call_created", (data) => {
            const restaurantId = data["restaurantId"];
            console.log(
                `New waiter call created for restaurant ${restaurantId}:`,
                data
            );
            io.emit("new_waiter_call", data);
            console.log(`Emitted new_waiter_call event to all clients`);
        });

        // Debug event to check socket connection
        socket.on("ping_socket", (data) => {
            console.log(`Received ping from client:`, data);
            socket.emit("pong_socket", {
                message: "Server received ping",
                timestamp: new Date(),
            });
        });
    });
}

module.exports = {
    initializeSocket,
    get io() {
        if (!io) {
        }
        return io;
    },
};
