const express = require('express');
const router = express.Router();

const User = require('../services/User');
const Crunch = require('../services/Crunch');

router.use('/login', (req, res) => {
  Crunch.getAuthURL(req).then(authURL => res.redirect(authURL));
})

router.get('/connect', (req, res) => {
  Crunch.getAccessToken(req)
    .then(authData => {
      console.log('SAVE TO DB: ', req.user.id,  authData);
      return User.set(req.user.id, { crunch: authData });
    })
    .then(() => res.redirect('/'))
    .catch(error => res.json(error));
});

router.get('/disconnect', (req, res) => {
  User.get({ id: req.user.id }, (user) => {
    User.unset(user.id, 'crunch')
      .then(() => res.redirect('/'))
      .catch(error => res.json(error));
  });
});

module.exports = router;
