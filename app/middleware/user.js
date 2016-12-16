var User = require('../models/user');

module.exports = function(req, res, next) {

  var userSession = req.session.passport.user;
  if (userSession) {

    var userQuery = {
      auth0_id: userSession.auth0_id,
      email: userSession.email
    };

    User.get(userQuery, theUser => {
      if (theUser) { // Existing user found
        req.user = theUser;
        next();
      } else { // User not found in the DB. Create and return a new one
        User.create(userQuery, newUser => {
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


// DEV ONLY
// module.exports = function(req, res, next) {
//
//   var userId = '1';
//   var email = 'steve.king5891@gmail.com';
//
//   User.getByUserId(userId, theUser => {
//     if (theUser) { // Existing user found
//       req.user = theUser;
//       // console.log(req.user);
//       next();
//     } else { // User not found in the DB. Create and return a new one
//       User.create(userId, email, newUser => {
//         req.user = newUser;
//         next();
//       });
//     }
//   });
// }
