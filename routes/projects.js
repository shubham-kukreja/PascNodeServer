const express = require("express");
const { User } = require("../models/user");
const router = express.Router();
// const { Blog, validateBlog } = require("../models/blog");
const { Project, validateProject } = require('../models/projects');
const { isAuthenticated, isAdmin } = require("../middleware/controller");

// getting approved projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({approve: true});
    console.log(projects);
    res.send(projects);
  } catch (error) {
    console.log(error);
    res.send("Error");
  }
});


// getting project details by anyone
router.get("/projectdetails/:id", isAuthenticated, async (req, res) => {
  try {
    console.log(req.params.id);

    const project = await Project.findById(req.params.id);
    // const blog = await Blog.findOne({author_id: req.params.blogid});
    if (project === null) {
      console.log("Project with given id does not exists");
      res.status(404).send("Could not find the project");
    } else {
      console.log(peoject);
      res.send(project);
    }
  } catch (error) {
    console.error(error);
    res.send("Could not found");
  }
});


// admin getting projects for approving
router.get("/reviewprojects/",[isAuthenticated,isAdmin], async (req, res) => {
  try {
    const projects = await Projects.find({ approve: false });
    console.log(projects);
    res.send(projects);
  } catch (error) {
    console.log(error);
    res.send("Error");
  }
});


// user posting new project
router.post("/new/", isAuthenticated, async (req, res) => {
  const result = validateProject(req.body);
  if (result.error) {
    console.log("Body", result);
    res.status(400).send(result.error.details[0].message);
  } else {
    try {
      req.body.approve = false;
      const project = new Projects(req.body);

      const temp = await project.save();
      console.log("Added successfully", temp);
      res.send(temp);
    } catch (error) {
      console.error(error);
      res.send("Error saving");
    }
  }
});


// author updating the project
router.put("/update/:id", isAuthenticated, async (req, res) => {
  const result = validateProject(req.body);
  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }
  
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(400).send("Project does not exists");
  const author = project.author.author_id;
  const user = await User.findById(author);
  if (!user) return res.send("No User Found");
  
  // id is user id in payload
  const id = req.payload.id;
  
  if (id != author) return res.status(401).send("You are not allowed to update this project");

  let temp = await project.updateOne(req.body);
  temp = await project.save();
  res.send(temp);
});


// admin approving the projects
router.put("/reviewprojects/approve/:id", [isAuthenticated, isAdmin], async (req, res) => {
  const id = req.params.id;
  const selectedProject = await Project.findById(id);
  if (selectedProject == null)
    return res.status(404).send("project with Id not found");
  if (selectedProject.approve)
    return res.status(400).send("Project is Already Approved");
  selectedProject.approve = true;
  selectedProject.save();
  res.send(selectedProject);
});

// author deleting his project
router.delete("/delete/:id",[isAuthenticated], async (req, res) => {
  try {
    console.log(req.params.id);

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(400).send("project with given id does not exists");
    
    const author = project.author.author_id;
    const user = await User.findById(author);
    if (!user) return res.status(400).send("Author of the project not found");
  
  // id is user id in payload
    const id = req.payload.id;

    if (id != author) return res.status(401).send("You are not allowed to update this project");
    let temp = await project.remove();
    console.log(temp);
    res.send("project deleted");

  } catch (error) {
    console.error(error);
    res.send("Error during deletion");
  }
});


// admin deleting the project
router.delete("/admin/delete/:id",[isAuthenticated,isAdmin], async (req, res) => {
  try {
    console.log(req.params.id);

    const project = await Project.findByIdAndDelete(req.params.id);

    if (project === null) {
      console.log("project with given id does not exists");
      res.status(404).send("Could not find the project");
    } else {
      console.log(project);
      res.send("project deleted");
    }
  } catch (error) {
    console.error(error);
    res.send("Error during deletion");
  }
});



module.exports = router;
