```mermaid
erDiagram
    Customer ||--|{ Order : has_many
    Customer ||--|{ IdentifierOTP : has_many
    Restaurant ||--|{ Order : has_many
    Restaurant ||--|{ PromoCode : has_many
    Restaurant ||--|{ Table : has_many
    Restaurant ||--|{ User : has_many
    Customer {
        ObjectId id PK
        String email
        String name
        String phoneNumber
        String password
        AddressSchema addresses
        AddressSchema pastLocations
        String socialLogin
        PreviousRestaurantSearch previousRestaurant
    }
    IdentifierOTP {
        ObjectId id PK
        String identifier
        String otp
        Date firstAttempt
        Number attempts
        Boolean identifierVerified
        Date otpCreatedAt
    }
    Order {
        ObjectId id PK
        Customer customer FK "The customer who placed the order"
        Restaurant restaurant FK "The restaurant where the order is placed"
        String orderId
        String customerName
        Date orderDate
        OrderDetailSchema orderDetails
        String customerEmail
        Mixed customerPreferences
        String orderStatus
        String customerPhoneNumber
        String reason
        String payment_order_id
        String payment_id
        Boolean cashOnDeliveryAvailable
        String payment_signature
    }
    PromoCode {
        ObjectId id PK
        Restaurant restaurant FK "The restaurant that offers the promo code"
        IndividualPromoCodeSchema promoCodes
    }
    Restaurant {
        ObjectId id PK
        String restaurantName
        Boolean restaurantVerified
        String restaurantUrl
        String restaurantBackgroundImage
        String restaurantPhoneNumber
        String restaurantEmail
        String restaurantStatus
        String restaurantType
        String restaurantImages
        AddressSchema address
        time openTime
        time closeTime
        String gstNumber
        Boolean isPricingInclusiveOfGST
        Number customGSTPercentage
        String placeId
        AddOnSchema addOns
        ChoicesSchema dishChoices
        String fssaiLicenseNumber
        SocialSchema social_links
        CategorySchema cuisine
        ContactSchema contact
    }
    Table {
        ObjectId id PK
        Restaurant restaurant FK "The restaurant that owns the table"
        TableSchema tables
    }
    User {
        ObjectId id PK
        String name
        Restaurant restaurant FK "The restaurant that employs the user"
        String email
        String phoneNumber
        String role
        String password
        Date passwordChangedAt
        String passwordResetToken
        Date passwordResetExpires
        String emailOtp
        Boolean emailVerified
        Boolean active
    }
```

```mermaid
sequenceDiagram
    participant Customer
    participant Restaurant
    participant Table

    Customer->>Restaurant: Place dine-in order
    Restaurant->>Customer: Confirm order
    Customer->>Restaurant: Arrive at restaurant
    Restaurant->>Customer: Seat customer
    Customer->>Table: Choose table
    Table->>Restaurant: Reserve table
    Restaurant->>Customer: Table reserved
    Customer->>Restaurant: Order food
    Restaurant->>Customer: Serve food
    Customer->>Restaurant: Pay bill
    Restaurant->>Customer: Thank customer
```

```mermaid
sequenceDiagram
    participant Customer
    participant Restaurant

    Customer->>Restaurant: Place takeaway order
    Restaurant->>Customer: Confirm order
    Customer->>Restaurant: Arrive at restaurant
    Restaurant->>Customer: Collect order
    Customer->>Restaurant: Pay bill
    Restaurant->>Customer: Thank customer
```

```mermaid
sequenceDiagram
    participant Customer
    participant Restaurant
    participant DeliveryPerson

    Customer->>Restaurant: Place delivery order
    Restaurant->>Customer: Confirm order
    Customer->>Restaurant: Provide delivery address
    Restaurant->>DeliveryPerson: Assign delivery person
    DeliveryPerson->>Restaurant: Collect order
    Restaurant->>DeliveryPerson: Hand over order
    DeliveryPerson->>Customer: Deliver order
    Customer->>DeliveryPerson: Pay bill
    DeliveryPerson->>Customer: Thank customer
```

# Diagrams

## Use Case Diagrams

```mermaid
graph LR
    A[Customer] --> B[Place order]
    B --> C[Choose table]
    C --> D[Order food]
    D --> E[Pay bill]
    E --> F[Leave restaurant]
```

```mermaid
graph LR
    A[Customer] --> B[Place order]
    B --> C[Provide delivery address]
    C --> D[Pay bill]
    D --> E[Leave restaurant]
```

```mermaid
graph LR
    A[Customer] --> B[Place order]
    B --> C[Provide delivery address]
    C --> D[Pay bill]
    D --> E[Leave restaurant]
```

## Class Diagrams

```mermaid
classDiagram
    class Customer
    class Restaurant
    class DeliveryPerson
    class Order
    class Table
    class User
    class IdentifierOTP
    class PromoCode

    Customer "1" *-- "1..*" Order
    Customer "1" *-- "1..*" IdentifierOTP
    Restaurant "1" *-- "1..*" Order
    Restaurant "1" *-- "1..*" PromoCode
    Restaurant "1" *-- "1..*" Table
    Restaurant "1" *-- "1..*" User
```

```mermaid
classDiagram
    class Customer
    class Restaurant
    class DeliveryPerson
    class Order
    class Table
    class User
    class IdentifierOTP
    class PromoCode

    Customer "1" *-- "1..*" Order
    Customer "1" *-- "1..*" IdentifierOTP
    Restaurant "1" *-- "1..*" Order
    Restaurant "1" *-- "1..*" PromoCode
    Restaurant "1" *-- "1..*" Table
    Restaurant "1" *-- "1..*" User
```

```mermaid
classDiagram
    class Customer
    class Restaurant
    class DeliveryPerson
    class Order
    class Table
    class User
    class IdentifierOTP
    class PromoCode

    Customer "1" *-- "1..*" Order
    Customer "1" *-- "1..*" IdentifierOTP
    Restaurant "1" *-- "1..*" Order
    Restaurant "1" *-- "1..*" PromoCode
    Restaurant "1" *-- "1..*" Table