const axios = require("axios");

const sendEmail = require("./email");
const { sub } = require("date-fns");
// const sendEmail = async (email, subject, text) => {

const sendSMSMessage = async (phoneNumber, otp) => {
    //  https://www.fast2sms.com/dev/bulkV2?authorization=&route=dlt&sender_id=QRSAYY&message=158830&variables_values=xyz%7C&flash=0&numbers=9923,23424

    url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.SMS_API_KEY}&route=dlt&sender_id=QRSAYY&message=158830&variables_values=${otp}%7C&flash=0&numbers=${phoneNumber}`;

    try {

        let subject = `OTP to ${phoneNumber} is ${otp}`;
        sendEmail(
            "chiraggogetter@gmail.com",
            subject,
            `Your OTP is ${otp} going to send sms with url ${url}`
        );

        const response = await axios.get(url);
        console.log(response.data);

        sendEmail(
            "chiraggogetter@gmail.com",
            subject,
            `Your OTP is ${otp} sent sms successfully with response ${response.data}`
        );
    } catch (err) {
        console.log(err);
    }
};

module.exports = sendSMSMessage;
