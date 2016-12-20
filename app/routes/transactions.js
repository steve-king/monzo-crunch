const express = require('express');
const router = express.Router();
const BASE_URL = process.env.BASE_URL;

const Monzo = require('../services/Monzo');
const User = require('../services/User');

router.post('/', (req, res) => {

  // DATABASE - Get the user with matching Monzo account id
  // GET transactions from Monzo
  // POST unprocessed expense to Crunch
  // PATCH completed expenses to Monzo
  // POST confirmation to Monzo feed

  var transaction = req.body;
  console.log('MONZO TRANSACTION RECEIVED:');
  console.log(transaction);

  var account_id = transaction.data.account_id;
  var amount = '£'+(Math.abs(transaction.data.amount)/100).toFixed(2);
  var feedItemParams = {
    title: '📡 Transaction received',
    image_url: BASE_URL+'/images/logo.png',
    body: amount+' at '+transaction.data.merchant.name
  };

  User.getByMonzoAccountId(account_id)
  .then((user) => Monzo.postFeedItem(user.monzo.access_token, user.monzo.accounts[0].id, feedItemParams))
  .then(() => res.json({ success: true }))
  .catch(error => res.json(error));
});

module.exports = router;
