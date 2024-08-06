/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
const gethtml = require('./getHtml');
const parsehtml = require('./parseHtml');
const tojson = require('./toJSON');
const tocsv = require('./tocsv');
const env = require('./env');

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  // The maximum and the minimum are inclusive
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

// async function main() {
//   const page = 1;
//   gethtml.getbooklistHTML(env.htmlFolder, env.origin, 1);
//   const bookList = parsehtml.parsebooklistHTML(`${env.htmlFolder}/chungwabookstorePage${page}.html`, 24);
//   console.log(bookList);

//   for (const element of bookList) {
//     gethtml.getbookdetailHTML(env.htmlFolder, env.origin + element.href, element.isbn);
//     const sleep = getRandomIntInclusive(1, 2) * 1000;
//     await new Promise((resolve) => setTimeout(resolve, sleep));
//   }
//   const BookDetailList = bookList.map((e) => parsehtml.parsebookdetailHTML(`${env.htmlFolder}/${e.isbn}.html`, env.origin + e.href, e.isbn));
//   tojson.writeJSON(env.jsonFolder, page, BookDetailList);
//   tocsv(`${env.jsonFolder}/chungwabookstorePage${page}.json`, env.csvFolder, page);
//   console.log(tojson.csvToJson(`${env.csvFolder}/chungwabookstorePage1.csv`));
// }

module.exports = {
  gethtml,
  parsehtml,
  tojson,
  tocsv,
  env,
  getRandomIntInclusive,
};
