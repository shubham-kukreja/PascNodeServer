const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  path: String,
  thumb: String,
  category: Number
});

const File = mongoose.model("File", fileSchema);

module.exports.File = File;
