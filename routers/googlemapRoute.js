const express = require("express");
const router = express.Router();

const googleMapController = require("../controllers/googleMapController");

// Define routes for Google Maps API requests
router.get("/autocomplete", googleMapController.autocomplete);

router.get("/place-details", googleMapController.placeDetails);

router.get("/geocode-details", googleMapController.getGeocodeDetails);

router.get("/places-js-library", googleMapController.placesJSLibrary);

// url will be http://localhost:3000/api/v1/google-maps/place-js-library

module.exports = router;
