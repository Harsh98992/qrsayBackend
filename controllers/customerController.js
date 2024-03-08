const catchAsync = require("../helpers/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../helpers/appError");
const Customer = require("../models/CustomerModel");
const Restaurant = require("../models/restaurantModel");
const Order = require("../models/OrderModel");
const User = require("../models/userModel");
const PromoCode = require("../models/promoCodeModel");
const sendEmail = require("../helpers/email");
const Table = require("../models/tableModel");

exports.customerStoreRestaurant = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.restaurantId) {
    res.status(200).json({});
  }

  const { email, restaurantId } = req.body;

  const result = await Customer.findOneAndUpdate(
    { email },

    { $push: { previousRestaurant: { restaurantId: restaurantId } } }
  );

  res.status(200).json({
    status: "success",
    updatedUserData: result,
  });
});

exports.addCustomerAddress = catchAsync(async (req, res, next) => {
  let address = req.body;

  let newAddress;
  // we have to update the addresses of the customer

  let customer = await Customer.findById(req.user._id);
  if (!customer) {
    return next(new AppError("You are not logged in! Please log in", 401));
  } else {
    // update the existing customer
    customer = await Customer.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { addresses: address } }
    );

    // address = customer.addresses[customer.addresses.length - 1];

    // for some reason the address being returned in the response is 2nd last address in the array

    // update the customer object

    customer = await Customer.findById(req.user._id);

    // get the last address in the addresses array
    newAddress = customer.addresses[customer.addresses.length - 1];
  }

  res.status(200).json({
    status: "success",
    data: {
      customer: customer,
      address: newAddress,
    },
  });
});

exports.editCustomerAddress = catchAsync(async (req, res, next) => {
  const address = req.body;
  const addressId = address._id;
  console.log("addressId", addressId);

  const customer = await Customer.findById(req.user._id);
  console.log("customer", customer);

  if (!customer) {
    return next(new AppError("You are not logged in! Please log in", 401));
  } else {
    // Find the address with the given addressId in the customer's addresses array
    const addressToUpdate = customer.addresses.find(
      (addr) => addr._id.toString() === addressId.toString()
    );

    if (!addressToUpdate) {
      return next(new AppError("Address not found", 404));
    }

    // Update the address fields if they are present in the request body
    if (address.address) {
      addressToUpdate.address = address.address;
    }
    if (address.latitude) {
      addressToUpdate.latitude = address.latitude;
    }
    if (address.longitude) {
      addressToUpdate.longitude = address.longitude;
    }
    if (address.pinCode) {
      addressToUpdate.pinCode = address.pinCode;
    }

    // Save the updated customer object
    await customer.save();

    res.status(200).json({
      status: "success",
      data: {
        customer,
      },
    });
  }
});

exports.getCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.user._id);

  res.status(200).json({
    status: "success",
    data: {
      customer: customer,
    },
  });
});
exports.sendContactUsMail = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.subject || !req.body.message) {
    return next(
      new AppError("Please provide your email, subject, and message.", 404)
    );
  }

  const { email, subject, message } = req.body;
  await sendEmail(email, subject, message);

  res.status(200).json({
    status: "success",
    data: {
      message:
        "Thank you for contacting us! Your email has been sent successfully. We will get back to you as soon as possible.",
    },
  });
});
exports.getCustomerById = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      customer,
    },
  });
});
exports.getCustomerPreviousRestaurant = catchAsync(async (req, res, next) => {
  if (!req.body.pastRestaurantData && !req.body.pastRestaurantData.length) {
    res.status(200).json({
      status: "success",
      data: {
        restaurantData: [],
      },
    });
  }
  // const customer = await Customer.findById(req.user._id);
  const restaurantData = await Restaurant.find({
    _id: { $in: req.body.pastRestaurantData },
  }).select(
    "restaurantUrl address restaurantName restaurantBackgroundImage restaurantType contact restaurantPhoneNumber"
  );
  res.status(200).json({
    status: "success",
    data: {
      restaurantData,
    },
  });
});

exports.deleteAddressOfRequestCustomerById = catchAsync(
  async (req, res, next) => {
    addressId = req.params.id;
    console.log("addressId", addressId);
    let customer = await Customer.findById(req.user._id);
    console.log("customer", customer);
    if (!customer) {
      return next(new AppError("You are not logged in! Please log in", 401));
    } else {
      // update the existing customer
      customer = await Customer.findOneAndUpdate(
        { _id: req.user._id },
        { $pull: { addresses: { _id: addressId } } }
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        customer,
      },
    });
  }
);

