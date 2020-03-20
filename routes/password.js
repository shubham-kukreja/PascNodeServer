const express = require("express");

const User = require("../models/user");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");

const {
    validateRecover,
    sendMail
} = require("../middleware/resetpasscontroller");

const router = express.Router();

// route for forget password

router.post("/recover", async(req, res) => {
    const valid = validateRecover(req.body);

    if (valid.error) {
        console.log("Body", valid);
        return res.status(400).send(valid.error.details[0].message);
    }
    try {
        user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).json({ message: "The email address does not exists" });

        //Generate and set password reset token
        user.generateResetPasswordToken();
        // console.log("token genereted");
        const link = "https://" + req.headers.host + "/resetpassword/reset/" + user.resetPasswordToken;

        // Save the updated user object
        const result = await user.save();
        const mailstatus = await sendMail(user, link);
        console.log("mailstatus", mailstatus);

        if (mailstatus.message)
            return res.status(500).json({ message: mailstatus.message });
        console.log("mail sent");
        return res
            .status(200)
            .json({
                message: "A reset email has been sent to " + `${result.email}` + "."
            });
    } catch (error) {
        return res.status(500).json(error);
    }
});


// use if not using the resetpasscontroller

/*
router.post('/recover',(req,res) => {
  const temp =  Joi.object({
    email: Joi.string().email().required()
  }).validate(req.body);
  if(temp.error) return res.status(400).send(temp.error.details[0].message);
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user)
        return res.status(401).json({
          message:
            "The email address " +
            req.body.email +
            " is not associated with any account. Double-check your email address and try again."
        });

      //Generate and set password reset token
      user.generateResetPasswordToken();
      // console.log("token genereted");

      // Save the updated user object
      user
        .save()
        .then(async user => {
          // send email
          
          let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
              user: sess.env.EMAIL,
              pass: process.env.EMAIL_PASSWORD 
            }
          });

          let link =
            "http://" +
            req.headers.host +
            "/resetpassword/reset/" +
            user.resetPasswordToken;

          const mailOptions = {
            from: process.env.EMAIL, // sender address
            to: user.email, // list of receivers
            subject: "Password change request", // Subject line
            text: `Hi ${user.displayName} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
            // html: "<b>Hello world?</b>" // html body
          };
          // send mail with defined transport object
          //   let info = await transporter.sendMail(mailOptions);

          // 
          
          transporter.sendMail(mailOptions, (error, result) => {
            
            if (error) return res.status(500).json({ message: error.message });
            console.log("mail sent");
            res.status(200).json({
              message:
                "A reset email has been sent to " +
                `${user.email}` +
                "."
            });
          });

          
        })
        .catch(err => res.status(500).json({ message: err.message }));
    })
    .catch(err => res.status(500).json({ message: err.message }));
})
*/


// route when link in email is opened
router.get("/reset/:token", (req, res) => {
    User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        })
        .then(user => {
            if (!user)
                return res
                    .status(401)
                    .json({ message: "Password reset token is invalid or has expired." });

            //Redirect user
            res.send(
                `send post request to https://localhost:3443/resetpassword/reset/${req.params.token} with body object 'password': 'New Password' `
            );
        })
        .catch(err => res.status(500).json({ message: err.message }));
});

// route to set password
router.post("/reset/:token", (req, res) => {
    var result = Joi.object({
        password: Joi.string().required()
    }).validate(req.body);

    if (result.error) {
        console.log("Body", result);
        res.status(400).send(result.error.details[0].message);
    }

    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    }).then(async user => {
        if (!user)
            return res
                .status(401)
                .json({ message: "Password reset token is invalid or has expired." });
        //Set the new password
        // const salt = await bcrypt.genSalt(10);
        user.password = bcrypt.hashSync(req.body.password);
        console.log("user password", user.password);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // Save
        user.save(err => {
            if (err) return res.status(500).json({ message: err.message });

            // send email
            const mailOptions = {
                to: user.email,
                from: process.env.MAIL_SENDER_EMAIL,
                subject: "Your password has been changed",
                text: `Hi ${user.displayName} \n 
              This is a confirmation that the password for your account ${user.email} has just been changed.\n`
            };

            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.MAIL_SENDER_EMAIL,
                    pass: process.env.MAIL_SENDER_EMAIL_PASSWORD
                }
            });
            transporter.sendMail(mailOptions, (error, result) => {
                if (error) return res.status(500).json({ message: error.message });

                res.status(200).json({ message: "Your password has been updated." });
            });
        });
    });
});

module.exports = router;