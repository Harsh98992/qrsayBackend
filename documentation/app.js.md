# API Documentation

This document provides an overview of the Express.js application setup, including the routes and middleware used in the application.

## Overview

This application is built using Express.js and includes various routes for handling different aspects of a restaurant management system. The application is designed to handle requests related to restaurants, dishes, users, customers, payments, orders, and Google Maps integration.

## Dependencies

The following dependencies are used in this application:

- `express`: A web framework for Node.js.
- `cors`: A middleware for enabling Cross-Origin Resource Sharing.
- `body-parser`: A middleware for parsing incoming request bodies.
- `request_trimmer`: A custom middleware for trimming request data.
- `./helpers/appError`: A custom error handling class.
- `./controllers/errorController`: A global error handling controller.

## Middleware

The following middleware is used in the application:

1. **JSON Body Parser**: Configured to accept JSON requests with a limit of 50MB.
   ```javascript
   app.use(express.json({ limit: "50mb" }));
   ```

2. **Request Trimmer**: A custom middleware to trim all incoming request data.
   ```javascript
   app.use(trim_all);
   ```

3. **CORS**: Enables Cross-Origin Resource Sharing.
   ```javascript
   app.use(cors());
   ```

4. **Body Parser**: Parses incoming request bodies in a middleware before your handlers.
   ```javascript
   app.use(bodyParser.json());
   ```

## Routes

The application defines the following routes:

- **Restaurant Routes**
  - Base URL: `/api/v1/restaurant`
  - Handled by: `restaurantRoute`

- **Admin Routes**
  - Base URL: `/api/v1/admin`
  - Handled by: `adminRoute`

- **Dishes Routes**
  - Base URL: `/api/v1/restaurant/dishes`
  - Handled by: `dishesRoute`

- **User Routes**
  - Base URL: `/api/v1/user`
  - Handled by: `userRoute`

- **Customer Routes**
  - Base URL: `/api/v1/customer`
  - Handled by: `customerRoute`

- **Payment Routes**
  - Base URL: `/api/v1/payment`
  - Handled by: `paymentRoute`

- **Order Routes**
  - Base URL: `/api/v1/orders`
  - Handled by: `orderRoute`

- **Google Maps Routes**
  - Base URL: `/api/v1/google-maps`
  - Handled by: `googlemapRoute`

## Error Handling

The application includes a global error handler that catches all unhandled routes and errors. If a request is made to a route that does not exist, a 404 error is returned.

```javascript
app.all("*", (req, res, next) => {
    console.log(req.originalUrl);
    next(new AppError("No route found", 404));
});
```

The global error handler is defined in `./controllers/errorController`.

## Export

The Express application is exported for use in other modules.

```javascript
module.exports = app;
```

## Conclusion

This documentation provides a high-level overview of the Express.js application, its middleware, routes, and error handling mechanisms. For further details on specific routes and their functionalities, please refer to the respective route handler files.