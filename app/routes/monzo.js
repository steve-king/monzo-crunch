const express = require('express');
const router = express.Router();

const Monzo = require('../services/Monzo');
const User = require('../services/User');

router.get('/connect', (req, res) => {
  if (!req.query.code) {
    res.json({
      success: false,
      message: 'Missing authentication code'
    });
    return;
  }

  if (req.query.state !== req.session.oAuthStateToken) {
    res.json({
      success: false,
      message: 'oAuth2.0 state token mismatch'
    });
    return;
  }

  Monzo.getAccessToken(req.query.code, function(response){
    if (response.access_token) {
      var auth0_id = req.user.auth0_id;
      User.update(
        { auth0_id },
        { $set: { monzo: response } },
        () => res.redirect('/')
      );
    } else {
      res.json(response);
    }
  });
});

router.get('/disconnect', (req, res) => {
  var auth0_id = req.user.auth0_id;
  User.update(
    { auth0_id },
    { $unset: { monzo: 1 } },
    () => res.redirect('/')
  );
});

module.exports = router;
