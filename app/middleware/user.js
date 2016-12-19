var User = require('../services/User');

module.exports = function(req, res, next) {
  if (req.user.id) {

    User.get({ id: req.user.id }, theUser => {
      if (theUser) { // Existing user found
        req.user = theUser;
        next();
      } else { // User not found in the DB. Create and return a new one
        User.create(req.user, newUser => {
          req.user = newUser;
          next();
        });
      }
    });

  } else {
    res.json({
      success: false,
      message: 'No user session found'
    });
  }
}
