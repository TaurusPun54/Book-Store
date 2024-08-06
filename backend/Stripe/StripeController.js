/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable no-case-declarations */
/* eslint-disable max-len */
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

// database Collections
const User = require('../User/UserModel');
// const Book = require('../Book/BookModel');
const Order = require('../Order/OrderModel');
const OrderItems = require('../OrderItems/OrderItemModel');

// import error handle
const ClientError = require('../ErrorHandle/ClientError');
const ServerError = require('../ErrorHandle/ServerError');

const listenWebHook = async (req) => {
  // console.log(req.body);
  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return new ClientError.BadRequest('Not valid stripe signature');
  }
  let event;
  try {
    // console.log(Buffer.from(JSON.stringify(req.body)));
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    if (!event) {
      return new ClientError.BadRequest('No event');
    }
    // console.log(event);
  } catch (e) {
    return new ClientError.BadRequest(`WebHook Error: ${e.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const orderDetails = {};
      let orderItems = [];
      const checkoutsession = event.data.object;
      const line_items = await stripe.checkout.sessions.listLineItems(
        checkoutsession.id,
        {
          expand: ['data.price.product'],
        },
      );
      const paymentIntent = await stripe.paymentIntents.retrieve(
        checkoutsession.payment_intent,
        {
          expand: ['payment_method'],
        },
      );
      const { metadata } = checkoutsession; // userid
      const { type } = paymentIntent.payment_method;
      orderDetails.stripeOrderId = checkoutsession.id;
      orderDetails.userid = metadata.userid;
      orderDetails.paymentMethod = paymentIntent.payment_method[type];
      orderDetails.shippingAddress = checkoutsession.shipping_details;
      orderDetails.Status = 'Order Placed';
      orderDetails.totalCost = Math.floor((checkoutsession.amount_total / 100) * 10) / 10;
      orderDetails.currency = checkoutsession.currency;
      const newOrder = await Order.create(orderDetails);
      const orderid = newOrder._id;
      orderItems = line_items.data.map((items) => ({
        bookid: items.price.product.metadata.bookid,
        orderid,
        quantity: items.quantity,
        unitcost: Math.floor((items.price.unit_amount / 100) * 10) / 10,
        currency: items.price.currency,
      }));
      orderItems.forEach(async (items) => {
        await OrderItems.create(items);
      });
      await User.findByIdAndUpdate(metadata.userid, { $set: { cart: [] }, $push: { orders: orderid } });
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }

  return { message: 'A webhook done' };
};

module.exports = {
  listenWebHook,
};
