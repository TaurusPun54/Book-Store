const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// database collections
const User = require('./UserModel');
const Book = require('../Book/BookModel');

// import error handle
const ClientError = require('../ErrorHandle/ClientError');
const ServerError = require('../ErrorHandle/ServerError');

// get user by Id
const getUserData = async (req) => {
  // get user by _id
  if (req.params._id) {
    const targetUserId = req.params._id;
    if (targetUserId.length !== 24) return new ClientError.BadRequest('id format not valid');
    const userExist = await User.findById(targetUserId);
    if (!userExist) return new ClientError.NotFound(`User with _id ${targetUserId} not found`);

    // return res.status(200).json({ user: userExist });
    // console.log({ user: userExist });
    return userExist;
  }
  // get user list
  const data = Object.entries(req.query);
  let emptyQuery = true;
  const query = data.reduce((acc, [key, value]) => {
    acc[key] = ['name', 'email'].includes(key) ? { $regex: value } : value;
    emptyQuery = !!((emptyQuery === true && value !== ''));
    return acc;
  }, {});

  const numOfLimit = emptyQuery ? 10 : 0;

  const userList = await User.find(query).sort({ createdAt: -1 }).limit(numOfLimit);
  if (userList.length > 0) return userList;
  if (userList.length === 0) return new ClientError.NotFound('No match results');

  return new ServerError.InternalServer('Unknown Server Error');
};

// update user by Id
const updateUserData = async (req) => {
  const targetUserId = req.params?._id;
  if (!targetUserId) return new ClientError.BadRequest('User _id required');
  if (targetUserId.length !== 24) return new ClientError.BadRequest('id format not valid');

  const userExist = await User.findById(targetUserId).select('+password');
  if (!userExist) return new ClientError.NotFound(`User with _id ${targetUserId} not found`);

  const emailAlreadyExist = await User.findOne({ email: req.body.email });
  if (emailAlreadyExist && req.body.email !== userExist.email) return new ClientError.BadRequest('This email is already registered');

  const passwordMatch = await bcrypt.compare(req.body.checkpassword, userExist.password);
  // console.log(passwordMatch);
  if (!passwordMatch) return new ClientError.BadRequest('Current Password invalid');

  const data = Object.entries(req.body).filter(([key]) => key !== 'checkpassword');

  const updatedUser = data.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  if (updatedUser.password?.length > 0) {
    const hashedPassword = await bcrypt.hash(updatedUser.password, 10);
    updatedUser.password = hashedPassword;
  } else {
    updatedUser.password = userExist.password;
  }

  const updateSuccess = await User.findByIdAndUpdate(targetUserId, updatedUser);
  if (updateSuccess) return { message: 'User data updated!' };

  return new ServerError.InternalServer('Unknown Server Error');
};

// create user
const createNewUser = async (req) => {
  const requiredData = ['name', 'password', 'email', 'address', 'age'];
  const incomeData = Object.keys(req.body);

  const missingKeys = requiredData.filter((key) => !incomeData.includes(key));

  if (missingKeys.length > 0) return new ClientError.BadRequest(`Missing required data: ${missingKeys.join(', ')}`);

  const {
    name, password, email, address, age,
  } = req.body;

  const emailAlreadyExist = await User.findOne({ email });

  // ****race condition
  if (emailAlreadyExist) return new ClientError.BadRequest('This email is already registered');

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    password: hashedPassword,
    email,
    address,
    age,
  });

  const createSuccess = await newUser.save();
  if (createSuccess) return { message: 'Create new user success' };

  return new ServerError.InternalServer('Unknown Server Error');
};

// delete user by Id
const deleteUser = async (req) => {
  const targetUserId = req.params?._id;
  if (!targetUserId) return new ClientError.BadRequest('User _id required');
  if (targetUserId.length !== 24) return new ClientError.BadRequest('id format not valid');

  const userExist = await User.findById(targetUserId);
  if (!userExist) return new ClientError.NotFound(`User with _id ${targetUserId} not found`);

  const deleteSuccess = await User.findByIdAndDelete(targetUserId);
  if (deleteSuccess) return { message: 'User deleted' };

  return new ServerError.InternalServer('Unknown Server Error');
};

// sign up
const signup = async (req) => {
  // check sign up data
  const requiredData = ['name', 'password', 'email', 'address', 'age'];
  const incomeData = Object.keys(req.body);

  const missingKeys = requiredData.filter((key) => !incomeData.includes(key));

  if (missingKeys.length > 0) return new ClientError.BadRequest(`Missing required data: ${missingKeys.join(', ')}`);

  // get sign up data
  const {
    name, password, email, address, age,
  } = req.body;

  // check email valid or not
  const emailAlreadyExist = await User.findOne({ email });
  if (emailAlreadyExist) return new ClientError.BadRequest('This email is already registered');

  // check password valid or not
  if (password.length <= 4) return new ClientError.BadRequest('Password too short');

  // hash password by bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // save the new sign up user data to mongodb
  const newUser = new User({
    name,
    password: hashedPassword,
    email,
    address,
    age,
  });

  const signupSuccess = await newUser.save();
  if (signupSuccess) return { message: 'Sign up success' };

  return new ServerError.InternalServer('Unknown Server Error');
};

