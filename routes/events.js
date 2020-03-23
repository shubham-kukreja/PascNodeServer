var express = require("express");
var event = require("../models/events");

var router = express.Router();

router.get("/", (req, res) => {
  event
    .find({})
    .sort({ date: -1 })
    .then(events => {
      res.send(events);
    })
    .catch(err => {
      res.status(404).send("Not Found");
    });
});

router.post("/", (req, res) => {
  var newEvent = new event({
    activity: req.body.activity,
    attendees: req.body.attendees,
    date: req.body.date,
    details: req.body.details,
    speaker: req.body.speaker
  });
  newEvent
    .save()
    .then(item => {
      console.log("Item Has been saved");
      res.redirect("/api/events/");
    })
    .catch(err => {
      console.log(err);
      res.status(400).send("Unable to Perform the operation");
    });
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  event
    .findOneAndDelete({ _id: id })
    .then(upcoming => {
      res.send(upcoming);
      res.end();
    })
    .catch(e => {
      res.status(404).send("Not Found");
    });
});
module.exports = router;
