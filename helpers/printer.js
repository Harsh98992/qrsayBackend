const usb = require('usb');

// List all connected USB devices
const devices = usb.getDeviceList();
console.log(devices,"devices")
devices.forEach((device) => {
  try {
    device.open();  // Open the device to retrieve detailed information
  } catch (error) {
    console.error('Error opening device:', error);
    return;
  }

  const deviceDescriptor = device.deviceDescriptor;
console.log(deviceDescriptor,"deviceDescriptor")  
  console.log(`Device: ${deviceDescriptor.iProduct}`);
  console.log(`Vendor ID: ${deviceDescriptor.idVendor}`);
  console.log(`Product ID: ${deviceDescriptor.idProduct}`);
  console.log(`Manufacturer: ${deviceDescriptor.iManufacturer}`);
  console.log(`Serial Number: ${deviceDescriptor.iSerialNumber}`);
  console.log(`Device Class: ${deviceDescriptor.bDeviceClass}`);
  console.log(`Device SubClass: ${deviceDescriptor.bDeviceSubClass}`);
  console.log(`Device Protocol: ${deviceDescriptor.bDeviceProtocol}`);
  console.log(`Max Packet Size: ${deviceDescriptor.bMaxPacketSize0}`);
  console.log('-----------------------------------------');

  device.close();  // Close the device after retrieving information
});
