/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
const fs = require('fs');
// const readline = require('readline');

// import database
const Book = require('./BookModel');

// import error handle
const ClientError = require('../ErrorHandle/ClientError');
const ServerError = require('../ErrorHandle/ServerError');

// upload a new book
const uploadBook = async (req) => {
  const { title, url } = req.body;

  const urlExist = await Book.findOne({ url });
  if (urlExist) return new ClientError.BadRequest(`Book with url ${url} is already uploaded`);

  const newBook = new Book({
    title,
    url,
  });
  const uploadSuccess = await newBook.save();
  if (uploadSuccess) return { message: 'New book uploaded' };

  return new ServerError.InternalServer('Unknown Server Error');
};

const getBook = async (req) => {
  // get a book by _id
  if (req.params._id) {
    const targetBookId = req.params._id;
    const BookExist = await Book.findById(targetBookId);
    if (!BookExist) return new ClientError.NotFound(`Book with id ${targetBookId} not found`);

    return BookExist;
  }

  // get book list
  const _page = parseInt(req.query._page, 10) || 1; // Default page to 1 if not provided
  const _size = parseInt(req.query._size, 10) || 5; // Default size to 10 if not provided
  const numOfskip = _size * (_page - 1);

  const data = Object.entries(req.query).filter(([key]) => !['_page', '_size'].includes(key));

  const query = data.reduce((acc, [key, value]) => {
    acc[key] = ['title', 'author'].includes(key) ? { $regex: value } : value; // , $options: 'i'
    return acc;
  }, {});

  const totalBooks = await Book.countDocuments(query);
  if (totalBooks === 0) return new ClientError.NotFound('No books found in this query');
  const bookList = await Book.find(query).skip(numOfskip).limit(_size);
  const totalpages = Math.ceil(totalBooks / _size);
  if (bookList) {
    return { bookList, totalpages };
  }

  return new ServerError.InternalServer('Error fetching book list');
};

const getBookByIsbn = async (req) => {
  const { isbn } = req.query; // Access the ISBN from route parameters

  if (!isbn) return new ClientError.BadRequest('No ISBN provided');

  const BookExist = await Book.findOne({ isbn });

  if (!BookExist) return new ClientError.NotFound(`Book with ISBN ${isbn} not found`);

  return { BookExist };
};

// update book by Id
const updateBook = async (req) => {
  const targetBookId = req.params._id;

  const BookExist = await Book.findById(targetBookId);

  if (!BookExist) return new ClientError.NotFound(`Book with id ${targetBookId} not found`);

  const data = Object.entries(req.body);

  const updatedBook = {};

  data.forEach(([key, value]) => {
    updatedBook[key] = value;
  });

  const updateSuccess = await Book.findByIdAndUpdate(targetBookId, updatedBook);
  if (updateSuccess) return { message: 'Book updated' };

  return new ServerError.InternalServer('Unknown Server Error');
};

// delete an existing book
const deleteBook = async (req) => {
  const targetBookId = req.params._id;

  const BookExist = await Book.findById(targetBookId);

  if (!BookExist) return new ClientError.NotFound(`Book with id ${targetBookId} not found`);

  const deleteSuccess = await Book.findByIdAndDelete(targetBookId);
  if (deleteSuccess) return { message: `Book ${BookExist.title} deleted` };

  return new ServerError.InternalServer('Unknown Server Error');
};

const isbnValidate = (req) => {
  const regex = /^(97[89][- ]?)([0-9]{1,5}[- ]?)([0-9]{1,5}[- ]?){2}([0-9])$/;

  const isbn = req.params?.isbn;

  if (!isbn) return new ClientError.BadRequest('No ISBN provided');
  if (!regex.test(isbn)) return new ClientError.BadRequest('Invalid ISBN format');

  const isbnCharsArray = isbn.replace(/[- ]/g, '').split('');
  // console.log(isbnCharsArray);
  const checkDigit = parseInt(isbnCharsArray.pop(), 10);
  // console.log(checkDigit);
  let sum = 0;
  isbnCharsArray.forEach((num, i) => {
    sum += parseInt(num, 10) * (i % 2 === 0) ? 1 : 3;
  });
  const check = 10 - (sum % 10);
  // console.log(check);

  const valid = !!(((check < 10 && checkDigit === check) || (check === 10 && checkDigit === 0)));

  if (!valid) return new ClientError.BadRequest('Invalid  ISBN');
  return { message: 'This ISBN is valid' };
};

const uploadCSV = async (req) => {
  if (!req.file.path) return new ClientError.BadRequest('Please upload a file');

  const readStream = fs.createReadStream(req.file.path, { encoding: 'utf8' });

  let jsonArray;

  readStream.on('data', (chunk) => {
    const rows = chunk.split('\n"');
    const headers = rows[0].split(',');
    rows.splice(0, 1);

    jsonArray = rows.reduce((acc, cur) => {
      const values = cur.split(',');
      const json = headers.reduce((a, c, i) => {
        const key = c.trim();
        const value = values[i].trim().replaceAll('"', '');
        if (['regularprice', 'saleprice'].includes(key)) {
          if (!a.price) a.price = {};
          a.price[key] = value;
          return a;
        }
        a[key] = value;
        return a;
      }, {});
      acc.push(json);
      return acc;
    }, []);
  });

  readStream.on('end', async () => {
    jsonArray.forEach(async (element) => {
      const exist = await Book.find({ element });
      if (!exist) await Book.create(element);
    });
    // await Book.create(toupload);
    fs.unlinkSync(req.file.path);
  });
  readStream.on('error', () => new ServerError.InternalServer('Unknown Server Error'));
  return { message: 'csv upload to db success' };
};

const generateCSV = async (req) => {
  function getCSVValue(obj) {
    // if mongoose document, then need ._doc
    const values = obj._doc ? Object.values(obj._doc) : Object.values(obj);

    return values.map((value) => {
      if (typeof (value) === 'object') {
        return getCSVValue(value);
      }
      return `"${value}"`;
    }).join(',');
  }

  function getCSVHeader(obj) {
    const headers = Object.keys(obj);

    return headers.map((header) => {
      if (typeof (obj[header]) === 'object') {
        return getCSVHeader(obj[header]);
      }
      return `${header}`;
    }).join(',');
  }
  // function getCSVHeader(obj) {
  //   const headers = Object.keys(obj._doc);

  //   return headers.map((header) => {
  //     if (typeof (obj._doc[header]) === 'object') {
  //       return getCSVHeader({ _doc: obj._doc[header] });
  //     }
  //     return `${header}`;
  //   }).join(',');
  // }
  // react buffer to file
  // node res.sendfile
  // const num = req.query.quantity;
  // const sort = req.query.sortby;
  const data = Object.entries(req.query);

  const query = data.reduce((acc, [key, value]) => {
    acc[key] = ['title', 'author'].includes(key) ? { $regex: value } : value;
    return acc;
  }, {});

  const bookList = Book.find(query).select('-_id -createdAt -updatedAt -__v').lean().cursor();

  if (!bookList) return new ClientError.NotFound('No books matching the query were found');

  let csv = '';
  for await (const book of bookList) {
    if (csv.length === 0) csv += `${getCSVHeader(book)}\n`;
    csv += `${getCSVValue(book)}\n`;
  }

  const csvbuffer = Buffer.from(csv, 'utf8');
  return { csvbuffer };
  // return new ServerError.InternalServer('Unknown Server Error');
};

module.exports = {
  uploadBook,
  getBook,
  updateBook,
  deleteBook,
  isbnValidate,
  getBookByIsbn,
  uploadCSV,
  generateCSV,
};