// // Function to calculate the distance between two points using the Haversine formula
// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371; // Radius of the Earth in km
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//     Math.cos((lat2 * Math.PI) / 180) *
//     Math.sin(dLon / 2) *
//     Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c; // Distance in km
//   return distance;
// }

// // API endpoint to get nearby restaurants (limited to 5)
// router.get('/api/restaurants/nearby', async (req, res) => {
//   try {
//     const { latitude, longitude } = req.query;
//     const customerLatitude = parseFloat(latitude);
//     const customerLongitude = parseFloat(longitude);

//     if (isNaN(customerLatitude) || isNaN(customerLongitude)) {
//       return res.status(201).json({ error: 'Invalid latitude or longitude' });
//     }

//     // Find all restaurants in the database
//     const allRestaurants = await Restaurant.find();

//     // Filter restaurants based on distance and limit the result to 5
//     const nearbyRestaurants = allRestaurants
//       .filter((restaurant) => {
//         const restaurantLatitude = restaurant.address.latitude;
//         const restaurantLongitude = restaurant.address.longitude;
//         const distance = calculateDistance(
//           customerLatitude,
//           customerLongitude,
//           restaurantLatitude,
//           restaurantLongitude
//         );

//         return distance < 5; // Return true if the distance is less than 5 km
//       })
//       .slice(0, 5); // Limit the result to 5 nearby restaurants

//     res.json({ nearbyRestaurants });
//   } catch (error) {
//     console.error('Error fetching nearby restaurants:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// module.exports = router;

// write the distance function here
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

exports.getNearbyRestaurants = catchAsync(async (req, res, next) => {
  const { latitude, longitude } = req.query;
  const customerLatitude = parseFloat(latitude);
  const customerLongitude = parseFloat(longitude);

  if (isNaN(customerLatitude) || isNaN(customerLongitude)) {
    return res.status(201).json({ error: "Invalid latitude or longitude" });
  }

  // Find all restaurants in the database
  let restaurants = await Restaurant.find();

  // remove disabled restaurants4

  restaurants = restaurants.filter((restaurant) => !restaurant.disabled);

  restaurants = restaurants.map((restaurant) => {
    return {
      restaurantUrl: restaurant.restaurantUrl,

      restaurantName: restaurant.restaurantName,
      _id: restaurant._id,
    };
  });

  res.status(200).json({
    status: "success",
    data: {
      restaurants,
    },
  });
});

exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  let restaurants = await Restaurant.find();

  // remove disabled restaurants4
  restaurants = restaurants.filter((restaurant) => !restaurant.disabled);

  // select the fields to be sent in the response as only restaurantUrl and restaurantName is required and not the whole restaurant object
  restaurants = restaurants.map((restaurant) => {
    return {
      restaurantUrl: restaurant.restaurantUrl,

      restaurantName: restaurant.restaurantName,
      _id: restaurant._id,
    };
  });

  res.status(200).json({
    status: "success",
    data: {
      restaurants,
    },
  });
});

exports.getRestaurantDetailsFromRestaurantUrl = catchAsync(
  async (req, res, next) => {
    const restaurantUrl = req.params.restaurantUrl;
    const restaurant = await Restaurant.findOne({
      restaurantUrl: restaurantUrl,
    });
    if (!restaurant) {
      return next(new AppError("No restaurant found", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        restaurant,
      },
    });
  }
);

exports.getRestaurantDetailsFromRestaurantId = catchAsync(
  async (req, res, next) => {
    const restaurantId = req.params.restaurantId;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return next(new AppError("No restaurant found", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        restaurant,
      },
    });
  }
);

exports.getPromoCodesForRestaurantUrl = catchAsync(async (req, res, next) => {
  const restaurantUrl = req.params.restaurantUrl;

  const restaurant = await Restaurant.findOne({
    restaurantUrl: restaurantUrl,
  });

  if (!restaurant) {
    return next(new AppError("No restaurant found", 404));
  }

  const restaurantId = restaurant._id;

  let promoCode = await PromoCode.findOne({
    restaurantId: restaurantId,
  });

  if (!promoCode) {
    return next(new AppError("No promo code found", 404));
  }

  var promoCodes = promoCode.promoCodes;

  // remove the inactive promo codes
  promoCodes = promoCodes.filter((promoCode) => promoCode.active === true);

  res.status(200).json({
    status: "success",
    data: {
      promoCodes: promoCodes,
    },
  });
});

