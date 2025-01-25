# Configuration File Documentation

This document provides an overview of the environment variables and their usage in the configuration file. The values are used for setting up various services and features in the system.

---

## 1. Database Connection Strings

### `DB_CONNECTION_STRING`
- **Description**: The MongoDB connection string for the production environment.
- **Example Value**: 
  ```
  mongodb+srv://goqrorder:2fFhzGUn6EdNUPQJ@cluster0.bt9bmvq.mongodb.net/digitalMenuWeb
  ```

### `DB_Test_CONNECTION_STRING`
- **Description**: The MongoDB connection string for the test database.
- **Example Value**:
  ```
  mongodb+srv://goqrorder:2fFhzGUn6EdNUPQJ@cluster0.bt9bmvq.mongodb.net/testdb1
  ```

---

## 2. Application Settings

### `PORT`
- **Description**: The port on which the application will run.
- **Example Value**: 
  ```
  8080
  ```

### `NODE_ENV`
- **Description**: Specifies the environment in which the application is running (e.g., `dev`, `prod`).
- **Example Value**: 
  ```
  dev
  ```

---

## 3. JWT (JSON Web Token) Settings

### `JWT_SECRET`
- **Description**: The secret key used to sign and verify JWT tokens.
- **Example Value**: 
  ```
  secret
  ```

### `JWT_EXPIRES_IN`
- **Description**: The expiration time for JWT tokens.
- **Example Value**: 
  ```
  1d
  ```

---

## 4. Email Configuration

### `EMAIL_USERNAME`
- **Description**: The email address used to send emails from the application.
- **Example Value**:
  ```
  info@qrsay.com
  ```

### `EMAIL_PASSWORD`
- **Description**: The password associated with the email account used in the application.
- **Example Value**: 
  ```
  Harsh@123
  ```

---

## 5. Razorpay API Keys

### `razorpay_key_id`
- **Description**: The Razorpay key ID for the test environment.
- **Example Value**: 
  ```
  rzp_test_riSm0PLxWxsyrG
  ```

### `razorpay_prod_key_id`
- **Description**: The Razorpay key ID for the production environment.
- **Example Value**: 
  ```
  rzp_live_QEAKYdNlLVbqvB
  ```

### `razorpay_prod_key_secret`
- **Description**: The Razorpay key secret for the production environment.
- **Example Value**: 
  ```
  h91lWciJSRFD2y6tIXiZBnpP
  ```

### `razorpay_key_secret`
- **Description**: The Razorpay key secret for the test environment.
- **Example Value**:
  ```
  mjtYQKFjhmMN7qSBJbjLdi5L
  ```

---

## 6. Payment Configuration

### `payment_secret`
- **Description**: The secret key used for payment-related operations.
- **Example Value**: 
  ```
  05b534e5c60447031a9df60ba3c7bfb2
  ```

---

## 7. Encryption Configuration

### `encryptionAlogrithm`
- **Description**: The encryption algorithm used for securing data.
- **Example Value**: 
  ```
  aes-256-gcm
  ```

---

## 8. Google Maps API Key

### `GOOGLE_MAPS_API_KEY`
- **Description**: The API key used to access Google Maps services.
- **Example Value**: 
  ```
  AIzaSyA565Z7yEHcoZ1TMV4Asu3TZQGn0W2Np_A
  ```

---

## 9. SMS Configuration

### `SMS_API_KEY`
- **Description**: The API key used to send SMS via the service provider.
- **Example Value**: 
  ```
  bPVhEJ1KzMtZp7IsmwCoFNcDXiR29OYul34q8vHLkGT0rBxnWab3Vg7jaWAskhnoDTImBZXcxJvF48lU
  ```

### `SMS_ORDER_STATUS`
- **Description**: Whether SMS notifications for orders are enabled.
- **Example Value**: 
  ```
  false
  ```

### `SMS_ORDER_STATUS_URL`
- **Description**: The URL used for sending SMS notifications when an order is placed.
- **Example Value**: 
  ```
  https://www.fast2sms.com/dev/bulkV2?authorization=bPVhEJ1KzMtZp7IsmwCoFNcDXiR29OYul34q8vHLkGT0rBxnWab3Vg7jaWAskhnoDTImBZXcxJvF48lU&route=dlt&sender_id=QRSAYY&message=163319&variables_values=
  ```

---

## 10. WhatsApp Notification Status

### `WHATSAPP_ORDER_STATUS`
- **Description**: Whether WhatsApp notifications for orders are enabled.
- **Example Value**: 
  ```
  true
  ```

---

## 11. ImgUr API Configuration

### `IMGUR_CLIENT_ID`
- **Description**: The client ID for the ImgUr API.
- **Example Value**: 
  ```
  869f294e59431cd
  ```

### `IMGUR_CLIENT_SECRET`
- **Description**: The client secret for the ImgUr API.
- **Example Value**: 
  ```
  e2aa0949267297997c95e1d430a6dcdfb48c93eb
  ```

---

## 12. AWS Configuration

### `AWS_ACCESS_KEY`
- **Description**: The AWS access key for accessing AWS services.
- **Example Value**: 
  ```
  AKIAUWUI4VWN77KUIVML
  ```

### `AWS_SECRET_ACCESS_KEY`
- **Description**: The AWS secret access key for accessing AWS services.
- **Example Value**: 
  ```
  PP/3jfV/qZRP7J7Il1gB0qu/vRLhryWpvSelpUms
  ```

---

## 13. Email Order Status

### `EMAIL_ORDER_STATUS`
- **Description**: Whether email notifications for orders are enabled.
- **Example Value**: 
  ```
  true
  ```

---

### Notes:
- Replace the example values with your actual environment-specific configurations.
- Ensure that sensitive data like passwords and API keys are kept secure and not exposed in public repositories.