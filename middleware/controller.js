var jwt = require('jsonwebtoken');
var user = require('../models/user');

var fetch = require('isomorphic-fetch');
var { options } = require('../config/config');


isAuthenticated = function(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(404).json({ error: 'Header does not  exists', token: null })
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(404).json({ error: 'Token Not available', token: null })
    }
    var payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!payload) {
        return res.status(404).json({ error: 'Incorrect Token', token: null })
    }

    req.payload = payload;
    console.log(req.payload, payload);

    next();
}

isAdmin = function(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(404).json({ error: 'Header does not  exists', token: null })
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(404).json({ error: 'Token Not available', token: null })
    }
    var payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!payload) {
        return res.status(404).json({ error: 'Incorrect Token', token: null })
    }

    req.payload = payload;
    user.findById(req.payload.subject)
        .then((user1) => {
            if (user1 && user1.admin) {
                next();
            } else {
                res.json({ error: 'You are not an Admin' })
            }
        })
}

handleRecaptcha = function(req, res, next) {
    const captchaSecret = options.recapcha.secretKey;
    const token = req.body.captcha;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecret}&response=${token}`;


    fetch(url, { method: 'post' })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                res.json({ 'success': false, 'msg': 'Recaptcha has failed' })
            } else {
                next();
            }
        })
        .catch(error => res.json({ 'success': false, 'msg': 'Recaptcha has failed' }))
}


module.exports = {
    isAuthenticated,
    isAdmin,
    handleRecaptcha
}