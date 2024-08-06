const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    stripeOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    userid: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentMethod: {
      type: Object,
      required: true,
    },
    shippingAddress: {
      type: Object,
      required: true,
    },
    Status: {
      type: String,
      default: 'Order Placed',
      enum: ['Order Placed', 'Out for delivery', 'Delivered', 'Canceled'],
      required: true,
    },
    totalCost: {
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

module.exports = mongoose.model('Order', OrderSchema);
