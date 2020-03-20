var mongoose = require('mongoose');
var tempUserSchema = new mongoose.Schema({
    username: String,
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    URL: String,
    admin: {
        type: Boolean,
        default: false
    },
});

var tempUser = mongoose.model('tempuser', tempUserSchema);

module.exports = tempUser;