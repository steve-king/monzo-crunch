const express = require('express');
const router = express.Router();

const Monzo = require('../services/Monzo');
const getUser = require('../middleware/user');

router.get('/', getUser, (req, res) => {
  
  // If no monzo_access_token, get monzo auth url
  if (!req.user.monzo || !req.user.monzo.access_token) {
    req.monzoAuthURL = Monzo.getAuthURL(req);
  }

  // If no crunch_access_token, get crunch auth url
  // FUTURE: Grab anything else needed for dashboard e.g. list of Crunch suppliers, Monzo categories? etc

  res.render('dashboard', {
    user: req.user,
    monzoAuthURL: req.monzoAuthURL
  });
});

module.exports = router;
