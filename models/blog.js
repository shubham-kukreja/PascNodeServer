const mongoose = require("mongoose");

const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const blogSchema = new mongoose.Schema({
  approve: {
    type: Boolean,
    default: false
  },
  author: {
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    author_name: String
  },
  category: String,
  content: String,
  date: Date,
  heading: String,
  image: String,
  thumb: String,
  subHeading: String
});

const Blog = mongoose.model("Blog", blogSchema);

const validateBlog = data => {
  const schema = Joi.object({
    author: Joi.object({
      author_id: Joi.objectId(),
      author_name: Joi.string()
    }),
    approve: Joi.boolean(),
    category: Joi.string(),
    content: Joi.string(),
    data: Joi.date(),
    heading: Joi.string(),
    image: Joi.string(),
    subHeading: Joi.string(),
    date: Joi.date(),
    thumb: Joi.string()
  });

  return schema.validate(data);
};

module.exports.Blog = Blog;
module.exports.validateBlog = validateBlog;
