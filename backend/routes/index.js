const express = require('express');

const router = express.Router();

const userRoute = require('../User/UserRoute');
const bookRoute = require('../Book/BookRoute');
const orderRoute = require('../Order/OrderRoute');
// const webhookRoute = require('../Stripe/StripeRoute');

router.use('/User', userRoute);
router.use('/Book', bookRoute);
router.use('/Order', orderRoute);
// router.use('/Stripe', webhookRoute);

module.exports = router;
