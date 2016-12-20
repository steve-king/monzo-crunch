const express = require('express');
const router = express.Router();
const getUser = require('../middleware/user');
const Monzo = require('../services/Monzo');

router.get('/', getUser, (req, res) => {

  // FUTURE: Grab anything needed for display here e.g. list of Crunch suppliers, Monzo categories? etc
  // if (req.user.monzo) {
  //   Monzo.getBalance(
  //     req.user.monzo.access_token,
  //     req.user.monzo.accounts[0].id
  //   )
  //   .then(balance => {
  //     console.log(balance);
  //     res.render('profile', {
  //       user: req.user,
  //       balance: balance
  //     });
  //   })
  //   .catch(error => res.send(error));

  var access_token = req.user.monzo.access_token;
  var account_id = req.user.monzo.accounts[0].id;

  var data = {};

  if (req.user.monzo) {
    Monzo.listWebhooks(access_token, account_id)
    .then(webhooks => {
      res.render('profile', {
        user: req.user,
        data: data
      });
    })
    .catch(error => res.json(error));
  } else {
    res.render('profile', {
      user: req.user,
    });
  }

});

module.exports = router;
