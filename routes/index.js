var express = require('express');
var router = express.Router();


/* GET home page. */

//This is a waster route page
router.get('/', (req, res) => {
    res.send('Welcome to the node api');
});
router.get('/api/google', function(req, res) {
    res.json(req.user);
});

module.exports = router;