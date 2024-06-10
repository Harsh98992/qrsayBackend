var HID = require("node-hid");
var devices = HID.devicesAsync()
  .then((devices) => {
    console.log(devices);
  })
  .catch((err) => {
    console.log(err);
  });
