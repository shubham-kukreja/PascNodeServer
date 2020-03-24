const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const projectSchema = new mongoose.Schema({
  // user_id: mongoose.Types.ObjectId,
  approve: Boolean,
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
  // id: String,
  image: String,
  subHeading: String,
  link: String
});

const Project = mongoose.model("Project", projectSchema);

const validateProject = data => {
  const schema = Joi.object({
    author: Joi.object({
      author_id: Joi.objectId(),
      author_name: Joi.string()
    }),
    link: Joi.string(),
    approve: Joi.boolean(),
    category: Joi.string(),
    content: Joi.string(),
    date: Joi.date(),
    heading: Joi.string(),
    image: Joi.string(),
    subheading: Joi.string()
  });

  return schema.validate(data);
};

module.exports.Project = Project;
module.exports.validateProject = validateProject;
