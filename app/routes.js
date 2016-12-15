const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/');

router.get('/', (req, res) => {
  res.render('login');
});

// Perform the final stage of authentication and redirect to '/dashboard'
router.get('/authenticate',
  passport.authenticate('auth0', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/dashboard');
  }
);

// Get the user profile
router.get('/dashboard', ensureLoggedIn, function(req, res, next) {
  // res.render('dashboard', { user: req.user });
  res.json(req.user);
});

module.exports = router;
