const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');
const getUser = require('./middleware/user');

// Login page
router.get('/login',
  (req, res) => (req.user) ? res.redirect('/') : res.render('login')
);

// Complete authentication
router.get('/authenticate',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/')
);

// Get the user profile
router.get('/',
  ensureLoggedIn,
  getUser,
  (req, res) => res.render('dashboard', { user: req.user })
);

module.exports = router;
