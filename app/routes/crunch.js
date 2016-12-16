const express = require('express');
const router = express.Router();

const Crunch = require('../services/Crunch');

router.use('/login', (req, res) => {
  Crunch.getAuthURL().then(authURL => res.redirect(authURL));
})

router.get('/connect', (req, res) => {
  if (!req.query.code) {
    res.json({
      success: false,
      message: 'Missing authentication code'
    });
    return;
  }

  Crunch.getAccessToken(req.query.code).then(function(response){
    // if (response.access_token) {
    //   var auth0_id = req.user.auth0_id;
    //   User.update(
    //     { auth0_id },
    //     { $set: { crunch: response } },
    //     () => res.redirect('/')
    //   );
    // } else {
    //   res.json(response);
    // }
    res.json(response);
  });
});
module.exports = router;
