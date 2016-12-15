const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');

router.get('/login', (req, res) => {
  if (req.user) {
    res.redirect('/');
    return;
  }

  res.render('login');
});

// Perform the final stage of authentication and redirect to '/dashboard'
router.get('/authenticate',
  passport.authenticate('auth0', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  }
);

// Get the user profile
router.get('/', ensureLoggedIn, function(req, res, next) {
  // res.render('dashboard', { user: req.user });
  res.json(req.user);
});

module.exports = router;
