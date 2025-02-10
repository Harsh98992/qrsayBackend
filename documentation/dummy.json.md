# Restaurant Data Documentation

This document provides a detailed explanation of the structure and content of a restaurant data JSON object, which includes information about the restaurant, its contact details, opening hours, menu, social media links, photos, and more.

## Fields

### Restaurant Information

- **_id**: Unique identifier for the restaurant.
  - Type: ObjectId
  - Example: `6468cb1aca755b75f6ae150e`

- **restaurantName**: The name of the restaurant.
  - Type: String
  - Example: `Example Restaurant`

### Contact Information

- **contact**: Contains the contact information for the restaurant.
  - **email**: The contact email address.
    - Type: String
    - Example: `johndoe@example.com`
  - **phone**: The contact phone number.
    - Type: String
    - Example: `(555) 123-4567`
  - **locationLink**: A link to the restaurant's location on a map (optional).
    - Type: String
    - Example: `""`
  - **address**: Physical address details.
    - **street**: The street address.
      - Type: String
      - Example: `123 Main Street`
    - **city**: The city name.
      - Type: String
      - Example: `Cityville`
    - **state**: The state or province.
      - Type: String
      - Example: `State`
    - **zipcode**: The postal/ZIP code.
      - Type: String
      - Example: `12345`
    - **country**: The country.
      - Type: String
      - Example: `Country`

### Operational Details

- **openTime**: The opening time of the restaurant.
  - Type: String
  - Example: `8:00 AM`

- **closeTime**: The closing time of the restaurant.
  - Type: String
  - Example: `8:00 PM`

- **gstNumber**: The GST number for tax purposes.
  - Type: String
  - Example: `34567899`

### Ratings and Reviews

- **rating**: The average rating of the restaurant (out of 5).
  - Type: Integer
  - Example: `4`

- **reviewCount**: The number of reviews the restaurant has received.
  - Type: Integer
  - Example: `200`

### FSSAI License

- **fssaiLicenseNumber**: The Food Safety and Standards Authority of India (FSSAI) license number.
  - Type: String
  - Example: `12345678`

### Social Media Links

- **socialLinks**: A list of social media profiles related to the restaurant.
  - Type: Array of objects
  - Example:
    ```json
    [
      {
        "name": "Facebook",
        "link": "https://www.facebook.com/example"
      },
      {
        "name": "Twitter",
        "link": "https://www.twitter.com/example"
      },
      {
        "name": "Instagram",
        "link": "https://www.instagram.com/example"
      },
      {
        "name": "LinkedIn",
        "link": "https://www.linkedin.com/company/example"
      },
      {
        "name": "YouTube",
        "link": "https://www.youtube.com/channel/example"
      }
    ]
    ```

### Photos

- **photos**: A list of photos associated with the restaurant.
  - Type: Array of objects
  - Example:
    ```json
    [
      {
        "name": "Photo 1",
        "url": "https://images.pexels.com/photos/1322184/pexels-photo-1322184.jpeg",
        "description": "Description of the first photo"
      },
      {
        "name": "Photo 2",
        "url": "https://images.pexels.com/photos/4450334/pexels-photo-4450334.jpeg",
        "description": "Description of the second photo"
      }
    ]
    ```

---

## Menu Structure

The menu is divided into multiple categories, including starters, main courses, desserts, and drinks.

### Menu Item Details

Each menu item includes the following properties:

- **name**: The name of the menu item.
  - Type: String
  - Example: `Biryani`

- **_id**: Unique identifier for the menu item.
  - Type: String
  - Example: `1`

- **availableFlag**: Whether the menu item is currently available.
  - Type: Boolean
  - Example: `true`

- **imageUrl**: An optional image URL for the item.
  - Type: String
  - Example: `""`

- **key**: The category of the menu item (e.g., "Starters", "Main Course").
  - Type: String
  - Example: `Starters`

- **description**: A brief description of the menu item.
  - Type: String
  - Example: `Toasted bread topped with tomatoes, garlic, and basil`

- **price**: The base price of the item.
  - Type: Integer
  - Example: `1000`

- **discountPercentage**: The discount percentage applied to the menu item (if any).
  - Type: Integer
  - Example: `10`

- **discountPrice**: The discounted price of the item.
  - Type: Integer
  - Example: `900`

- **type**: The type of item (e.g., "Veg", "Non Veg").
  - Type: String
  - Example: `Veg`

- **spicyFlag**: Indicates whether the item is spicy.
  - Type: Boolean
  - Example: `true`

- **sizeAvailable**: List of available sizes for the item, if applicable.
  - Type: Array of objects
  - Example:
    ```json
    [
      {
        "name": "Small",
        "price": 600
      },
      {
        "name": "Large",
        "price": 900
      }
    ]
    ```

- **extraIngredients**: A list of optional extra ingredients available for the item.
  - Type: Array of objects
  - Example:
    ```json
    [
      {
        "name": "Extra Cheese",
        "price": 100
      },
      {
        "name": "Olives",
        "price": 50
      },
      {
        "name": "Mushrooms",
        "price": 150
      }
    ]
    ```

---

## Categories

The restaurant's menu is divided into the following categories:

1. **Starters**: Includes appetizers and light bites.
2. **Main Course**: Includes the main dishes.
3. **Desserts**: Includes sweet dishes.
4. **Drinks**: Includes beverages.

---

## Example of a Menu Item

Here’s an example of a starter item:

```json
{
  "name": "Biryani",
  "_id": "1",
  "availableFlag": true,
  "imageUrl": "",
  "key": "Starters",
  "description": "Toasted bread topped with tomatoes, garlic, and basil",
  "price": 1000,
  "discountPercentage": 10,
  "discountPrice": 900,
  "type": "Veg",
  "spicyFlag": true,
  "sizeAvailable": [
    {
      "name": "Small",
      "price": 600
    },
    {
      "name": "Large",
      "price": 900
    }
  ],
  "extraIngredients": [
    {
      "name": "Extra Cheese",
      "price": 100
    },
    {
      "name": "Olives",
      "price": 50
    },
    {
      "name": "Mushrooms",
      "price": 150
    }
  ]
}
```

---

This documentation outlines the key elements of the restaurant data structure, providing a comprehensive overview of the data and how it is organized.