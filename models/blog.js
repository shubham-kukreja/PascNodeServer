const mongoose = require('mongoose');

const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const blogSchema = new mongoose.Schema({
    // user_id: mongoose.Types.ObjectId,
    approve: {
        type: Boolean,
        default: false
    },
    author: {
        author_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'    
        },
        author_name: String
    },
    category: String,
    content: String,
    date: Date,
    heading: String,
    // id: String,
    image: String,
    subHeading: String

});

const Blog = mongoose.model('Blog',blogSchema);


const validateBlog = (data) => {
    const schema = Joi.object( {
        // author: string,
        author: Joi.object({
            author_id: Joi.objectId(),
            author_name: Joi.string(),
        }),
        approve: Joi.boolean(),
        category: Joi.string(),
        content: Joi.string(),
        data: Joi.date(),
        heading: Joi.string(),
        // blog_id: Joi.objectId(),
        image: Joi.string(),
        subHeading: Joi.string(),
        date : Joi.date(),
        // email: Joi.string()
    });

    return schema.validate(data);
}

module.exports.Blog = Blog;
module.exports.validateBlog = validateBlog;