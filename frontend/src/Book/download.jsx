import React, { useState } from 'react';
import axios from 'axios';

function Download () {
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState({
    title: '',
    author: '',
    isbn: '',
  });

  const handleSearchQueryChange = (event) => {
    const { name, value } = event.target;
    setSearchQuery((prevQuery) => ({ ...prevQuery, [name]: value }));
    setError('');
  };

  const handleDownload = async () => {
    setError('');
    if (searchQuery.isbn.length > 0 && (searchQuery.title.length > 0 || searchQuery.author.length > 0)) {
      return setError('isbn cannot search with other fields');
    }
    if (searchQuery.isbn.length > 0 && searchQuery.isbn.length !== 13) {
      return setError('isbn format not valid');
    }
    if (searchQuery.isbn.length === 13) {
      try {
        console.log()
        const response = await axios.get('http://localhost:3001/api/Book/generatecsv', { params: { isbn: searchQuery.isbn } });
        const csvbuffer = response?.data?.csvbuffer.data;
        const bufferArray = new Uint8Array(csvbuffer).buffer;
        const blob = new Blob([bufferArray], {
          type: 'text/csv',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${searchQuery.isbn}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        return setError(e.response?.data?.error);
      }
    }else {
      try {
        const { isbn, ...noisbn } = searchQuery;
        const response = await axios.get('http://localhost:3001/api/Book/generatecsv', { params: noisbn });
        const csvbuffer = response?.data?.csvbuffer.data;
        const bufferArray = new Uint8Array(csvbuffer).buffer;
        const blob = new Blob([bufferArray], {
          type: 'text/csv',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `title=${noisbn.title}&author=${noisbn.author}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        return setError(e.response?.data?.error);
      }
    }
  }

  return (
    <div className="container">
      <div>
        <label>
          title :&nbsp;
          <input
            type="text"
            name="title"
            value={searchQuery.title || ''}
            onChange={handleSearchQueryChange}
            placeholder="Enter title"
          />
        </label>
      </div>
      <br />
      <div>
        <label>
          author :&nbsp;
          <input
            type="text"
            name="author"
            value={searchQuery.author || ''}
            onChange={handleSearchQueryChange}
            placeholder="Enter author"
          />
        </label>
      </div>
      <br />
      <div>
        <label>
          isbn :&nbsp;
          <input
            type="text"
            name="isbn"
            value={searchQuery.isbn || ''}
            onChange={handleSearchQueryChange}
            placeholder="Enter isbn"
          />
        </label>
      </div>
      <br />
      <div>
        <button className='btn btn btn-primary' onClick={handleDownload}>Download</button>
      </div>
      <br />
      {error && <div>{error}</div>}
    </div>
  )
}

export default Download;