// login
const login = async (req) => {
  // check login data
  const requiredData = ['email', 'password'];
  const incomeData = Object.keys(req.body);

  const missingKeys = requiredData.filter((key) => !incomeData.includes(key));

  if (missingKeys.length > 0) return new ClientError.BadRequest(`Missing required data: ${missingKeys.join(', ')}`);

  // get login data
  const { email, password } = req.body;

  // check email exist or not
  const ExistingUser = await User.findOne({ email }).select('+password +refreshTokenPayload');

  if (!ExistingUser) return new ClientError.BadRequest('This email is not registered');

  const passwordMatch = await bcrypt.compare(password, ExistingUser.password);

  if (!passwordMatch) return new ClientError.BadRequest('Password invalid');

  // if password match, save and send jwt token
  const authClaims = [
    { _id: ExistingUser._id },
    { role: ExistingUser.role },
  ];
  const accessToken = jwt.sign(
    { authClaims },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' },
  );
  const refreshToken = jwt.sign(
    { authClaims },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' },
  );

  // eslint-disable-next-line max-len
  const loginSuccess = await User.findByIdAndUpdate(ExistingUser._id, { refreshTokenPayload: refreshToken });

  if (loginSuccess) {
    // console.log(accessToken);
    const loginedUser = {
      id: ExistingUser._id,
      email: ExistingUser.email,
      name: ExistingUser.name,
      role: ExistingUser.role,
      cart: ExistingUser.cart,
      acctoken: accessToken,
    };
    return {
      message: 'login success',
      loginedUser,
    };
  }

  return new ServerError.InternalServer('Unknown Server Error');
};

// logout
const logout = async (req) => {
  const targetUserId = req.params?._id;
  if (!targetUserId) return new ClientError.BadRequest('User _id required');
  if (targetUserId.length !== 24) return new ClientError.BadRequest('id format not valid');

  // eslint-disable-next-line max-len
  const logoutSuccess = await User.findByIdAndUpdate(targetUserId, { $set: { refreshTokenPayload: '' } });
  if (logoutSuccess) return { message: 'Logout success' };

  return new ServerError.InternalServer('Unknown Server Error');
};

// add or remove a book in cart
const addToOrRemoveInCart = async (req) => {
  const { _id } = req.userpass;
  if (!_id) return new ServerError.InternalServer('Get userid fail');
  const bookId = req.params?.bookid;
  if (!bookId) return new ClientError.BadRequest('Book _id required');
  if (bookId.length !== 24) return new ClientError.BadRequest('id format not valid');

  const bookExist = await Book.findById(bookId);
  if (!bookExist) return new ClientError.NotFound('Book not found');

  const user = await User.findById(_id);
  if (!user) return new ClientError.NotFound('User not found');

  const bookIncart = user.cart.indexOf(bookId);

  if (bookIncart >= 0) {
    // cannot use push or pull or splice since it is reference array
    const removeSuccess = await User.findByIdAndUpdate(_id, { $pull: { cart: bookId } });
    const updateduser = await User.findById(_id);
    if (removeSuccess) {
      return {
        message: `Removed book ${bookExist.title} in cart`,
        cart: updateduser.cart,
      };
    }
    return new ServerError.InternalServer('Unknown Server Error');
  }
  const addSuccess = await User.findByIdAndUpdate(_id, { $push: { cart: bookId } });
  const updateduser = await User.findById(_id);
  if (addSuccess) {
    return {
      message: `Book ${bookExist.title} added to cart`,
      cart: updateduser.cart,
    };
  }
  return new ServerError.InternalServer('Unknown Server Error');
};

const getCartDetail = async (req) => {
  const { _id } = req.userpass;
  if (!_id) return new ClientError.Unauthorized('Unknown user request');
  const user = await User.findById(_id);
  if (!user) return new ClientError.Unauthorized('No such user data');
  const { cart } = user;
  const bookPromises = cart.map(async (bookid) => {
    const bookDetail = await Book.findById(bookid);
    return bookDetail;
  });
  const bookList = await Promise.all(bookPromises);
  // console.log(bookList);
  if (bookList) return bookList;
  return new ServerError.InternalServer('Unknown Server Error');
};

module.exports = {
  getUserData,
  createNewUser,
  updateUserData,
  deleteUser,
  signup,
  login,
  logout,
  addToOrRemoveInCart,
  getCartDetail,
};
