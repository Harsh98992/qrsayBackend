Here is the documentation for the provided configuration file in Markdown format:

```markdown
# Configuration File Documentation

This document provides a detailed explanation of the configuration settings used in the application.

## Database Connections
- **DB_CONNECTION_STRING**: 
  - Type: String
  - Description: Connection string for the main MongoDB database.
  - Example: `"mongodb+srv://goqrorder:2fFhzGUn6EdNUPQJ@cluster0.bt9bmvq.mongodb.net/digitalMenuWeb"`

- **DB_Test_CONNECTION_STRING**: 
  - Type: String
  - Description: Connection string for the test MongoDB database.
  - Example: `"mongodb+srv://goqrorder:2fFhzGUn6EdNUPQJ@cluster0.bt9bmvq.mongodb.net/testdb1"`

## Server Configuration
- **PORT**: 
  - Type: Integer
  - Description: The port number on which the server will listen for incoming requests.
  - Example: `8080`

- **NODE_ENV**: 
  - Type: String
  - Description: Defines the environment in which the application is running (development, production, etc.).
  - Example: `'dev'`

## Authentication
- **JWT_SECRET**: 
  - Type: String
  - Description: Secret key used for signing JSON Web Tokens (JWT).
  - Example: `'secret'`

- **JWT_EXPIRES_IN**: 
  - Type: String
  - Description: Expiration time for the JWT in ISO 8601 duration format.
  - Example: `1d`

## Email Configuration
- **EMAIL_USERNAME**: 
  - Type: String
  - Description: Username for the email account used for sending notifications.
  - Example: `'info@qrsay.com'`

- **EMAIL_PASSWORD**: 
  - Type: String
  - Description: Password for the email account.
  - Example: `'Harsh@123'`

## Payment Gateway Configuration
- **razorpay_key_id**: 
  - Type: String
  - Description: Key ID for Razorpay for payment processing.
  - Example: `'rzp_test_riSm0PLxWxsyrG'`

- **razorpay_prod_key_id**: 
  - Type: String
  - Description: Production Key ID for Razorpay.
  - Example: `'rzp_live_QEAKYdNlLVbqvB'`

- **razorpay_prod_key_secret**: 
  - Type: String
  - Description: Production Key Secret for Razorpay.
  - Example: `'h91lWciJSRFD2y6tIXiZBnpP'`

- **razorpay_key_secret**: 
  - Type: String
  - Description: Key secret for Razorpay for payment processing.
  - Example: `'mjtYQKFjhmMN7qSBJbjLdi5L'`

- **payment_secret**: 
  - Type: String
  - Description: Secret for processing payments.
  - Example: `'05b534e5c60447031a9df60ba3c7bfb2'`

## Encryption
- **encryptionAlogrithm**: 
  - Type: String
  - Description: Algorithm used for data encryption.
  - Example: `'aes-256-gcm'`

## Third-Party API Keys
- **GOOGLE_MAPS_API_KEY**: 
  - Type: String
  - Description: API key for Google Maps services.
  - Example: `'AIzaSyA565Z7yEHcoZ1TMV4Asu3TZQGn0W2Np_A'`

- **SMS_API_KEY**: 
  - Type: String
  - Description: API key for SMS services.
  - Example: `'bPVhEJ1KzMtZp7IsmwCoFNcDXiR29OYul34q8vHLkGT0rBxnWab3Vg7jaWAskhnoDTImBZXcxJvF48lU'`

- **IMGUR_CLIENT_ID**: 
  - Type: String
  - Description: Client ID for interacting with Imgur API.
  - Example: `"869f294e59431cd"`

- **IMGUR_CLIENT_SECRET**: 
  - Type: String
  - Description: Client secret for Imgur API.
  - Example: `"e2aa0949267297997c95e1d430a6dcdfb48c93eb"`

- **AWS_ACCESS_KEY**: 
  - Type: String
  - Description: Access key for AWS services.
  - Example: `"AKIAUWUI4VWN77KUIVML"`

- **AWS_SECRET_ACCESS_KEY**: 
  - Type: String
  - Description: Secret access key for AWS services.
  - Example: `"PP/3jfV/qZRP7J7Il1gB0qu/vRLhryWpvSelpUms"`

## Notification Settings
- **EMAIL_ORDER_STATUS**: 
  - Type: String
  - Description: Enables email notifications for order status.
  - Example: `"true"`

- **SMS_ORDER_STATUS**: 
  - Type: String
  - Description: Enables SMS notifications for order status.
  - Example: `"false"`

- **WHATSAPP_ORDER_STATUS**: 
  - Type: String
  - Description: Enables WhatsApp notifications for order status.
  - Example: `"true"`

## SMS API Configuration
- **SMS_ORDER_STATUS_URL**: 
  - Type: String
  - Description: URL endpoint for sending SMS notifications.
  - Example: `"https://www.fast2sms.com/dev/bulkV2?authorization=bPVhEJ1KzMtZp7IsmwCoFNcDXiR29OYul34q8vHLkGT0rBxnWab3Vg7jaWAskhnoDTImBZXcxJvF48lU&route=dlt&sender_id=QRSAYY&message=163319&variables_values="`
```

Feel free to customize it further as needed!