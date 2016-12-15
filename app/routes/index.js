const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');
const userModel = require('../models/user');

// Login page
router.get('/login', (req, res) => {
  // Redirect if already logged in
  if (req.user) {
    res.redirect('/');
    return;
  }
  res.render('login');
});

// Complete authentication
router.get('/authenticate',
  passport.authenticate('auth0', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  }
);

// Get the user profile
router.get('/', ensureLoggedIn, function(req, res, next) {

  var userId = req.user.identities[0].user_id;
  var email = req.user.emails[0].value;

  userModel.getByUserId(userId, theUser => {
    if (theUser) { // Existing user found
      res.json(theUser);
    } else { // User not found in the DB. Create and return a new one
      userModel.create(userId, email, newUser => res.json(newUser));
    }
  });
});

module.exports = router;
