const nodemailer = require('nodemailer');
require("dotenv").config();
const { EMAIL_USERNAME, SECRET } = process.env;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: EMAIL_USERNAME,
        pass: SECRET
    }
});


exports.sendEmail = object => {

    const mailOptions = {
        from: `"Cyber Dev" <Remilekunelijah21997@gmail.com>`,
        to: object.email,
        subject: object.subject,
        html: `${object.body}`
    };


    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.log(err.message);
        else console.log("Email sent to:", info.messageId);
    });
};