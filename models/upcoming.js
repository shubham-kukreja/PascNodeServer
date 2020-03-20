var mongoose = require('mongoose');

var EventsSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

var events = mongoose.model('upcomingEvents', EventsSchema);

module.exports = events;