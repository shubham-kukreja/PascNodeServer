var nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail')

/*
var transporter = nodemailer.createTransport({
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
*/
verificationMail = function(receiver, verifyurl) {
    /*var mailOptions = {
        from: process.env.MAIL_SENDER_EMAIL,
        to: receiver,
        subject: 'Verification email',
        html: `<p>You Can verfiy your account by clicking on the <a href="${verifyurl}">Link</a>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent:' + info.response);
        }
    });*/
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: receiver,
        from: process.env.MAIL_SENDER_EMAIL,
        subject: 'Verification email',
        html: `<p>You Can verfiy your account by clicking on the <a href="${verifyurl}">Link</a>`,
    };
    sgMail.send(msg);
}


var options = {
    mongodb: process.env.MONGODB_URL,
    googleAuth: {
        id: process.env.GOOGLE_AUTH_CLIENT_ID,
        secret: process.env.GOOGLE_AUTH_SECRET,
    },
    recapcha: {
        secretKey: process.env.RECAPCHA_SECRET_KEY
    }
}

module.exports = {
    verificationMail,
    options
}