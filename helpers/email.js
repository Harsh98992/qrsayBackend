const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",

            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: subject,
            html: text,
        });
    } catch (error) {}
};
module.exports = sendEmail;
