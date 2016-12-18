const express = require('express');
const router = express.Router();

const Monzo = require('../services/Monzo');
const User = require('../services/User');

router.use('/login', (req, res) => {
  res.redirect(Monzo.getAuthURL(req));
});

router.get('/connect', (req, res) => {
  Monzo.getAccessToken(req)
    .then((data) => User.set(req.user.id, { monzo: data }))
    .then((user) => Monzo.getAccounts(user.monzo.access_token))
    .then((accounts) => User.set(req.user.id, { 'monzo.accounts': accounts }))
    .then((user) => Monzo.registerWebhook(user.monzo.access_token, user.monzo.accounts[0].id))
    .then(() => res.redirect('/'))
    .catch((error) => res.json({ error: error }));
});

router.get('/disconnect', (req, res) => {
  User.get({ id: req.user.id }, (user) => {
    Monzo.listWebhooks(user.monzo.access_token, user.monzo.accounts[0].id)
      .then(webhooks => {
        if (webhooks.length > 0) {
          var deleted = webhooks.map((webhook) => {
            return Monzo.deleteWebhook(webhook.id);
          });
          return Promise.all(deleted);
        } else {
          return;
        }
      })
      .then(User.unset(user.id, 'monzo'))
      .then(() => res.redirect('/'));
  });
});

module.exports = router;
