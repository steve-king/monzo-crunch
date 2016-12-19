'use strict';
const request = require('request');
const url = require('url');
const qs = require('querystring');
const deepcopy = require('deepcopy');

const BASE_URL = process.env.BASE_URL;
const API_BASE = process.env.CRUNCH_API_BASE;
const AUTH_API_BASE = process.env.CRUNCH_AUTH_API_BASE;
const CLIENT_ID = process.env.CRUNCH_CLIENT_ID;
const CLIENT_SECRET = process.env.CRUNCH_CLIENT_SECRET;
const AUTH_REDIRECT_URL = BASE_URL + '/crunch/connect';

class Crunch {
  constructor() {
    this.oauth = {
      // Adding the callback param here always causes a 'Wrong callback URI' response from '/oauth/request_token'
      // --------------------------------------------------------------------------------------------------------
      // callback: AUTH_REDIRECT_URL,
      consumer_key: CLIENT_ID,
      consumer_secret: CLIENT_SECRET,
      signature_method: 'PLAINTEXT'
    }
  }

  // Request a temporary token and secret from crunch and return a login URL
  getAuthURL(req, callback) {
    return new Promise((resolve, reject) => {
      request({
        url: AUTH_API_BASE + '/oauth/request_token',
        method: 'POST',
        oauth: this.oauth
      }, function(error, response, body) {
        if (error) reject(error);
        var data = qs.parse(body);

        // Store token/secret in session
        // - Will be exchanged for some permanent creds when user enters their verification code
        req.session.crunch = {
          oauth_token: data.oauth_token,
          oauth_token_secret: data.oauth_token_secret
        };

        // Compose and return the login URL
        var query = qs.stringify({
          oauth_token: data.oauth_token,
          callback: AUTH_REDIRECT_URL
        });
        var authURL = AUTH_API_BASE+'/login/oauth-login.seam?'+query;
        resolve(authURL);
      });
    });
  }

  getAccessToken(req){
    return new Promise((resolve, reject) => {
      if (!req.query.code) {
        reject('Missing verification code'); return;
      }

      var oauth = deepcopy(this.oauth);
      oauth.token = req.session.crunch.oauth_token;
      oauth.token_secret = req.session.crunch.oauth_token_secret;
      oauth.verifier = req.query.code;

      request({
        url: AUTH_API_BASE + '/oauth/access_token',
        method: 'POST',
        oauth: oauth
      }, function(error, response, body) {
        if (error) reject(error);
        var data = qs.parse(body);
        resolve(data);
      });
    });
  }
}

module.exports = new Crunch();
