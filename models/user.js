var mongoose = require('mongoose');
var crypto = require('crypto');
var userSchema = new mongoose.Schema({
    googleid: String,
    username: String,
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    admin: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: String,
});

userSchema.methods.generateResetPasswordToken = function(){
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000 // 1 hour;
};


var user = mongoose.model('user', userSchema);


module.exports = user;