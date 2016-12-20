const express = require('express');
const router = express.Router();

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
  var feedItemParams = {
    title: 'I can see you...',
    image_url: 'https://www.crunch.co.uk/favicons/apple-touch-icon-180x180.png',
    body: 'Spending your money at '+transaction.data.merchant.name
  };

  User.getByMonzoAccountId(account_id)
  .then((user) => Monzo.postFeedItem(user.monzo.access_token, user.monzo.accounts[0].id, feedItemParams))
  .then(() => res.json({ success: true }))
  .catch(error => res.json(error));
});

module.exports = router;
