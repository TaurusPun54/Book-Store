const mongoose = require('mongoose');
require('dotenv').config();

const dbconn = async () => {
  try {
    await mongoose.connect(`${process.env.DB}`);
    console.log('DB connected');
  } catch (error) {
    console.log('db connection fail');
  }
};

dbconn();
