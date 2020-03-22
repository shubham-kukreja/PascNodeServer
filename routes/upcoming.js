var express = require('express');
var upcomingEvents = require('../models/upcoming');

var router = express.Router();

router.get('/', (req, res) => {
    upcomingEvents.find({})
        .then((upcomings) => {
            res.send(upcomings);
            res.end();
        })
        .catch(err => {
            res.status(404).send('Not Found');
            res.end();
        })
});

router.get('/eventsd/:id', (req,res)=> {
    upcomingEvents.findById(req.params.id)
    .then((upcoming)=> {
        res.send(upcoming)
        res.end()
    })
    .catch((e)=> {
        res.status(404).send('Not Found')
        res.end()
    })
})

router.post('/', (req, res) => {
    var newUpcoming = new upcomingEvents({
        date: req.body.date,
        description: req.body.description,
        topic: req.body.topic
    });
    newUpcoming.save()
        .then(item => {
            console.log('Item Has been saved');
            res.redirect('/api/upcoming');
        })
        .catch(err => {
            console.log(err);
            res.status(400).send('Unable to Perform the operation')
        });
})

router.delete('/:id', (req, res) => {
    const id = req.params.id;
    console.log(id)
    upcomingEvents.findOneAndDelete({ _id: id }, err => {
        if (err) {
            res.status(401).send('Unauthorized');
        } else {
            res.redirect('/api/upcoming');
        }
    })
});


module.exports = router;