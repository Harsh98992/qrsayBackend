const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const initializeSocket = require("./socket"); // Import the Socket.IO initialization function
const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");
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
const orderTempSchema = require("./models/OrderModelTemp");
dotenv.config({ path: "./config.env" });
const axios = require("axios");
const app = express();

const port = process.env.PORT || 3000;
const dbConStr =
  process.env.NODE_ENV === "production"
    ? process.env.DB_CONNECTION_STRING
    : process.env.DB_Test_CONNECTION_STRING;
console.log(dbConStr);
mongoose
  .connect(dbConStr, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: true,
  })
  .then(() => console.log("Connected to the database"));

const server = http.createServer(app);

// Initialize Socket.IO and pass the server object to the function
const io = initializeSocket.initializeSocket(server);
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.io = initializeSocket.io;
  next();
});
app.use("/api/v1/restaurant", restaurantRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/restaurant/dishes", dishesRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/customer", customerRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/google-maps", googlemapRoute);

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Hello from server",
  });
});

app.all("*", (req, res, next) => {
  console.log(req.originalUrl);
  next(new AppError("No route found", 404));
});

app.use(globalHandler);
cron.schedule("*/10 * * * *", async function () {
  console.log("job executed");
  const tenMinutesAgo = new Date();
  tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
  const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);

  try {
    // Replace 'http://your-server-endpoint' with the actual endpoint of your server
    const api1 =
      "https://qrsay-backend.onrender.com/api/v1/customer/getAllRestaurants";
    const api2 =
      "https://qrsaybackend-ksaw.onrender.com/api/v1/customer/getAllRestaurants";
    const api3 =
      "https://qrsaybackend-gurg.onrender.com/api/v1/customer/getAllRestaurants";
    const [response1, response2, response3] = await Promise.all([
      axios.get(api1),
      axios.get(api2),
      axios.get(api3),
    ]);
  } catch (error) {}
  const res = await orderSchema.updateMany(
    {
      orderDate: { $lte: tenMinutesAgo },
      orderStatus: "pending",
      autoRejectFlag: true,
    },
    {
      orderStatus: "rejected",
      reason: "The restaurant cannot fulfill the order at this time.",
    }
  );
  const del = await orderSchema.updateMany(
    {
      orderDate: { $lte: eightHoursAgo },
      orderStatus: { $in: ["pending", "processing", "pendingPayment"] },
      "customerPreferences.preference": { $ne: "Dine In" },
    },
    {
      orderStatus: "rejected",
      reason: "The restaurant cannot fulfill the order at this time.",
    }
  );
  const deleted = await orderTempSchema.deleteMany({
    orderDate: { $lte: eightHoursAgo },
  });
});
cron.schedule("0 0 * * *", () => {
  // const mongodumpCmd = `mongodump "${dbConStr}" --username goqrorder`;
  // exec(mongodumpCmd, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error executing mongodump: ${error.message}`);
  //     return;
  //   }
  //   if (stderr) {
  //     console.error(`mongodump stderr: ${stderr}`);
  //     return;
  //   }
  //   console.log(`Backup successful: ${backupFilePath}`);
  // });
});

// Mongodump command with connection string

server.listen(port, async () => {
  console.log(`App running on port ${port}...`);
});
