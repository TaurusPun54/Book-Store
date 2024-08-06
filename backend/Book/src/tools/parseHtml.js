const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const { parse } = require('node-html-parser');

function parsebooklistHTML(file, numOfNeeds) {
  const htmlData = fs.readFileSync(file, { encoding: 'utf8' });
  if (!htmlData) return 'No data';
  const root = parse(htmlData);
  const bookList = root.querySelector('.boxify-container')?.getElementsByTagName('LI');
  bookList.splice(numOfNeeds);

  const output = bookList.reduce((acc, cur) => {
    const preisbn = JSON.parse(cur.getAttribute('ga-product')).sku;
    const isbn = preisbn.substring(2, preisbn.length + 1);
    const href = cur.querySelector('.quick-cart-item').getAttribute('href');
    const data = {
      isbn,
      href,
    };
    acc.push(data);
    return acc;
  }, []);

  return output;
}

function parsebookdetailHTML(file, url, isbn) {
  const htmlData = fs.readFileSync(file, { encoding: 'utf8' });
  const root = parse(htmlData);
  const productdetailcontainer = root.querySelector('.product-detail-container');
  // const image = productdetailcontainer.querySelector('.product-info row');
  // console.log(image);
  const title = productdetailcontainer.querySelector('.title')?.textContent.trim();
  const regularprice = productdetailcontainer.querySelector('.price-regular')?.textContent.trim();
  const saleprice = productdetailcontainer.querySelector('.price-sale')?.textContent.trim();

  const innercontainer = productdetailcontainer?.querySelector('.description-container').getElementsByTagName('div').filter((e) => e.textContent.trim().length > 0);
  // console.log(innercontainer.length);
  const index = innercontainer.findIndex((e) => e.textContent.trim().length === 4);
  // console.log(index);
  // innercontainer.forEach((e) => {
  //   console.log(e.textContent.trim())
  // })
  // console.log(innercontainer[0].textContent.trim() == '内容簡介');
  const descindex = index + 1;
  // const detailindex = (innercontainer.length === 6) ? 5 : 5 + innercontainer.length - 6;
  // console.log(detailindex);

  const descriptioncontainer = innercontainer[descindex]?.querySelectorAll('p').filter((e) => e.textContent.trim().length > 0);
  const description = descriptioncontainer?.reduce((acc, cur, i) => acc.concat(cur.textContent.trim(), (i === descriptioncontainer.length - 1) ? '' : '\n'), '');

  const detailcontainer = innercontainer[innercontainer.length - 1].getElementsByTagName('p').filter((e) => e.textContent.trim().length > 0);

  const authorcontainer = detailcontainer[1].textContent.trim();
  const author = authorcontainer?.substring(3, authorcontainer.length + 1);
  // console.log(author);
  // // const isbncontainer = detailcontainer[4].textContent.trim();
  // // const isbn = isbncontainer.substring(5, isbncontainer.length + 1);
  const language = '中文';

  const BookDetail = {
    title,
    url,
    author,
    price: {
      regularprice,
      saleprice,
    },
    description,
    language,
    isbn,
  };

  return (BookDetail);
}

module.exports = {
  parsebooklistHTML,
  parsebookdetailHTML,
};
