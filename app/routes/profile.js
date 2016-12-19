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
  // } else {
    res.render('profile', {
      user: req.user,
    });
  // }

});

module.exports = router;
