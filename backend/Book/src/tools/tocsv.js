/* eslint-disable no-param-reassign */
const fs = require('fs');
const path = require('path');

function getvalue(obj) {
  const output = Object.values(obj).reduce((acc, cur) => {
    if (typeof (cur) === 'object') {
      return acc + getvalue(cur);
    }
    return acc.concat(`"${cur}"`, ',');
  }, '');

  return output;
}

function getheader(obj) {
  const output = Object.keys(obj).reduce((acc, cur) => {
    if (typeof (obj[cur]) === 'object') {
      return acc + getheader(obj[cur]);
    }
    // acc += `${cur},`;

    return acc.concat(cur, ',');
  }, '');
  return output;
}

function jsontocsv(jsonfile, csvfolder, page) {
  if (!fs.existsSync(jsonfile)) return;
  const jsoncontent = fs.readFileSync(jsonfile, { encoding: 'utf-8' });
  const jsonarr = JSON.parse(jsoncontent);

  const csv = jsonarr.reduce((acc, cur, i) => {
    if (!cur) return acc;
    if (i === 0) acc += `${getheader(cur).slice(0, -1)}\n`;
    acc += `${getvalue(cur).slice(0, -1)}\n`;
    return acc;
  }, '');

  if (!fs.existsSync(csvfolder)) {
    fs.mkdirSync(csvfolder, { recursive: true });
  }
  fs.writeFileSync(path.join(csvfolder, `chungwabookstorePage${page}.csv`), csv);
}

function dbtocsv(csvfolder, arr) {
  if (arr.length === 0) return;
  const jsonarr = arr;

  const csv = jsonarr.reduce((acc, cur, i) => {
    if (!cur) return acc;
    if (i === 0) acc += `${getheader(cur).slice(0, -1)}\n`;
    acc += `${getvalue(cur).slice(0, -1)}\n`;
    return acc;
  }, '');

  if (!fs.existsSync(csvfolder)) {
    fs.mkdirSync(csvfolder, { recursive: true });
  }
  fs.writeFileSync(path.join(csvfolder, 'Book.csv'), csv);
}

module.exports = {
  jsontocsv,
  dbtocsv,
};
