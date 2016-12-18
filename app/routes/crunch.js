const express = require('express');
const router = express.Router();

const Crunch = require('../services/Crunch');

router.use('/login', (req, res) => {
  Crunch.getAuthURL(req).then(authURL => res.redirect(authURL));
})

router.get('/connect', (req, res) => {

  if (!req.query.code) {
    res.json({
      success: false,
      message: 'Missing authentication code'
    });
    return;
  }

  Crunch.getAccessToken(req)
    .then(result => res.json(result))
    .catch((error, body) => res.json({ error, body }));
});
module.exports = router;
