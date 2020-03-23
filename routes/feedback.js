const express = require("express");
var {
  isAuthenticated,
  isAdmin,
  handleRecaptcha
} = require("../middleware/controller");

const router = express.Router();
const feedback = require("../models/feedback");

router.get("/", async (req, res, next) => {
  res.send("You are on home page");
});

router.get("/feedback", async (req, res, next) => {
  feedback
    .find({})
    .then(feedbacks => {
      res.json(feedbacks);
    })
    .catch(err => {
      res.status(404).send(err);
    });
});

// post request using the form in the aboutus component
router.post("/aboutus", handleRecaptcha, async (req, res, next) => {
  feedback
    .create(req.body)
    .then(feed => {
      res.send(feed);
    })
    .catch(err => {
      const { name, email, subject, text } = req.body;
      if (!name || !email || !subject || !text) {
        res.send("All the fields are compulsory to fill in!");
      } else res.send("Error");
    });
});

// delete the feedback when you click the feedback
router.delete("/feedback/:id", async (req, res, next) => {
  feedback
    .findByIdAndDelete({ _id: req.params.id })
    .then((err, feed) => {
      res.send(feed);
    })
    .catch(err => {
      res.send("Error");
    });
});

module.exports = router;
