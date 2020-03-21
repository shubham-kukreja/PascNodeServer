const express = require("express");
// const mongoose = require('mongoose');
const { User } = require("../models/user");
const router = express.Router();
const { Blog, validateBlog } = require("../models/blog");
const { isAuthenticated, isAdmin } = require("../middleware/controller");

// getting approved blogs
router.get("/", async(req, res) => {
    try {
        const blogs = await Blog.find({ approve: true });
        console.log(blogs);
        res.send(blogs);
    } catch (error) {
        console.log(error);
        res.send("Error");
    }
});


// getting blog details by anyone
router.get("/blogdetails/:blogid", async(req, res) => {
    try {
        console.log(req.params.blogid);

        const blog = await Blog.findById(req.params.blogid);
        // const blog = await Blog.findOne({author_id: req.params.blogid});
        if (blog === null) {
            console.log("Blog with given id does not exists");
            res.status(404).send("Could not find the blog");
        } else {
            console.log(blog);
            res.send(blog);
        }
    } catch (error) {
        console.error(error);
        res.send("Could not found");
    }
});


// admin getting blogs for approving
router.get("/reviewblogs/", [isAuthenticated, isAdmin], async(req, res) => {
    try {
        const blogs = await Blog.find({ approve: false });
        console.log(blogs);
        res.send(blogs);
    } catch (error) {
        console.log(error);
        res.send("Error");
    }
});


// user posting new blog
router.post("/new/", async(req, res) => {
    const result = validateBlog(req.body);
    if (result.error) {
        console.log("Body", result);
        res.status(400).send(result.error.details[0].message);
    } else {
        try {
            const blog = new Blog(req.body);

            const temp = await blog.save();
            console.log("Added successfully", temp);
            res.send(temp);
        } catch (error) {
            console.error(error);
            res.send("Error saving");
        }
    }
});


// author updating the blog
router.put("/update/:id", isAuthenticated, async(req, res) => {
    const result = validateBlog(req.body);
    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(400).send("Blog does not exists");
    const author = blog.author.author_id;
    const user = await User.findById(author);
    if (!user) return res.send("No User Found");

    // id is user id in payload
    const id = req.payload.subject;

    if (id != author) return res.status(401).send("You are not allowed to update this blog");

    let temp = await blog.updateOne(req.body);
    temp = await blog.save();
    res.send(temp);
});


// admin approving the blog
router.put("/reviewblogs/approve/:id", isAdmin ,  async(req, res) => {
    const id = req.params.id;
    const selectedBlog = await Blog.findById(id);
    if (selectedBlog == null)
        return res.status(404).send("Blog with Id not found");
    if (selectedBlog.approve)
        return res.status(400).send("Blog is Already Approved");
    selectedBlog.approve = true;
    selectedBlog.save();
    res.send(selectedBlog);
});

// author deleting his blog
router.delete("/delete/:id", [isAuthenticated], async(req, res) => {
    try {
        console.log(req.params.id);

        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(400).send("Blog with given id does not exists");

        const author = blog.author.author_id;
        const user = await User.findById(author);
        if (!user) return res.status(400).send("Author of the blog not found");

        // id is user id in payload
        const id = req.payload.subject;

        if (id != author) return res.status(401).send("You are not allowed to update this blog");
        let temp = await blog.remove();
        console.log(temp);
        res.send("Blog deleted");

    } catch (error) {
        console.error(error);
        res.send("Error during deletion");
    }
});


// admin deleting the blog
router.delete("/admin/delete/:blogid", [isAuthenticated, isAdmin], async(req, res) => {
    try {
        console.log(req.params.blogid);

        const blog = await Blog.findByIdAndDelete(req.params.blogid);

        if (blog === null) {
            console.log("Blog with given id does not exists");
            res.status(404).send("Could not find the blog");
        } else {
            console.log(blog);
            res.send("blog deleted");
        }
    } catch (error) {
        console.error(error);
        res.send("Error during deletion");
    }
});



module.exports = router;