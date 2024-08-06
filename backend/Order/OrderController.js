/* eslint-disable camelcase */
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// create check out session
const CreatePayment = async (req) => {
  const { orderitemArr } = req.body; // array of objects, each contain id, quantity, cost
  const { user } = req.body;
  // console.log(orderItems);
  const line_items = orderitemArr.map((goods) => ({
    price_data: {
      currency: 'hkd',
      unit_amount: Math.round(goods.unitPrice * 100),
      product_data: {
        name: goods.title,
        metadata: {
          bookid: goods.id,
        },
      },
    },
    quantity: goods.quantity,
  }));
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    payment_method_types: ['card'],
    line_items,
    shipping_address_collection: {
      allowed_countries: ['CN'],
    },
    metadata: {
      userid: user.id,
    },
    mode: 'payment',
    success_url: 'http://localhost:3000/order/success',
    cancel_url: 'http://localhost:3000/order/cancel',
  });

  return { id: session.id };
};

module.exports = {
  CreatePayment,
};
