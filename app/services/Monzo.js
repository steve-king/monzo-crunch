const url = require('url');
const request = require('request');
const crypto = require('crypto');

const BASE_URL = process.env.BASE_URL;
const API_BASE = 'https://api.monzo.com';
const CLIENT_ID = process.env.MONZO_CLIENT_ID;
const CLIENT_SECRET = process.env.MONZO_CLIENT_SECRET;
const AUTH_REDIRECT_URL = BASE_URL + '/monzo/connect';

exports.getAuthURL = (req) => {
  req.session.oAuthStateToken = crypto.randomBytes(64).toString('hex');
  return url.format({
    protocol: 'https',
    host: 'auth.getmondo.co.uk',
    query: {
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: AUTH_REDIRECT_URL,
      state: req.session.oAuthStateToken
    }
  })
}

exports.getAccessToken = (authToken, callback) => {
  request({
      url: API_BASE+'/oauth2/token',
      method: 'POST',
      form: {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: AUTH_REDIRECT_URL,
        code: authToken
      }
    }, (err, res, body) => {
      if (err) throw err;
      callback(JSON.parse(body));
    });
}
