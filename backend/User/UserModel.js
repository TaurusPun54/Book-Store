const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    icon: {
      type: String,
      default:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOH2aZnIHWjMQj2lQUOWIL2f4Hljgab0ecZQ&s',
    },
    role: {
      type: String,
      default: 'normal_user',
      enum: ['normal_user', 'admin'],
      required: true,
    },
    cart: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Book',
      },
    ],
    orders: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Order',
      },
    ],
    refreshTokenPayload: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

UserSchema.virtual('Orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'userId',
});

module.exports = mongoose.model('User', UserSchema);
