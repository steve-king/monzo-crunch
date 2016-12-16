const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');
const getUser = require('./middleware/user');
const getDashboard = require('./middleware/dashboard');
const processTransactions = require('./middleware/transactions');
const authMonzo = require('./middleware/monzo');

// Login page
router.get('/login',
  (req, res) => (req.user) ? res.redirect('/') : res.render('login')
);

// Complete authentication
router.get('/authenticate',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/authenticate-monzo',
  // ensureLoggedIn,
  // getUser,
  authMonzo,
  (req, res) => res.redirect('/')
);

// Get the user profile
router.get('/',
  ensureLoggedIn,
  getUser,
  getDashboard,
  (req, res) => {
    // console.log(req.user);
    res.render('dashboard', {
      user: req.user,
      monzoAuthURL: req.monzoAuthURL
    });
  }
);

router.post('/transactions',
  processTransactions,
  (req, res) => res.json({ success: true })
);

module.exports = router;
