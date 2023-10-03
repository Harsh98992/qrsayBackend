const axios = require("axios");
const catchAsync = require("../helpers/catchAsync");



// Function to handle the place details request to Google Maps Places API
exports.placeDetails = catchAsync(async (req, res) => {
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    const { placeId } = req.query;
    const apiUrl = "https://maps.googleapis.com/maps/api/place/details/json";

    const response = await axios.get(apiUrl, {
        params: {
            key: API_KEY,
            place_id: placeId,
        },
    });

    // Forward the response from Google Maps API to the client
    res.json(response.data);
});

// Function to handle the autocomplete request to Google Maps Places API
exports.autocomplete = catchAsync(async (req, res) => {
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    const { input } = req.query;
    const apiUrl =
        "https://maps.googleapis.com/maps/api/place/autocomplete/json";

    const response = await axios.get(apiUrl, {
        params: {
            key: API_KEY,
            input: input,
        },
    });

    // Forward the response from Google Maps API to the client
    res.json(response.data);
});

exports.getGeocodeDetails = catchAsync(async (req, res) => {
    // let url = `${this.apiUrl}/v1/google-maps//geocode-details?latitude=${latitude}&longitude=${longitude}`; this is the frontend code
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    const { latitude, longitude } = req.query;

    console.log(latitude, longitude);
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;

    const response = await axios.get(apiUrl);

    // print the response from Google Maps API to the client and status code
    // res.json(response.data);

    console.log(response.data);
    console.log(response.status);


    // Forward the response from Google Maps API to the client
    res.json(response.data);
});


exports.placesJSLibrary = catchAsync(async (req, res) => {
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    const apiUrl = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;

    const response = await axios.get(apiUrl);

    // Forward the response from Google Maps API to the client
    res.json(response.data);
});
