/* eslint-disable no-param-reassign */
const path = require('path');
const fs = require('fs');

function writeJSON(folder, page, objarr) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  fs.writeFileSync(path.join(folder, `chungwabookstorePage${page}.json`), JSON.stringify(objarr));
}

function csvToJson(csvfile) { // folder, page,
  if (!fs.existsSync(csvfile)) return {};
  // if (!fs.existsSync(folder)) {
  //   fs.mkdirSync(folder, { recursive: true });
  // }
  const csvString = fs.readFileSync(csvfile, { encoding: 'utf-8' });

  const rows = csvString.split('\n"');

  const headers = rows[0].split(',');

  rows.splice(0, 1);

  const jsonData = rows.reduce((acc, cur) => {
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

  return JSON.stringify(jsonData);

  // eslint-disable-next-line max-len
  // fs.writeFileSync(path.join(folder, `chungwabookstorePage${page}CSV.json`), JSON.stringify(jsonData));
}

module.exports = {
  writeJSON,
  csvToJson,
};
