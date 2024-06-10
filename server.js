var HID = require("node-hid");
console.log("hellp");
var devices = HID.devicesAsync()
  .then((devices) => {
    console.log(devices);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    console.log("done");
  });
