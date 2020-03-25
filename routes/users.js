var express = require("express");
var passport = require("passport");
var GoogleAuth = require("../strategy/googleauth");
var user = require("../models/user");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const sgMail = require('@sendgrid/mail')

var {
    isAuthenticated,
    isAdmin,
    handleRecaptcha
} = require("../middleware/controller");
var TempUser = require("../models/tempuser");
var { verificationMail } = require("../config/config");
var crypto = require("crypto");

var router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//GOOGLE OAUTH
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile email"] }),
    (req, res) => {
        res.send({ res2: "Login Succesfull" });
    }
);

//GOOGLE REDIRECT LINK
router.get("/google/callback", passport.authenticate("google"), (req, res) => {
    const user = req.user;
    var payload = {
        subject: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        errgol: true
    };
    var token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    // res.cookie("jwt", token, { maxAge: 3600000 });
    return res.redirect(
        `https://pict.acm.org/#/75u6sD1nDLadfb16P8VG0qYGxZXjNp8UuAkEcF2OeJ7XE1SU14h5ey7FdmDhsyLYYWdPe52oXmSbnFzYeuXu0CnT9ajwuCgyVYMipjhyEvAfzeXoRNp61p8XMLU4PGFjoRGxxhqX4SxpIio7gPb03CuLxStM2X3HGQ8wVtGYDeBZtsvEwRzhn0FI1vwleS5Z3ZjUBF26/${token}`
    );
});

//LOGIN OUT THE USER WITH OAUTH
router.get("/google/logout", (req, res) => {
    req.logout();
});

// SIGNING UP USER

router.post("/authgoogle", async(req, res) => {
    try {
        const googleUser = await user.findById(req.body.id);
        if (googleUser.googleid) {
            res.json({ logged: true });
        } else {
            res.json({ logged: false });
        }
    } catch (e) {
        res.json({ error: true });
    }
});

router.post("/signup", handleRecaptcha, (req, res) => {
    user
        .findOne({ email: req.body.email })
        .then(existingUser => {
            if (existingUser) {
                return res.json({ error: "User already exists ", token: null });
            }
            return TempUser.findOne({ email: req.body.email });
        })
        .then(newUser => {
            if (newUser) {
                return res.json({ error: "User already exists ", token: null });
            } else {
                var url;
                crypto.randomBytes(48, (err, buf) => {
                    if (err) console.log(err);
                    url = buf.toString("hex");

                    const hashedPassword = bcrypt.hashSync(req.body.password);
                    var newTempUser = new TempUser({
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        password: hashedPassword,

                        admin: false,
                        URL: url
                    });
                    console.log("The User has been saved to the temporary storage");
                    const verifyurl =
                        "https://" + req.headers.host + "/auth/verify/" + url;
                    verificationMail(newTempUser.email, verifyurl);
                    newTempUser.save()
                    return res.json({
                        user: {
                            firstname: newTempUser.firstname,
                            lastname: newTempUser.lastname,
                            email: newTempUser.email
                        },
                        status: "The user has been saved"
                    });
                });
            }
        })
        .catch(err => {
            throw new Error(err);
        });
});

router.get("/verify/:url", (req, res) => {
    const url = req.params.url;
    TempUser.findOne({ URL: url }).then(tempuser => {
        if (!tempuser) {
            return res.json("No Such User found");
        } else {
            //THIS USER NEEDS TO BE DELETED FROM TEMP USER AND
            //STORED IN USER MODEL
            var verifiedUser = new user({
                email: tempuser.email,
                password: tempuser.password,
                username: tempuser.username,
                firstname: tempuser.firstname,
                lastname: tempuser.lastname,
                admin: false
            });
            verifiedUser.save();
            res.json({ user: tempuser.email, status: "Email has ben verified" });
            TempUser.findByIdAndDelete(tempuser._id);
            return res.redirect('https://pict.acm.org/#/login')
        }
    });
});

// FOR LOGGING THE USER INTO THE APP
router.post("/login", async(req, res) => {
    user.findOne({ email: req.body.email }).then(async user => {
        if (!user) {
            return res.json({
                error: " Verify Email Address or Incorrect Email Address ",
                token: null
            });
        }
        const condition = await bcrypt.compare(req.body.password, user.password);
        if (!condition) {
            return res.json({ error: "Incorrect Email Or Password ", token: null });
        } else {
            console.log(user);
            var payload = {
                subject: user._id,
                firstname: user.firstname,
                lastname: user.lastname
            };

            var token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
            res.json({
                error: false,
                token,
                user: {
                    admin: user.admin,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    _id: user._id
                }
            });
        }
    });
});

//FOR CHECKING WHETHER ADMIN OR NOT This is a waste
router.get("/islogin", isAuthenticated, (req, res) => {
    console.log("You are authenticated");
    res.json({ error: false, login: true });
});

//FOR CHECKING WHETHER ADMIN OR NOT This is a waste
router.get("/admin", [isAuthenticated, isAdmin], (req, res) => {
    console.log("You are admin");
    res.json({ error: false, admin: true });
});

module.exports = router;