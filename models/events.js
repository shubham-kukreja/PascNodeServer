var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    activity: {
        type: String,
        required: true
    },
    attendees: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    speaker: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

var event = mongoose.model('event', EventSchema);

module.exports = event;