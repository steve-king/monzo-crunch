const express = require('express');
const router = express.Router();

const Monzo = require('../services/Monzo');
const User = require('../services/User');

router.use('/login', (req, res) => {
  res.redirect(Monzo.getAuthURL(req));
});

router.get('/connect', (req, res) => {
  var error = null;

  if (!req.query.code) {
    error = { success: false, message: 'Missing auth code' };
  }

  if (req.query.state !== req.session.oAuthStateSecret) {
    error = { success: false, message: 'oAuth2.0 state token mismatch' };
  }

  if (error) {
    res.json(error);
  } else {
    Monzo.getAccessToken(req.query.code)
      .then((data) => User.set(req.user.id, { monzo: data }))
      .then((user) => Monzo.getAccounts(user.monzo.access_token))
      .then((accounts) => User.set(req.user.id, { 'monzo.accounts': accounts }))
      .then(() => res.redirect('/'))
      .catch((error) => res.json({ error: error }));
  }
});

router.get('/disconnect', (req, res) => {
  User
    .unset(req.user.id, 'monzo')
    .then(() => res.redirect('/'));
});

module.exports = router;
