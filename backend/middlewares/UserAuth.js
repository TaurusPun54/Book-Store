const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../User/UserModel');

// import error handle
const ClientError = require('../ErrorHandle/ClientError');
const ServerError = require('../ErrorHandle/ServerError');

// eslint-disable-next-line consistent-return
const JWTAuth = async (req, res, next) => {
  try {
    const token = req?.header('Authorization')?.replace('Bearer ', '') || '';
    if (!token) return new ClientError.Unauthorized('Unknown user without token');
    // console.log(token);
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userid = decodedToken?.authClaims[0]?._id;

    // console.log(userid);

    const validuser = await User.findById(userid);
    if (!validuser) return new ClientError.Unauthorized('Token not valid or user not found');

    req.userpass = validuser;
    // console.log(req.userpass._id);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return next(new ClientError.Unauthorized('Login time out, login again'));
    // if (error.name === 'TokenExpiredError') {

    // }
    return next(new ServerError.InternalServer('Unknown server error'));
  }
};

module.exports = { JWTAuth };
