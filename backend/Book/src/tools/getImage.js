// eslint-disable-next-line import/no-extraneous-dependencies
const axios = require('axios');
const path = require('path');
const fs = require('fs');

async function getImage(folder, url, isbn) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });

  const imageData = Buffer.from(response.data, 'binary');
  const imageType = url.substring(url.length, url.lastIndexOf('=') + 1);

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, `${isbn}.${imageType}`), imageData);
  } else {
    fs.writeFileSync(path.join(folder, `${isbn}.${imageType}`), imageData);
  }
}

module.exports = getImage;
