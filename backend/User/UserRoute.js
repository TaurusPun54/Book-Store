const express = require('express');

const router = express.Router();
require('dotenv').config();

// controllers
const userController = require('./userControllers');

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

// Sign up
router.post('/signup', warpper(userController.signup));

// Login
router.post('/login', warpper(userController.login));

// logout
router.post('/logout/:_id', warpper(userController.logout));

// add a book to cart or remove a book from cart
router.post('/tocart/:bookid', userAuthMiddleware.JWTAuth, warpper(userController.addToOrRemoveInCart));

// get user cart detail
router.get('/cart/:_id([0-9a-fA-F]{24})?', userAuthMiddleware.JWTAuth, warpper(userController.getCartDetail));

// get user data by query params or _id
router.get('/user/:_id?', warpper(userController.getUserData)); // :_id?  means :_id is optional

// create new user
router.post('/', warpper(userController.createNewUser));

// update user
router.put('/:_id', warpper(userController.updateUserData));

// delete user
router.delete('/:_id', warpper(userController.deleteUser));

module.exports = router;

// model view controller (MVC)

// universal response

// if next() contain sth, where will it go?

// builder method

// renew token income: refresh, output: newrefresh and newaccess without update expiredtime
