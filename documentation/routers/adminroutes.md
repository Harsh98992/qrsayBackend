### Documentation for the Admin Routes in the Router

#### Overview
This module defines the routes for administrative operations related to restaurants. It integrates with controllers and middleware to handle tasks like fetching restaurant details, modifying restaurant status, and interacting with users.

---

#### **Imports**
- **`express`**: Framework for building server-side applications.
- **Controllers**:
  - `getRestaurantsByStatus`
  - `getRestaurantDetail`
  - `changeRestaurantStatus`
  - `viewAllUsersOfRestaurant`
  - `editRestaurant`
  - `sendEmailToRestaurant`
  - `updatePaymentGateway`
- **`authenticateController`**: Handles authentication and role-based access control.
- **Helper**:
  - `getPaymentGatewayCredentials` (used with Razorpay integration).

---

#### **Routes**

1. **`GET /getRestaurantsByStatus/:restaurantVerified`**
   - **Description**: Fetch restaurants based on their verification status.
   - **Middleware**:
     - `authenticateController.protect`: Ensures the user is logged in.
     - `authenticateController.ristrictTo`: Restricts access to `admin` and `restaurantOwner`.
   - **Controller**: `getRestaurantsByStatus`

---

2. **`GET /getRestaurantDetail/:id`**
   - **Description**: Fetch detailed information about a specific restaurant by its ID.
   - **Middleware**:
     - `authenticateController.protect`: Ensures the user is logged in.
     - `authenticateController.ristrictTo`: Restricts access to `admin` and `restaurantOwner`.
   - **Controller**: `getRestaurantDetail`

---

3. **`PATCH /changeRestaurantStatus/:id`**
   - **Description**: Update the status of a restaurant by its ID.
   - **Middleware**:
     - `authenticateController.protect`: Ensures the user is logged in.
     - `authenticateController.ristrictTo`: Restricts access to `admin` and `restaurantOwner`.
   - **Controller**: `changeRestaurantStatus`

---

4. **`GET /viewAllUsersOfRestaurant/:id`**
   - **Description**: View all users associated with a specific restaurant.
   - **Middleware**:
     - `authenticateController.protect`: Ensures the user is logged in.
     - `authenticateController.ristrictTo`: Restricts access to `admin` and `restaurantOwner`.
   - **Controller**: `viewAllUsersOfRestaurant`

---

5. **`PATCH /editRestaurant/:id`**
   - **Description**: Edit the details of a specific restaurant by its ID.
   - **Middleware**:
     - `authenticateController.protect`: Ensures the user is logged in.
     - `authenticateController.ristrictTo`: Restricts access to `admin` and `restaurantOwner`.
   - **Controller**: `editRestaurant`

---

6. **`POST /sendEmailToRestaurant`**
   - **Description**: Send an email to a restaurant.
   - **Middleware**:
     - `authenticateController.protect`: Ensures the user is logged in.
     - `authenticateController.ristrictTo`: Restricts access to `admin` and `restaurantOwner`.
   - **Controller**: `sendEmailToRestaurant`

---

7. **`POST /updatePaymentGateway`**
   - **Description**: Update payment gateway information (Razorpay).
   - **Note**: Authentication and restriction middleware are commented out.
   - **Controller**: `updatePaymentGateway`

---

#### **Export**
- The router is exported using `module.exports` for integration into the main application.

---

### Notes
1. The routes are protected by middleware to ensure security and proper role-based access.
2. Some routes use `PATCH` for partial updates, while `POST` is used for actions like sending emails and updating payment information.
3. The `updatePaymentGateway` route lacks active authentication, which could pose a security risk if left unchecked.