exports.checkIfPromoCodeIsValid = catchAsync(async (req, res, next) => {
  const promoCodeName = req.body.promoCodeName;

  if (!promoCodeName) {
    return res.status(201).json({
      status: "error",
      message: "No promo code name found",
    });
  }

  console.log("promoCodeName", promoCodeName);

  const restaurantUrl = req.body.restaurantUrl;

  if (!restaurantUrl) {
    return res.status(201).json({
      status: "error",
      message: "No restaurant url found",
    });
  }

  // find the restaurant with the given restaurantUrl
  const restaurant = await Restaurant.findOne({
    restaurantUrl: restaurantUrl,
  });

  if (!restaurant) {
    return res.status(201).json({
      status: "error",
      message: "No restaurant found",
    });
  }

  const restaurantId = restaurant._id;

  const promoCodes = await PromoCode.findOne({
    restaurantId: restaurantId,
  });
  if (!promoCodes) {
    return res.status(404).json({
      status: "error",
      message: "This promo code is not valid",
    });
  }
  const promoCodeToCheck = promoCodes.promoCodes.find(
    (promoCode) => promoCode.codeName === promoCodeName
  );

  // check if the promo code exists
  if (!promoCodeToCheck) {
    return res.status(404).json({
      status: "error",
      message: "This promo code is not valid",
    });
  }

  // get the customer id from the request user
  const customerId = req.user._id;

  // find the customer by id
  const customer = await Customer.findById(customerId);

  // check if the customer exists
  if (!customer) {
    return res.status(404).json({
      status: "error",
      message: "No customer found",
    });
  }

  // get the amount to be paid from the request body
  const amountToBePaid = req.body.amountToBePaid;

  // check if the promo code has a minimum order value
  if (promoCodeToCheck.minOrderValue > amountToBePaid) {
    return res.status(201).json({
      status: "error",
      message: `Invalid promo code, minimum order value is ${promoCodeToCheck.minOrderValue}`,
    });
  }

  // calculate the discount amount based on the discount type
  let discountAmount;
  if (promoCodeToCheck.discountType === "percentage") {
    discountAmount = (promoCodeToCheck.discountAmount / 100) * amountToBePaid;
  } else {
    discountAmount = promoCodeToCheck.discountAmount;
  }

  // check if the discount amount is greater than the max discount
  if (discountAmount > promoCodeToCheck.maxDiscount) {
    discountAmount = promoCodeToCheck.maxDiscount;
  }

  // check if the discount amount is greater than the amount to be paid
  if (discountAmount > amountToBePaid) {
    discountAmount = amountToBePaid;
  }

  // check if the promo code is applicable for new customers only
  if (promoCodeToCheck.applicableFor === "newCustomer") {
    // get the orders of the customer
    const orders = customer.orders;

    // filter the orders by the restaurant id
    const ordersForRestaurant = orders.filter(
      (order) => order.restaurantId.toString() === restaurant._id.toString()
    );

    // check if the customer has any orders for the restaurant
    if (ordersForRestaurant.length > 0) {
      return res.status(201).json({
        status: "error",
        message: "Invalid promo code, you are not a new customer",
      });
    }
  }

  // get the current hour of the day
  let currentHour = new Date().getHours();

  // define the meal time based on the current hour
  let mealTime = "";

  if (currentHour >= 5 && currentHour < 11) {
    mealTime = "Breakfast";
  }
  if (currentHour >= 11 && currentHour < 15) {
    mealTime = "Lunch";
  }
  if (currentHour >= 15 && currentHour < 19) {
    mealTime = "Snack";
  }
  if (currentHour >= 19 && currentHour < 23) {
    mealTime = "Dinner";
  }
  if (currentHour >= 23 && currentHour < 5) {
    mealTime = "Late night";
  }

  // check if the promo code is valid for a specific meal time
  if (promoCodeToCheck.mealTime !== "All day") {
    if (promoCodeToCheck.mealTime !== mealTime) {
      return res.status(201).json({
        status: "error",
        message:
          "Invalid promo code, this promo code is not valid at this time",
      });
    }
  }

  // check if the promo code is valid for specific days of the week
  let day = new Date().getDay();
  day = day - 1;
  if (day === -1) {
    day = 6;
  }

  // define an array of all days
  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // convert the day to string like "Monday"
  day = allDays[day];

  console.log("day", day);

  console.log("promoCodeToCheck.days", promoCodeToCheck.days);

  console.log("promoCodeToCheck", promoCodeToCheck);
  // check if the current day is included in the promo code days
  if (!promoCodeToCheck.days.includes(day)) {
    return res.status(201).json({
      status: "error",
      message: "Invalid promo code, this promo code is not valid on this day",
    });
  }

  // check if the promo code is active
  if (!promoCodeToCheck.active) {
    return res.status(201).json({
      status: "error",
      message: "Invalid promo code, this promo code is not active",
    });
  }

  // send the response with the discount amount and the promo code details
  res.status(200).json({
    status: "success",
    data: {
      discountAmount: discountAmount,
      promoCode: promoCodeToCheck,
    },

    message: "Promo code is valid",
  });
});

