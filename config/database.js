var mongoose = require('mongoose');
var { options } = require('./config');
/*
// this is where the database url whill go 
// remember to put this in a separate file config.js
mongoose.connect(options.mongodb, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to local database"))
    .catch(e => console.error("Could not connect to mongodb", e));
*/

// Use for connecting to mongodb atlas. And make sure that you put the mongo atlas url in the .env file

mongoose
  .connect(
    options.mongodb,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    }
  )
  .then(() => console.log("Connected to mongo atlas database"))
  .catch(e => console.error("Could not connect to mongodb", e));
  