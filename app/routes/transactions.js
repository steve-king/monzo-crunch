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

  console.log('MONZO TRANSACTION RECEIVED:');
  console.log(req.body);
  res.json({ success: true });
});

module.exports = router;
