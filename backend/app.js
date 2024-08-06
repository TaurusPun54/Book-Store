const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require('cors');
require('dotenv').config();
require('./lib/connection/db');
const router = require('./routes/index');
const BaseApiError = require('./ErrorHandle/BaseApiError');
const stripeController = require('./Stripe/StripeController');

const app = express();

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

app.post('/api/Stripe/webhook', express.raw({ type: 'application/json' }), warpper(stripeController.listenWebHook));

app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use('/api', router);

app.use(async (rawdata, req, res, next) => {
  const data = await rawdata;
  // console.log(data);
  if (data instanceof Error) return next(data); // here needs a return to stop here

  let json = null;
  try {
    json = JSON.parse(JSON.stringify(data));
    // console.log(json)
  } catch {
    json = undefined;
  }

  if (json === undefined) {
    // console.log(json);
    return res.send(rawdata);
  }
  if (data.loginedUser) {
    res.cookie('user', data.loginedUser, { maxAge: 900000, httpOnly: true });
  }
  // console.log();
  return res.status(200).json(json);
});

app.use((err, req, res, next) => { // here needs a next to pass err to frontend
  if (err instanceof BaseApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  return res.status(500).json({ error: err.message });
});

app.listen(process.env.PORT || 3000, () => {
  // console.log(`Backend Server listening on PORT ${process.env.PORT}`);
});
