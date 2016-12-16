var User = require('../models/user');

module.exports = function(req, res, next) {

  var userSession = req.session.passport.user;
  if (userSession) {

    var userId = userSession.identities[0].user_id;
    var email = userSession.emails[0].value;

    User.getByUserId(userId, theUser => {
      if (theUser) { // Existing user found
        req.user = theUser;
        next();
      } else { // User not found in the DB. Create and return a new one
        userModel.create(userId, email, newUser => {
          req.user = newUser;
          next();
        });
      }
    });

  } else {
    next();
  }
}
