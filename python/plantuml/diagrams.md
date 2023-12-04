# diagrams

## Use Case Diagram

The Use Case Diagrams are Diagrams that show the interaction between the user and the system. Here we have three actors: Customer, DeliveryPerson and Restaurant. The Customer can place an order, choose a table, order food, pay the bill and leave the restaurant. The Customer can also place a delivery order, provide a delivery address, pay the bill and leave the restaurant. The DeliveryPerson can collect the order and deliver it to the customer. The Restaurant can confirm the order, seat the customer, serve the food, hand over the order, assign a delivery person, thank the customer and collect the bill.

The Use case Diagram make it easier to understand the interaction between the actors and the system.

```plantuml
@startuml MyDiagram
left to right direction

actor Customer as C
actor DeliveryPerson as DP
actor Restaurant as R

rectangle "Dine-In" {
    C --> (Place dine-in order)
    (Place dine-in order) --> R
    R --> (Confirm order)
    C --> (Arrive at restaurant)
    (Arrive at restaurant) --> R
    R --> (Seat customer)
    C --> (Choose table)
    C --> (Order food)
    (Order food) --> R
    R --> (Serve food)
    C --> (Pay bill)
    (Pay bill) --> R
    R --> (Thank customer)
}

rectangle "Takeaway" {
    C --> (Place takeaway order)
    (Place takeaway order) --> R
    R --> (Confirm order)
    C --> (Arrive at restaurant)
    (Arrive at restaurant) --> R
    R --> (Collect order)
    C --> (Pay bill)
    (Pay bill) --> R
    R --> (Thank customer)
}

rectangle "Delivery" {
    C --> (Place delivery order)
    (Place delivery order) --> R
    R --> (Confirm order)
    C --> (Provide delivery address)
    (Provide delivery address) --> R
    R --> (Assign delivery person)
    DP --> (Collect order)
    (Collect order) --> R
    R -left-> (Hand over order)
    DP --> (Deliver order)
    C --> (Pay bill)
    (Pay bill) --> DP
    DP --> (Thank customer)
}
@enduml
```

## Sequence Diagrams

```plantuml
@startuml
actor Customer as C
actor Restaurant as R
actor DeliveryPerson as DP

== Dine-In ==
C -> R: Place dine-in order
activate R
R --> C: Confirm order
C -> R: Arrive at restaurant
R --> C: Seat customer
C -> R: Choose table
C -> R: Order food
R --> C: Serve food
C -> R: Pay bill
R --> C: Thank customer
deactivate R

== Takeaway ==
C -> R: Place takeaway order
activate R
R --> C: Confirm order
C -> R: Arrive at restaurant
R --> C: Collect order
C -> R: Pay bill
R --> C: Thank customer
deactivate R

== Delivery ==
C -> R: Place delivery order
activate R
R --> C: Confirm order
C -> R: Provide delivery address
R -> DP: Assign delivery person
activate DP
DP -> R: Collect order
R --> DP: Hand over order
DP -> C: Deliver order
C -> DP: Pay bill
DP --> C: Thank customer
deactivate DP
deactivate R
@enduml
```

## Class Diagrams

```plantuml
@startuml
class Customer {
    -name: String
    -address: String
    -phone: String
    -email: String
    -paymentMethod: String
    +placeOrder()
    +chooseTable()
    +orderFood()
    +payBill()
    +leaveRestaurant()
    +placeDeliveryOrder()
    +provideDeliveryAddress()
    +payBill()
    +leaveRestaurant()
}

class Restaurant {
    -name: String
    -address: String
    -phone: String
    -email: String
    -paymentMethod: String
    +confirmOrder()
    +seatCustomer()
    +serveFood()
    +handOverOrder()
    +assignDeliveryPerson()
    +collectBill()
    +thankCustomer()
}

class DeliveryPerson {
    -name: String
    -address: String
    -phone: String
    -email: String
    -paymentMethod: String
    +deliverOrder()
    +collectBill()
    +thankCustomer()
}

Customer "1" -- "1..*" Restaurant
Restaurant "1" -- "1..*" DeliveryPerson
@enduml
```
## Activity Diagrams

```plantuml
@startuml
(*) --> "Place Order"
if "Dine-In" then
  -->[true] "Arrive at restaurant"
  --> "Seat Customer"
  --> "Choose Table"
  --> "Order Food"
  --> "Pay Bill"
  --> "Leave Restaurant"
else
  ->[false] "Place Delivery Order"
  --> "Provide Delivery Address"
  --> "Pay Bill"
  --> "Leave Restaurant"
endif
@enduml
```

## Data Flow Diagrams

```plantuml
@startuml
actor Customer as C
