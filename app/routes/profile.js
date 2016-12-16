const express = require('express');
const router = express.Router();
const getUser = require('../middleware/user');

router.get('/', getUser, (req, res) => {

  // FUTURE: Grab anything needed for display here e.g. list of Crunch suppliers, Monzo categories? etc

  res.render('profile', {
    user: req.user,
  });
});

module.exports = router;
