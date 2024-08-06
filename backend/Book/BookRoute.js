/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const path = require('path');

const router = express.Router();

const multer = require('multer');

const bookControllers = require('./bookControllers');

// import error handle
const ClientError = require('../ErrorHandle/ClientError');
// const ServerError = require('../ErrorHandle/ServerError');

// Configure storage engine and filename
const storage = multer.diskStorage({
  destination: './Book/src/csvs',
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(csv)$/)) {
      cb(new ClientError.BadRequest('You can only upload .csv file'));
    }
    cb(null, `${file.originalname}`);
  },
  storage,
});

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

// uploadBook
router.post('/', warpper(bookControllers.uploadBook));

// getBook
router.get('/search/:_id([0-9a-fA-F]{24})?', warpper(bookControllers.getBook)); // the _id before ? is optional
router.get('/searchisbn', warpper(bookControllers.getBookByIsbn));

// updateBook
router.patch('/:_id', warpper(bookControllers.updateBook));

// deleteBook
router.delete('/:_id', warpper(bookControllers.deleteBook));

// check isbn
router.get('/validate/:isbn', warpper(bookControllers.isbnValidate));

// upload json
router.post('/uploadcsv', upload.single('csv'), warpper(bookControllers.uploadCSV));

// generate csv
router.get('/generatecsv', warpper(bookControllers.generateCSV));

module.exports = router;
