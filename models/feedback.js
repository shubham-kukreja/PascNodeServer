const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }
});

var feedback = mongoose.model('feedback', feedbackSchema);
module.exports = feedback;