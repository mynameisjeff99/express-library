var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/cool/:userID', (req, res, next) => {
  res.send(req.params.userID);
})

router.get('/cool', (req, res, next) => {
  res.render('cool', {adj: 'Cool'});
})

module.exports = router;
