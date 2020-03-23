const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    subject: {
        type: String
  
    },
    text: {
        type: String
      
    }
});

var feedback = mongoose.model('feedback', feedbackSchema);
module.exports = feedback;