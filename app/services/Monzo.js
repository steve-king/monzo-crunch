'use strict';
const url = require('url');
const request = require('request');
const crypto = require('crypto');

const BASE_URL = process.env.BASE_URL;
const API_BASE = 'https://api.monzo.com';
const CLIENT_ID = process.env.MONZO_CLIENT_ID;
const CLIENT_SECRET = process.env.MONZO_CLIENT_SECRET;
const AUTH_REDIRECT_URL = BASE_URL + '/monzo/connect';

const User = require('./User');

class Monzo {
  getAuthURL(req) {
    req.session.oAuthStateSecret = crypto.randomBytes(64).toString('hex');
    return url.format({
      protocol: 'https',
      host: 'auth.getmondo.co.uk',
      query: {
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: AUTH_REDIRECT_URL,
        state: req.session.oAuthStateSecret
      }
    })
  }

  getAccessToken(authToken, auth0_id) {
    return new Promise((resolve, reject) => {
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
        if (err) reject(err);
        var data = JSON.parse(body);
        resolve({
          user_id: data.user_id,
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });
      });
    });
  }

  getAccounts(access_token) {
    return new Promise((resolve, reject) => {
      request({
        url: API_BASE+'/accounts',
        method: 'GET',
        auth: { bearer: access_token }
      }, (error, response, body) => {
        console.log(body);
        if (error) {
          reject(error);
        } else {
          var data = JSON.parse(body);
          resolve(data.accounts);
        }
      });
    });
  }
};

module.exports = new Monzo();
