const otpGenerator = require("otp-generator");
function generateOtp() {
    const OTP = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });
    return OTP;
}

module.exports = generateOtp;
