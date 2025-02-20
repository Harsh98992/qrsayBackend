const axios = require("axios");

const sendEmail = require("./email");
const { sub } = require("date-fns");
// const sendEmail = async (email, subject, text) => {

const sendSMSMessage = async (phoneNumber, otp) => {
    //   https://www.fast2sms.com/dev/bulkV2?authorization=XFuBnhTG3jszp4Dda71efbOEZwHrg5WYk0movRiK2LVSU9yCcllbip6VhYMBPfgQFJaGm2KuDt3zr5Uk&route=dlt&sender_id=QRSAYY&message=180398&variables_values=3233%7C&flash=0&numbers=07428449707&schedule_time=

    url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.SMS_API_KEY}&route=dlt&sender_id=QRSAYY&message=180398&variables_values=${otp}%7C&flash=0&numbers=${phoneNumber}`;

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
