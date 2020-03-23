var jwt = require('jsonwebtoken');
var user = require('../models/user');

var fetch = require('isomorphic-fetch');
var { options } = require('../config/config');


isAuthenticated = async function (req, res, next) {
    if (!req.headers.authorization) {
        return res.json({ error: true , token: null })
    }
  
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.json({ error: true , token: null })
    }
    var payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!payload) {
        return res.json({ error: true , token: null })
    }

    console.log(payload.subject)
    const user1 = await user.findById(payload.subject)


    if (!user1) {
        throw new Error({ error: true, token: null })
    }

    req.user1 = {
        firstname: user1.firstname, lastname: user1.lastname,
        email: user1.email, admin: user1.admin
    }
    req.token = token


    next();
}

isAdmin = async function (req, res, next) {
    if (!req.headers.authorization) {

        return res.json({ error: 'Header does not  exists', token: null })
    }
    const token = req.headers.authorization.split(' ')[1];
    
    if (!token) {
        console.log("admin2");

        return res.json({ error: 'Token Not available', token: null })
    }
    
    var payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!payload) {
        console.log("admin3")

        return res.json({ error: 'Incorrect Token', token: null })
    }

    req.payload = payload;
    user.findById(req.payload.subject)
        .then((user1) => {
            if (user1 && user1.admin) {
                req.user1 = {
                    firstname: user1.firstname, lastname: user1.lastname,
                    email: user1.email, admin: user1.admin
                }
                req.token = token
                
                console.log("admin")
                next();
            } else {
                res.json({ error: 'You are not an Admin' })
            }
        })
}

handleRecaptcha = function (req, res, next) {
    const captchaSecret = options.recapcha.secretKey;
    const token = req.body.captcha;

    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecret}&response=${token}`;


    fetch(url, { method: 'post' })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                return res.json({ 'success': false, 'error': 'Recaptcha has failed' })
            } else {
                next();
            }
        })
        .catch(error => res.json({ 'success': false, 'error': 'Recaptcha has failed' }))
}


module.exports = {
    isAuthenticated,
    isAdmin,
    handleRecaptcha
}