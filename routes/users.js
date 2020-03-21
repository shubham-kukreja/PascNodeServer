var express = require('express');
var passport = require('passport');
var GoogleAuth = require('../strategy/googleauth');
var user = require('../models/user');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var { isAuthenticated, isAdmin, handleRecaptcha } = require('../middleware/controller');
var TempUser = require('../models/tempuser');
var { verificationMail } = require('../config/config');
var crypto = require('crypto');


var router = express.Router();


//GOOGLE OAUTH  
router.get('/google', passport.authenticate('google', { scope: ['profile email'] }), (req, res) => {
    res.json('Google Login Successfull !! ');
});

//GOOGLE REDIRECT LINK
router.get('/google/callback', passport.authenticate('google'), (req, res) => {
    const user=req.user
    var payload = { subject: user._id , firstname:user.firstname 
        , lastname:user.lastname , admin:user.admin};
    var token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    res.json({
        token: token,
        userData: {
            email: req.user.email,
            firstname: req.user.firstname,
            lastname: req.user.lastname
        }
    });
})


//LOGIN OUT THE USER WITH OAUTH 
router.get('/google/logout', (req, res) => {
    req.logout();
    res.send('Logged Out');
});

// SIGNING UP USER

router.post('/signup' , handleRecaptcha , (req, res) => {
    user.findOne({ email: req.body.email })
        .then(existingUser => {
            if (existingUser) {
                return  res.json({ 'error': 'User already exists ', 'token': null });

            }
            return TempUser.findOne({ email: req.body.email })
        })
        .then(newUser => {
            if (newUser) {
                return res.json({ 'error': 'User already exists ', 'token': null });
            } else {
                var url;
                crypto.randomBytes(48, (err, buf) => {
                    if (err) console.log(err);
                    url = buf.toString('hex');
         
                    const hashedPassword = bcrypt.hashSync(req.body.password);
                    var newTempUser = new TempUser({
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        password: hashedPassword,
    
                        admin: false,
                        URL: url
                    });
                    console.log('The User has been saved to the temporary storage');
                    const verifyurl = "https://" + req.headers.host + '/auth/verify/' + url;
                    verificationMail(newTempUser.email, verifyurl);
                    newTempUser.save().then( uuser => console.log(uuser) );
                    return res.json({ 'user': { 'firstname': newTempUser.firstname, 'lastname': newTempUser.lastname, 'email': newTempUser.email }, 'status': 'The user has been saved' });
                });
            }
        })
        .catch(err => {throw new Error(err)})
});


// router.post('/signup' /*, handleRecaptcha*/ , (req, res) => {
//     user.findOne({ email: req.body.email })
//         .then(existingUser => {
//             if (existingUser) {
//                 return existingUser
//             }
//             return TempUser.findOne({ email: req.body.email })
//         })
//         .then(newUser => {
//             if (newUser) {
//                 res.json({ 'error': 'User already exists please verify you account', 'token': null });
//             } else {
//                 var url;
//                 crypto.randomBytes(48, (err, buf) => {
//                     if (err) console.log(err);
//                     url = buf.toString('hex');
//                     const hashedPassword = bcrypt.hashSync(req.body.password);
//                     var newTempUser = new TempUser({
//                         email: req.body.email,
//                         password: hashedPassword,
//                         firstname: req.body.firstname,
//                         lastname: req.body.lastname,
//                         admin: false,
//                         URL: url
//                     });
//                     console.log('The User has been saved to the temporary storage');
//                     const verifyurl = "https://" + req.headers.host + '/auth/verify/' + url;
//                     verificationMail(newTempUser.email, verifyurl);
//                     newTempUser.save();
//                     return res.json({ 'user': { 'firstname': newTempUser.firstname, 'lastname': newTempUser.lastname, 'email': newTempUser.email }, 'status': 'The user has been saved' });
//                 });
//             }
//         })
//         .catch(err => console.log(err))
// });


router.get('/verify/:url', (req, res) => {
    const url = req.params.url;
    TempUser.findOne({ URL: url })
        .then(tempuser => {
            if (!tempuser) {
                return res.json('No Such User found')
            } else {
                //THIS USER NEEDS TO BE DELETED FROM TEMP USER AND 
                //STORED IN USER MODEL
                var verifiedUser = new user({
                    email: tempuser.email,
                    password: tempuser.password,
                    username: tempuser.username,
                    firstname: tempuser.firstname,
                    lastname: tempuser.lastname,
                    admin: false,
                });
                verifiedUser.save();
                console.log('User has been verified');
                res.json({ 'user': tempuser.email, 'status': 'Email has ben verified' });
                return TempUser.findByIdAndDelete(tempuser._id);
            }
        })

});


// FOR LOGGING THE USER INTO THE APP
router.post('/login', async(req, res) => {
  user.findOne({ email: req.body.email })
        .then(async(user) => {
            if (!user) {
                return res.json({ error: ' Verify Email Address or Incorrect Email Address ' , token: null });
            }
            const condition = await bcrypt.compare(req.body.password, user.password);
            if (!condition) {
                return res.json({ error: 'Incorrect Email Or Password ', token: null });
            } else {
                console.log(user)
                var payload = { subject: user._id , firstname:user.firstname 
                    , lastname:user.lastname , admin:user.admin};
                
                var token = jwt.sign( payload, process.env.JWT_SECRET_KEY  );

                console.log(token)
                res.json({ error : false,  token, user });
            }
        })
});


//FOR CHECKING WHETHER ADMIN OR NOT This is a waste
router.get('/profile', isAuthenticated , (req, res) => {
    console.log('You are authenticated');
    console.log(req.user1);
    res.json({ 'error': false , 'token': req.token , user : req.user1});
})

//FOR CHECKING WHETHER ADMIN OR NOT This is a waste
router.get('/admin', isAdmin , (req, res) => {
    console.log('You are authenticated');
    console.log(req.user1);
    res.json({ 'error': false , 'admin':true ,'token': req.token , 'user' : req.user1});
})



module.exports = router;