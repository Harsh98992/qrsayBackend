// const express = require("express");
// const cors = require("cors");
// const app = express();
// const restaurantRoute = require("./routers/restaurantRoute");
// const dishesRoute = require("./routers/dishesRoute");
// const userRoute = require("./routers/userRoute");
// const customerRoute = require("./routers/customerRoute");
// const paymentRoute = require("./routers/paymentRoute");
// const adminRoute = require("./routers/adminRoute");
// const orderRoute = require("./routers/orderRoute");
// const googlemapRoute = require("./routers/googlemapRoute");

// const AppError = require("./helpers/appError");

// const globalHandler = require("./controllers/errorController");
// const { trim_all } = require("request_trimmer");
// var bodyParser = require("body-parser");


// app.use(express.json({ limit: "50mb" }));
// app.use(trim_all);
// app.use(cors());
// app.use(bodyParser.json());

// app.use("/api/v1/restaurant", restaurantRoute);
// app.use("/api/v1/admin", adminRoute);
// app.use("/api/v1/restaurant/dishes", dishesRoute);
// app.use("/api/v1/user", userRoute);
// app.use("/api/v1/customer", customerRoute);
// app.use("/api/v1/payment", paymentRoute);
// app.use("/api/v1/orders", orderRoute);
// app.use("/api/v1/google-maps", googlemapRoute); // Add the googlemapRoute to your app
// app.all("*", (req, res, next) => {
//     console.log(req.originalUrl);

//     next(new AppError("No route found", 404));
// });


// app.use(globalHandler);

// module.exports = app;
