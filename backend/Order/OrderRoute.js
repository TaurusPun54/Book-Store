const express = require('express');

const router = express.Router();
require('dotenv').config();

// Controllers
const orderController = require('./OrderController');

// middleware
const userAuthMiddleware = require('../middlewares/UserAuth');

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

router.post('/checkout', userAuthMiddleware.JWTAuth, warpper(orderController.CreatePayment));

module.exports = router;
