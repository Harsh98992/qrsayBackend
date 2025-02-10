# Socket.io Implementation for Order Management

This documentation provides an overview of the Socket.io implementation for handling order management in a restaurant application. The implementation allows for real-time communication between restaurants and customers via WebSocket connections.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Functions](#functions)
  - [initializeSocket(server)](#initializesocketserver)
- [Socket Events](#socket-events)
  - [joinRestaurantRoom](#joinrestaurantroom)
  - [joinCustomerRoom](#joincustomerroom)
  - [orderAcceptedOrRejected](#orderacceptedorrejected)
  - [orderPlaced](#orderplaced)
- [Exports](#exports)

## Installation

To use the Socket.io implementation, ensure you have the required dependencies installed. You can install Socket.io and any required database library using npm:

```bash
npm install socket.io mongoose
```

Make sure to set up your server appropriately to handle WebSocket connections.

## Usage

To use the socket functionality, you need to call the `initializeSocket` function and pass the HTTP server instance. This will establish a Socket.io connection and set up the event listeners.

```javascript
const http = require("http");
const express = require("express");
const { initializeSocket } = require("./path/to/this/file");

const app = express();
const server = http.createServer(app);

initializeSocket(server);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

## Functions

### `initializeSocket(server)`

Initializes the Socket.io instance and sets up event listeners for handling orders and room joining.

**Parameters**:
- `server`: The HTTP server instance where the Socket.io will listen.

**Returns**: None

## Socket Events

The following events are handled in the console application:

### `joinRestaurantRoom(restaurantId)`

Allows a socket connection (e.g., a restaurant) to join a specific room identified by `restaurantId`.

**Parameters**:
- `restaurantId`: The ID of the restaurant that the socket wants to join.

### `joinCustomerRoom(customerId)`

Allows a socket connection (e.g., a customer) to join a specific room identified by `customerId`.

**Parameters**:
- `customerId`: The ID of the customer that the socket wants to join.

### `orderAcceptedOrRejected(orderData)`

Emits an event notifying a customer about the acceptance or rejection of their order.

**Parameters**:
- `orderData`: An object containing details about the order and the `customerId`.

### `orderPlaced(orderData)`

Handles the event when an order is placed. It retrieves the complete order data using the order ID and emits updates to the corresponding restaurant.

**Parameters**:
- `orderData`: An object containing details about the placed order, including either `_id` or `orderId` and `restaurantId`.

## Exports

The module exports the following:

- `initializeSocket`: Function to initialize the Socket.io server.
- `io`: Getter to access the Socket.io instance.

```javascript
module.exports = {
  initializeSocket,
  get io() {
    if (!io) {
      // Handle case where io is not initialized
    }
    return io;
  },
};
```

## Notes

- Ensure that the MongoDB model `Order` is correctly defined in `./models/OrderModel` to successfully retrieve order data.
- CORS settings are configured to allow all origins. For production, you may want to restrict this.

This concludes the documentation for the Socket.io implementation in the order management system. For any questions or issues, please reach out to the maintainer of this module.