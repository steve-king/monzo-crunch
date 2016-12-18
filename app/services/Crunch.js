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

  // Request a temporary token from crunch
  // Return a Crunch login URL
  getAuthURL(req, callback) {
    return new Promise((resolve, reject) => {

      request({
        url: AUTH_API_BASE + '/oauth/request_token',
        method: 'POST',
        oauth: this.oauth
      }, function(error, response, body) {
        if (error) reject(error);

        // Parse response
        var responseParams = qs.parse(body);
        console.log(responseParams);

        /* Should I store the returned token/secret in the session
           in order to exchange for an access token later on? */
        req.session.crunch = {
          oauth_token: responseParams.oauth_token,
          oauth_token_secret: responseParams.oauth_token_secret
        };

        // Create and return the login URL
        var query = qs.stringify({
          oauth_token: responseParams.oauth_token,
          callback: AUTH_REDIRECT_URL
        });
        var authURL = AUTH_API_BASE+'/login/oauth-login.seam?'+query;
        resolve(authURL);
      });
    });
  }

  getAccessToken(req){
    return new Promise((resolve, reject) => {
      /*
         This is where I'm stuck! I have the following things available:
         - crunch.oauth_token - received from above request to /oauth/request_token
         - crunch.oauth_token_secret - as above
         - req.query.code - this is the copy/paste code the user received from crunch when authorising this app

         I'm not sure exactly where in the below code I need to enter any (or all) of the above tokens?
         With the below code, the response from Crunch is always "parameter_absent" so I'm clearly not
         naming a paramter correctly or not sending it in the right part of the request...

         oauth documentation for the request module is here: https://www.npmjs.com/package/request#oauth-signing
         AUTH_API_BASE = 'https://demo.crunch.co.uk/crunch-core'
      */

      var oauth = deepcopy(this.oauth);
      oauth.token = req.query.code;
      oauth.token_secret = req.session.crunch.oauth_token_secret;

      request({
        url: AUTH_API_BASE + '/oauth/access_token',
        method: 'POST',
        oauth: oauth
      }, function(error, response, body) {
        if (error) {
          reject({ error, body })
        } else {
          resolve(body);
        };
      });

    });
  }
}

module.exports = new Crunch();
