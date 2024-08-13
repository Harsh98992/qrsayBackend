const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {

    if (email) {
      const transporter = nodemailer.createTransport({
        host: "smtpout.secureserver.net",
        port: 465, // Use port 465 for secure connections (SSL/TLS)
        secure: true,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      
      await transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: `${email},qrsayteam@gmail.com`,
        subject: subject,
        html: text,
      });
    
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = sendEmail;
