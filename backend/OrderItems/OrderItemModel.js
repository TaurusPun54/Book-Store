const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    bookid: {
      type: mongoose.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    orderid: {
      type: mongoose.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unitcost: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('OrderItems', OrderItemSchema);
