const { format, isSameDay } = require('date-fns');

// Initialize a variable to store the last order date
let lastOrderDate = null;
let orderCount = 0;

// Function to generate the order ID
function generateOrderID() {
  const now = new Date();

  // Check if the date is the same as the last order date
  if (!lastOrderDate || !isSameDay(now, lastOrderDate)) {
    // Reset the order count for the new day
    orderCount = 0;
    lastOrderDate = now;
  }

  // Get date and time components
  const date = format(now, 'yyyyMMdd');
  const time = format(now, 'HHmmss');

  // Increment the order count for the day
  orderCount++;

  // Create the order ID
  const orderID = `${date}${orderCount.toString().padStart(4, '0')}`;
  return orderID;
}

// Example: Generate order IDs for the day
module.exports=generateOrderID