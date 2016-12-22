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

  constructor(user) {
    this.configure(user);
  }

  config = {}

  configure(user) {
    this.config.auth0_id = user.id;

    if (user.monzo) {
      this.config.access_token = user.monzo.access_token;
      this.config.refresh_token = user.monzo.refresh_token;
      this.config.user_id = user.monzo.user_id;
      this.config.account_id = user.monzo.accounts[0].id;
    }
  }

  authenticatedRequest(path, method, form) {

    return new Promise((resolve, reject) => {
      request({
        url: API_BASE+path,
        method,
        form,
        auth: { bearer: this.config.access_token }
      }, (error, response) => {
        if (error) { reject(error); return; }

        var body = JSON.parse(response.body);

        if (response.statusCode === 200) { // Success
          resolve(body);
        } else
        if (response.statusCode === 401 && body.error === 'invalid_token') {

          // Refresh the access token and try again
          this.refreshToken()
          .then(() => this.authenticatedRequest(path, method, form))
          .then(() => resolve(secondAttempt))
          .catch(error => reject(error));

        } else {
          reject(body);
        }
      })
    })
  }

  postFeedItem(feedItem) {
    return this.authenticatedRequest('/feed/', 'POST', {
      account_id: this.config.account_id,
      type: 'basic',
      params: feedItem
    });
  }

  static getAuthURL(req) {
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

  static getAccessToken(req) {
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

  refreshToken() {
    console.log('INVALID TOKEN 🤔');
    return new Promise((resolve, reject) => {
      console.log('REFRESH TOKEN REQUEST');
      request({
        url: API_BASE+'/oauth2/token',
        method: 'POST',
        form: {
          grant_type: 'refresh_token',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: this.config.refresh_token
        }
      }, (e, r, body) => {
        var data = JSON.parse(body);
        if (!e && r.statusCode == 200) {

          console.log('REFRESH TOKEN RECEIVED');
          User.set(this.config.auth0_id, { monzo: {
            access_token: data.access_token,
            refresh_token: data.refresh_token
          }})
          .then((updatedUser) => {
            this.configure(updatedUser);
            console.log('USER UPDATED');
            resolve();
          })
          .catch(error => reject(error));

        } else {
          reject({
            status: r.statusCode,
            error: e || data
          });
        }
      })
    })
  }

  static getAccounts(access_token) {
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

  static registerWebhook(access_token, account_id) {
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

  static listWebhooks(access_token, account_id) {
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
          if (data.webhooks) {
            resolve(data.webhooks);
          } else {
            resolve([]);
          }
        }
      });
    });
  }

  static deleteWebhook(access_token, webhook) {
    console.log('DELETE WEBOOK: ' + webhook.id + ' ' + webhook.url);
    return new Promise((resolve, reject) => {
      request({
        url: API_BASE+'/webhooks/'+webhook.id,
        method: 'DELETE',
        auth: { bearer: access_token }
      }, (e, r, body) => {
        if (e) { reject(e); } else {
          console.log('DELETED WEBOOK:' + body);
          resolve(JSON.parse(body));
        }
      });
    });
  }

  static getBalance(access_token, account_id) {
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

  static getTransactions(access_token, account_id) {
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
};

module.exports = Monzo;
