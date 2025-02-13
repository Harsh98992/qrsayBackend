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
const compression = require("compression");
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
dotenv.config({ path: "./config.env" });
const axios = require("axios");
const app = express();

// Security Headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  max: 100, // 100 requests
  windowMs: 15 * 60 * 1000, // per 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes'
});
app.use('/api/', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Enable response caching
app.use((req, res, next) => {
  // Cache successful responses for 1 hour
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=3600');
  } else {
    // For other methods, prevent caching
    res.set('Cache-Control', 'no-store');
  }
  next();
});

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
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 10,  // Updated from poolSize to maxPoolSize
    keepAlive: true,
    keepAliveInitialDelay: 300000
  })
  .then(() => console.log("Connected to the database"));

// // Enable MongoDB query explain logging in development
// if (process.env.NODE_ENV !== 'production') {
//   mongoose.set('debug', true);
// }

const server = http.createServer(app);

// Initialize Socket.IO and pass the server object to the function
const io = initializeSocket.initializeSocket(server);
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced compression settings
app.use(compression({
  level: 6,
  threshold: 100, // Only compress responses above 100 bytes
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Don't compress images, they're already compressed
    if (req.path.match(/\.(jpg|png|gif|jpeg|webp)$/i)) {
      return false;
    }
    return compression.filter(req, res);
  },
  // Add Brotli compression when possible
  brotli: { enabled: true, zlib: {} }
}));

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

app.get("/test", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Hello from server",
  });
});
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

    const apiEndpoints = [
      "https://qrsaybackend.onrender.com/test",
      "https://qrsay-backend-testing.onrender.com/test"

    ];
    await Promise.all(apiEndpoints.map(endpoint => axios.get(endpoint)));
  } catch (error) {
    console.log(error, "err");
  }
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
