'use strict';

const OAuth = require('oauth-1.0a');
const request = require('request');
const url = require('url');
const querystring = require('querystring');

const BASE_URL = process.env.BASE_URL;
const API_BASE = process.env.CRUNCH_API_BASE;
const AUTH_API_BASE = process.env.CRUNCH_AUTH_API_BASE;
const CLIENT_ID = process.env.CRUNCH_CLIENT_ID;
const CLIENT_SECRET = process.env.CRUNCH_CLIENT_SECRET;
const AUTH_REDIRECT_URL = BASE_URL + '/crunch/connect';

class Crunch {
  constructor() {
    // Configure the oauth-1.0a module
    this.oAuth = OAuth({
      consumer: {
        key: CLIENT_ID,
        secret: CLIENT_SECRET
      },
      signature_method: 'PLAINTEXT'
    })
  }

  // Request a temporary token from crunch
  // Return a Crunch login URL
  getAuthURL(req, callback) {
    return new Promise((resolve, reject) => {

      var requestData = {
        url: AUTH_API_BASE + '/oauth/request_token',
        method: 'POST',
      };

      request({
        url: requestData.url,
        method: requestData.method,
        form: this.oAuth.authorize(requestData) // Sign the requestData
      }, function(error, response, body) {
        if (error) throw error;

        // Parse response
        var responseParams = querystring.parse(body);
        console.log(responseParams);

        // Store returned token/secret in session?
        // - In order to exchange for access token later on?
        req.session.crunch = {
          oauth_token: responseParams.oauth_token,
          oauth_token_secret: responseParams.oauth_token_secret
        };

        // Build and return the login URL
        /*
          oauth_callback parameter does not work.
          Crunch always gives a code to copy and paste.
          Why is this?
        */
        var queryString = querystring.stringify({
          oauth_token: responseParams.oauth_token,
          oauth_callback: AUTH_REDIRECT_URL
        });
        var authURL = AUTH_API_BASE+'/login/oauth-login.seam?'+queryString;
        resolve(authURL);
      });
    });
  }

  getAccessToken(req){
    return new Promise((resolve, reject) => {

      /* This is where I'm stuck. I have the following things available:
         - crunch.oauth_token - received from above request to /oauth/request_token
         - crunch.oauth_token_secret - as above
         - req.query.code - this is the code that the user received from crunch when authorising this app

         I'm not sure exactly where in the below code I need to enter any/all of the above tokens
         Documentation for the oauth1.0a npm module is here: https://www.npmjs.com/package/oauth-1.0a

         With the below code, the response from Crunch is always "parameter_absent"

         AUTH_API_BASE = 'https://demo.crunch.co.uk/crunch-core'

      */

      var requestData = {
        url: AUTH_API_BASE + '/oauth/access_token',
        method: 'POST',
        data: {
          oauth_token:  req.session.crunch.oauth_token,
          oauth_token_secret: req.session.crunch.oauth_token_secret
        }
      };

      var token = {
        key: req.session.crunch.oauth_token, //req.query.code
        secret: req.session.crunch.oauth_token_secret
      }

      console.log(requestData);

      request({
        url: requestData.url,
        method: requestData.method,
        form: this.oAuth.authorize(requestData, token)
      }, function(error, response, body) {
        if (error) reject(error);
        resolve(body);
      });

    });
  }
}

module.exports = new Crunch();
