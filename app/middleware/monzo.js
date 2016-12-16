var monzo = require('../helpers/monzo');
var User = require('../models/user');

module.exports = function(req, res, next){

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

  monzo.getAccessToken(req.query.code, function(response){
    if (response.access_token) {
      var auth0_id = req.user.auth0_id;
      User.update(
        { auth0_id },
        { $set: { monzo: response } },
        (user) => {
          req.user = user;
          next();
        })
    } else {
      res.json(response);
    }
  });
}
