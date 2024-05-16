const catchAsync = require("../helpers/catchAsync");
var Razorpay = require("razorpay");
const AppError = require("../helpers/appError");

exports.createRazorPayOrder = catchAsync(async (req, res, next) => {
    const instance = new Razorpay({
        key_id: process.env["razorpay_key_id"],
        key_secret: process.env["razorpay_key_secret"],
    });
    const amount = parseInt(req.body.amount) * 100;
    
    const options = {
        amount: amount,
        currency: "INR",
        transfers: [
            {
                account: req.paymentData.restaurantAccountId,
                amount: Math.round(amount * 0.9764),
                currency: "INR",
                // notes: {
                //     // branch: "Acme Corp Bangalore North",
                //     // name: "Gaurav Kumar",
                // },
                // linked_account_notes: ["branch"],
                // on_hold: 1,
                // on_hold_until: 1671222870,
            },
        ],
    };
    instance.orders.create(options, (err, order) => {
        if (err) {
            console.log(err);
            return next(new AppError("Payment gateway not working currently!"));
        }
        if (order) {
            res.json({
                success: true,
                status: "Order created Successfully",
                value: order,
                key: "",
            });
        }
    });
});
