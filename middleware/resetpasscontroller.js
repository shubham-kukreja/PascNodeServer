const User = require("../models/user");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");
// ===PASSWORD RECOVER AND RESET

function validateRecover(data) {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
    });
    return schema.validate(data);
}

async function sendResetMail(user, link) {
    console.log(process.env.MAIL_SENDER_EMAIL, process.env.MAIL_SENDER_PASSWORD);
    let transporter = nodemailer.createTransport({
        service: "gmail",
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_SENDER_EMAIL,
            pass: process.env.MAIL_SENDER_EMAIL_PASSWORD
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
    const mailOptions = {
        from: process.env.MAIL_SENDER_EMAIL, // sender address
        to: user.email, // list of receivers
        subject: "Password change request", // Subject line
        html: `Hi ${user.firstname} \n 
                        Please click on the following <a href=${link}>Link</a> to reset your password. \n\n 
                       If you did not request this, please ignore this email and your password will remain unchanged.\n`
            // html: "<b>Hello world?</b>" // html body
    };

    //   let info = await transporter.sendMail(mailOptions);
    try {
        const promise = await transporter.sendMail(mailOptions);
        // const promise = Promise.reject({msg : "Venugopal"});
        console.log("sending mail", promise);
        return promise;
    } catch (error) {
        console.log("sending mail error", error);
        return error;
    }
}

module.exports = {
    sendResetMail
};
module.exports.validateRecover = validateRecover;