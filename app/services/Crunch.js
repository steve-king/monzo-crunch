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
    this.oAuth = OAuth({
      consumer: {
        key: CLIENT_ID,
        secret: CLIENT_SECRET
      },
      signature_method: 'PLAINTEXT'
    })
  }

  getAuthURL(callback) {
    return new Promise((resolve, reject) => {
      var requestData = {
        url: AUTH_API_BASE + '/oauth/request_token',
        method: 'POST',
      };
      request({
        url: requestData.url,
        method: requestData.method,
        form: this.oAuth.authorize(requestData)
      }, function(error, response, body) {
        if (error) throw error;
        var oauth_token = querystring.parse(body).oauth_token;
        var query = querystring.stringify({
          oauth_token: oauth_token,
          oauth_callback: AUTH_REDIRECT_URL
        });
        var authURL = AUTH_API_BASE+'/login/oauth-login.seam?'+query;
        resolve(authURL);
      });
    });
  }

  getAccessToken(oauth_token, callback){
    console.log('EXCHANGE REQUEST_TOKEN FOR ACCESS_TOKEN', oauth_verifier);
    return new Promise((resolve, reject) => {
      var requestData = {
        url: AUTH_API_BASE + '/oauth/access_token',
        method: 'POST',
        oauth_token
      };
      request({
        url: requestData.url,
        method: requestData.method,
        form: this.oAuth.authorize(requestData)
      }, function(error, response, body) {
        if (error) throw error;
        // var oauth_token = querystring.parse(body).oauth_token;
        // var query = querystring.stringify({
        //   oauth_token: oauth_token,
        //   oauth_callback: AUTH_REDIRECT_URL
        // });
        // var authURL = AUTH_API_BASE+'/login/oauth-login.seam?'+query;
        resolve(response);
      });
    });
  }
}

module.exports = new Crunch();