exports.isDineInAvailable = catchAsync(async (req, res, next) => {
  // get restaurantId from params

  const restaurantId = req.params.restaurantId;

  // find the restaurant with the given restaurantId

  const table = await Table.findOne({ restaurantId: restaurantId });
  console.log(table);
  // just ensure the tables is not empty
  if (!table) {
    return res.status(200).json({
      status: "success",
      data: {
        isDineInAvailable: false,
        tableDetails: [],
      },
    });
  }
  let tables = table.tables;

  if (tables.length === 0) {
    return res.status(200).json({
      status: "success",
      data: {
        isDineInAvailable: false,
        tableDetails: tables,
      },
    });
  }

  // now check that atleast one table is isAvailable
  for (let i = 0; i < tables.length; i++) {
    if (tables[i].isAvailable) {
      return res.status(200).json({
        status: "success",
        data: {
          isDineInAvailable: true,
          tableDetails: tables,
        },
      });
    }
  }

  if (!req.user) {
    return res.status(200).json({
      status: "success",
      data: {
        isDineInAvailable: true,
        tableDetails: tables,
      },
    });
  }

  let customer_id = req.user._id;

  // // check if the orders table have any orders with the customer id same as the user is and the status is pending

  const order = await Order.findOne({
    customerId: customer_id,
    status: "pending",
  });

  if (order) {
    if (order.customerPreferences.preference === "Dine In") {
      return res.status(200).json({
        status: "success",
        data: {
          isDineInAvailable: true,
          tableDetails: tables,
        },
      });
    }
  }

  // if no table is available
  return res.status(200).json({
    status: "success",
    data: {
      isDineInAvailable: false,
      tableDetails: tables,
    },
  });
});

exports.addPastLocation = catchAsync(async (req, res, next) => {
  let customerId = req.user._id;
  const address = req.body.address;
  const latitude = address.latitude;

  const longitude = address.longitude;

  const customer = await Customer.findById(customerId);

  // get all the past locations of the customer
  const pastLocations = customer.pastLocations;

  // check if the customer has any past locations which are near to the current location
  const pastLocation = pastLocations.find((pastLocation) => {
    const distance = calculateDistance(
      pastLocation.latitude,
      pastLocation.longitude,
      latitude,
      longitude
    );
    return distance < 0.2;
  });

  // if the customer has a past location which is near to the current location

  if (pastLocation) {
    // update the past location with the current location
    pastLocation.latitude = latitude;
    pastLocation.longitude = longitude;
  } else {
    // if the customer does not have any past location which is near to the current location

    // add the current location to the past locations
    pastLocations.push(address);
  }

  // save the customer
  await customer.save();
});

exports.getCustomerPastLocations = catchAsync(async (req, res, next) => {
  let customerId = req.user._id;

  const customer = await Customer.findById(customerId);

  // get all the past locations of the customer

  const pastLocations = customer.pastLocations;

  res.status(200).json({
    status: "success",
    data: {
      pastLocations,
    },
  });
});

exports.getRestaurantStatus = catchAsync(async (req, res, next) => {
  const restaurantId = req.params.restaurantId;

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    return next(new AppError("No restaurant found", 404));
  }

  const openDays = restaurant.openDays;

  const openTime = restaurant.openTime;
  const closeTime = restaurant.closeTime;

  const currentDay = new Date().getDay();

  const currentHour = new Date().getHours();

  const currentMinute = new Date().getMinutes();

  const currentSecond = new Date().getSeconds();

  const currentTime = {
    hour: currentHour,
    minute: currentMinute,
    second: currentSecond,
  };

  const currentTimeInSeconds =
    currentHour * 3600 + currentMinute * 60 + currentSecond;

  const openTimeInSeconds =
    openTime.hour * 3600 + openTime.minute * 60 + openTime.second;

  const closeTimeInSeconds =
    closeTime.hour * 3600 + closeTime.minute * 60 + closeTime.second;

  let restaurantIsOpen = false;

  if (openDays.includes(currentDay)) {
    if (
      (currentTimeInSeconds >= openTimeInSeconds) &
      (currentTimeInSeconds <= closeTimeInSeconds)
    ) {
      restaurantIsOpen = true;
    }
  }

  // check restaurant status also
  if (restaurant.restaurantStatus === "offline") {
    restaurantIsOpen = false;
  }

  let restaurantStatus = "offline";

  if (restaurantIsOpen) {
    restaurantStatus = "online";
  }

  res.status(200).json({
    status: "success",
    data: {
      restaurantStatus: restaurantStatus,
    },
  });
});
