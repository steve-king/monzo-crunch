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

  getAccessToken(req) {
    return new Promise((resolve, reject) => {

      if (!req.query.code) {
        reject('Missing auth code');
      } else
      if (req.query.state !== req.session.oAuthStateSecret) {
        reject('oAuth2.0 state token mismatch');
      } else {
        request({
          url: API_BASE+'/oauth2/token',
          method: 'POST',
          form: {
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: AUTH_REDIRECT_URL,
            code: req.query.code
          }
        }, (e, r, body) => {
          if (e) reject(e);

          var data = JSON.parse(body);
          resolve({
            user_id: data.user_id,
            access_token: data.access_token,
            refresh_token: data.refresh_token
          });
        });
      }
    });
  }

  getAccounts(access_token) {
    return new Promise((resolve, reject) => {
      request({
        url: API_BASE+'/accounts',
        method: 'GET',
        auth: { bearer: access_token }
      }, (e, r, body) => {
        if (e) { reject(e); } else {
          var data = JSON.parse(body);
          resolve(data.accounts);
        }
      });
    });
  }

  registerWebhook(access_token, account_id) {
    return new Promise((resolve, reject) => {
      request({
        url: API_BASE+'/webhooks',
        method: 'POST',
        auth: { bearer: access_token },
        form: {
          url: BASE_URL+'/transactions',
          id: 'transaction.created',
          account_id
        }
      }, (e, r, body) => {
        if (e) { reject(e); } else {
          console.log('REGISTER WEBOOK:' + body);
          resolve(JSON.parse(body));
        }
      })
    });
  }

  listWebhooks(access_token, account_id) {
    return new Promise((resolve, reject) => {
      request({
        url: API_BASE+'/webhooks&account_id='+account_id,
        // method: 'GET',
        auth: { bearer: access_token }
      }, (e, r, body) => {
        if (e) { reject(e); } else {
          var data = JSON.parse(body);
          console.log(body);
          console.log('LIST WEBOOKS:' + data);
          if (data) {
            resolve(data);
          } else {
            resolve([]);
          }
        }
      });
    });
  }

  deleteWebhooks(access_token, webhooks) {
    return new Promise((resolve, reject) => {
      request({
        url: API_BASE+'/webhooks/'+webhook_id,
        method: 'DELETE',
        auth: { bearer: access_token }
      }, (e, r, body) => {
        if (e) { reject(e); } else {
          console.log('DELETE WEBOOK:' + body);
          resolve(JSON.parse(body));
        }
      });
    });
  }

  getBalance(access_token, account_id) {
    return new Promise((resolve, reject) => {
      request({
        url: API_BASE+'/balance&account_id='+account_id,
        auth: { bearer: access_token }
      }, (error, r, body) => {
        var data = JSON.parse(body);
        if (!error && r.statusCode == 200) {
          resolve(data);
        } else {
          reject({
            status: r.statusCode,
            error: error || data
          });
        }
      });
    })
  }

  getTransactions(access_token, account_id) {
    return new Promise((resolve, reject) => {
      request({
        url: API_BASE+'/transactions&account_id='+account_id,
        auth: { bearer: access_token }
      }, (error, r, body) => {
        var data = JSON.parse(body);
        if (!error && r.statusCode == 200) {
          resolve(data);
        } else {
          reject({
            status: r.statusCode,
            error: error || data
          });
        }
      });
    })
  }

  postFeedItem(access_token, account_id, params) {
    return new Promise((resolve, reject) => {
      request({
        url: API_BASE+'/feed/',
        method: 'POST',
        auth: { bearer: access_token },
        form: {
          account_id: account_id,
          type: 'basic',
          params
        }
      }, (error, r, body) => {
        var data = JSON.parse(body);
        console.log(data);
        if (!error && r.statusCode == 200) {
          resolve(data);
        } else {
          reject({
            status: r.statusCode,
            error: error || data
          });
        }
      });
    });
  }
};

module.exports = new Monzo();
