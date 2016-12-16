const monzo = require('../helpers/monzo');

module.exports = function(req, res, next) {
  
  // If no monzo_access_token, get monzo auth url
  if (!req.user.monzo || !req.user.monzo.access_token) {
    req.monzoAuthURL = monzo.getAuthURL(req);
  }

  // If no crunch_access_token, get crunch auth url

  // FUTURE: Grab anything else needed for dashboard e.g. list of Crunch suppliers, Monzo categories? etc

  next();
};
