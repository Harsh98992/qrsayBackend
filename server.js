const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const initializeSocket = require("./socket"); // Import the Socket.IO initialization function
const cron = require("node-cron");

const AppError = require("./helpers/appError");
const Order = require("./models/OrderModel");
const adminRoute = require("./routers/adminRoute");
const customerRoute = require("./routers/customerRoute");
const dishesRoute = require("./routers/dishesRoute");
const googlemapRoute = require("./routers/googlemapRoute");
const orderRoute = require("./routers/orderRoute");
const paymentRoute = require("./routers/paymentRoute");
const restaurantRoute = require("./routers/restaurantRoute");
const userRoute = require("./routers/userRoute");
const globalHandler = require("./controllers/errorController");
const orderSchema = require("./models/OrderModel");
dotenv.config({ path: "./config.env" });
const axios = require('axios');
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(bodyParser.json());

app.use("/api/v1/restaurant", restaurantRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/restaurant/dishes", dishesRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/customer", customerRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/google-maps", googlemapRoute);

app.all("*", (req, res, next) => {
    console.log(req.originalUrl);
    next(new AppError("No route found", 404));
});

app.use(globalHandler);

const port = process.env.PORT || 3000;

mongoose
    .connect(process.env.DB_CONNECTION_STRING, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        autoIndex: true,
    })
    .then(() => console.log("Connected to the database"));

const server = http.createServer(app);

// Initialize Socket.IO and pass the server object to the function
const io = initializeSocket(server);
cron.schedule("*/10 * * * *", async function () {
    console.log("job executed");
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
    try {
        // Replace 'http://your-server-endpoint' with the actual endpoint of your server
        const response = await axios.get('https://qrsay-backend.onrender.com/api/v1/customer/getAllRestaurants');
        console.log('Server hit successful:', response.data);
    } catch (error) {
        console.error('Error hitting server:', error.message);
    }
    const res = await orderSchema.updateMany(
        { orderDate: { $lte: tenMinutesAgo }, orderStatus: "pending" },
        {
            orderStatus: "rejected",
            reason: "The restaurant cannot fulfill the order at this time.",
        }
    );
});

server.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
