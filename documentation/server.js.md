# Documentation for Express.js Server

This document describes the implementation and functionalities of the Express.js server file. The server connects to a MongoDB database, uses Socket.IO for real-time communication, and contains multiple API routes for different functionalities. 

## Table of Contents

- [Introduction](#introduction)
- [Environment Variables](#environment-variables)
- [Dependencies](#dependencies)
- [Database Connection](#database-connection)
- [Middleware](#middleware)
- [Routes](#routes)
- [Error Handling](#error-handling)
- [Cron Jobs](#cron-jobs)
- [Server Initialization](#server-initialization)

## Introduction

This file sets up an Express.js server, connects to a MongoDB database, and serves multiple endpoints for managing restaurants, orders, users, and payments.

## Environment Variables

The server uses `dotenv` to manage environment variables. Ensure that you have a `.env` file with the necessary variables, including:

- `NODE_ENV`: Environment type (`production` or `development`)
- `PORT`: Port number (default is `3000` if not specified)
- `DB_CONNECTION_STRING`: Connection string for the production database
- `DB_Test_CONNECTION_STRING`: Connection string for the development database

## Dependencies

The following packages are required for the server to function properly:

- `express`: For building the server and handling routing.
- `cors`: To enable Cross-Origin Resource Sharing.
- `body-parser`: For parsing incoming request bodies.
- `mongoose`: For MongoDB object modeling.
- `dotenv`: To load environment variables from `.env` file.
- `http`: To create an HTTP server.
- `socket.io`: For real-time web socket communication.
- `node-cron`: To schedule cron jobs.
- `axios`: For making HTTP requests.
  
To install the dependencies, run:

```bash
npm install express cors body-parser mongoose dotenv http socket.io node-cron axios
```

## Database Connection

The server connects to a MongoDB database using the Mongoose library. The connection string is determined based on the environment specified:

```javascript
const dbConStr =
  process.env.NODE_ENV === "production"
    ? process.env.DB_CONNECTION_STRING
    : process.env.DB_Test_CONNECTION_STRING;

mongoose
  .connect(dbConStr, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: true,
  })
  .then(() => console.log("Connected to the database"));
```

## Middleware

The following middleware is used in the application:

- `express.json()`: Parses incoming JSON requests.
- `cors()`: Enables CORS for all routes.
- `bodyParser.json()`: Parses incoming requests with JSON payloads.
- `bodyParser.urlencoded()`: Parses URL-encoded bodies.
- A custom middleware to attach the Socket.IO instance to the request object.

## Routes

The server exposes multiple routes, each handling different functionalities:

- **Restaurant Routes**: `/api/v1/restaurant`
- **Admin Routes**: `/api/v1/admin`
- **Dishes Routes**: `/api/v1/restaurant/dishes`
- **User Routes**: `/api/v1/user`
- **Customer Routes**: `/api/v1/customer`
- **Payment Routes**: `/api/v1/payment`
- **Order Routes**: `/api/v1/orders`
- **Google Maps Routes**: `/api/v1/google-maps`

## Error Handling

A global error handler is provided to manage errors throughout the application. This is done by using a middleware function at the end of the middleware stack:

```javascript
app.use(globalHandler);
```

## Cron Jobs

The server utilizes cron jobs to perform scheduled tasks.

1. **Job to update order statuses**: Every ten minutes, the server checks for pending orders older than ten minutes and updates their status to "rejected". It also cleans up temporary orders older than eight hours.

   ```javascript
   cron.schedule("*/10 * * * *", async function () {
     // Job execution logic
   });
   ```

2. **Backup job**: A job scheduled to run daily at midnight can be used to back up the database. The `mongodump` command is commented out in the provided code.

   ```javascript
   cron.schedule("0 0 * * *", () => {
     // Backup logic here
   });
   ```

## Server Initialization

The server listens on the specified port and logs the status to the console.

```javascript
server.listen(port, async () => {
  console.log(`App running on port ${port}...`);
});
```

Once all configurations, middleware, routes, and error handlers have been set up and initialized, the server is ready to receive and respond to requests. 

## Conclusion

This documentation serves as a comprehensive overview of the Express.js server setup, including configurations, routes, middleware, and scheduled tasks. For further modifications or deployment instructions, please refer to additional documentation as necessary.