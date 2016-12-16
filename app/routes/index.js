const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth = require('connect-ensure-login').ensureLoggedIn('/');

router.use('/profile', auth, require('./profile'));
router.use('/monzo', auth, require('./monzo'));
router.use('transactions', require('./transactions'));

// Login page
router.get('/',
  (req, res) => (req.user) ? res.redirect('/profile') : res.render('login')
);

// Complete authentication
router.get('/authenticate',
  passport.authenticate('auth0', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

module.exports = router;
