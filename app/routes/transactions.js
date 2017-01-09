const express = require('express');
const router = express.Router();
const BASE_URL = process.env.BASE_URL;

const Monzo = require('../services/Monzo');
const User = require('../services/User');

router.post('/', (req, res) => {


  // DATABASE - Get the user with matching Monzo account id
  // GET transactions from Monzo
  // POST unprocessed expenses to Crunch
  // PATCH completed expenses to Monzo
  // POST confirmation to Monzo feed

  // Prototype code
  var transaction = req.body;
  var account_id = transaction.data.account_id;
  var amount = '£'+(Math.abs(transaction.data.amount)/100).toFixed(2);
  var feedItem = {
    title: '🐡 Transaction received',
    image_url: BASE_URL+'/images/crunch-icon.png',
    body: amount+' at '+transaction.data.merchant.name
  };

  var monzo;

  User.getByMonzoAccountId(account_id)
  .then((theUser) => {
    monzo = new Monzo(theUser);
    // return monzo.postFeedItem(feedItem)
    return monzo;
  })
  .then(() => res.json({ success: true }))
  .catch(e => res.json(e));

});

module.exports = router;
