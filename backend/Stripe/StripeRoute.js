const express = require('express');

const router = express.Router();
require('dotenv').config();

const stripeController = require('./StripeController');

const warpper = (fn) => (req, res, next) => {
  let data = null;
  try {
    data = fn(req, res);
  } catch (error) {
    data = error;
  }
  // console.log(data)
  return next(data);
};

router.post('/webhook', express.raw({ type: 'application/json' }), warpper(stripeController.listenWebHook));

module.exports = router;
