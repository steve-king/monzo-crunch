const express = require('express');
const router = express.Router();
const BASE_URL = process.env.BASE_URL;

const Monzo = require('../services/Monzo');
const User = require('../services/User');

router.post('/', (req, res) => {

  processRequest(req, res);

  function processRequest(req, res){
    // DATABASE - Get the user with matching Monzo account id
    // GET transactions from Monzo
    // POST unprocessed expenses to Crunch
    // PATCH completed expenses to Monzo
    // POST confirmation to Monzo feed

    // Prototype code
    var transaction = req.body;
    if (req.body.SECOND_ATTEMPT) {
      console.log('MONZO TOKEN REFRESHED, TRYING AGAIN');
    } else {
      console.log('MONZO TRANSACTION RECEIVED');
    }

    // console.log(transaction);

    var account_id = transaction.data.account_id;
    var amount = '£'+(Math.abs(transaction.data.amount)/100).toFixed(2);
    var feedItemParams = {
      title: '📡 Transaction received',
      image_url: BASE_URL+'/images/crunch-icon.png',
      body: amount+' at '+transaction.data.merchant.name
    };

    var user;

    User.getByMonzoAccountId(account_id)
    .then((theUser) => {
      user = theUser;
      return Monzo.postFeedItem(user.monzo.access_token, user.monzo.accounts[0].id, feedItemParams)
    })
    .then(() => res.json({ success: true }))
    .catch(e => {
      if( e.status === 401 && e.error.error == 'invalid_token' ){
        console.log('INVALID TOKEN ERROR 🤔');
        Monzo.refreshTokens(user.monzo.refresh_token)
          .then((tokens) =>
            User.set(user.id, { 'monzo' : tokens })
          )
          .then(() => {
            req.body.SECOND_ATTEMPT = true;
            processRequest(req, res);
          })
          .catch(e => res.json(e));
      } else {
        res.json(e);
      }
    });
  }

});

module.exports = router;
