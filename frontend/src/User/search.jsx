import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
// import Pagination from './component/pagination';

function Search() {
  const [searchQuery, setSearchQuery] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(3);

  const handleSearchQueryChange = (event) => {
    const { name, value } = event.target;
    setSearchQuery((prevQuery) => ({ ...prevQuery, [name]: value }));
    setError('');
  };

  const handleSearch = async () => {
    setError('');
    try {
      const result = await axios.get('http://localhost:3001/api/User/user/',{ params: searchQuery });
      const data = result?.data;
      setSearchResults(data);
    } catch (e) {
      setError(e.response?.data?.error);
    }
  };

  const handleClear = () => {
    setSearchResults('');
    setError('');
  };


  // get current users
  const indexend = currentPage * resultsPerPage;
  const indexstart = indexend - resultsPerPage;
  const currentResults = searchResults.slice(indexstart, indexend);

  // change page
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  return (
    <div className="container">
      <div>
        <label>
          Name :&nbsp;
          <input
            type="text"
            name="name"
            value={searchQuery.name || ''}
            onChange={handleSearchQueryChange}
            placeholder="Enter name"
          />
        </label>
      </div>
      <br />
      <div>
        <label>
          Email :&nbsp;
          <input
            type="email"
            name="email"
            value={searchQuery.email || ''}
            onChange={handleSearchQueryChange}
            placeholder="Enter email"
          />
        </label>
      </div>
      <br />
      <div>
        <label>
          Address :&nbsp;
          <input
            type="text"
            name="address"
            value={searchQuery.address || ''}
            onChange={handleSearchQueryChange}
            placeholder="Enter address"
          />
        </label>
      </div>
      <br />
      <div>
        <label>
          Age :&nbsp;
          <input
            type="text"
            name="age"
            value={searchQuery.age || ''}
            onChange={handleSearchQueryChange}
            placeholder="Enter age"
          />
        </label>
      </div>
      <br />
      <div>
        <button onClick={() => handleSearch()}>Search</button>
      </div>
      <br />
      <div>
        <button className="btn btn-outline-primary" onClick={handleClear}>Clear</button>
      </div>
      {error && <div>{error}</div>}
      {searchResults.length > 0 && (
        <div>
          <h2>Search Results :</h2>
          <ul>
            {currentResults.map((result) => (
            <div key={result._id} className='btn d-flex' onClick={() => navigate(`/user/update/${result._id}`)} >
              <li>
                Name: {result.name}, Age: {result.age}, Email: {result.email}, Address: {result.address}
              </li>
              </div>
            ))}
          </ul>
        </div>
      )}
      {searchResults.length > resultsPerPage && (
        <ReactPaginate
          previousLabel="Previous"
          nextLabel="Next"
          breakLabel="..."
          breakClassName="break-me"
          pageCount={Math.ceil(searchResults.length / resultsPerPage)}
          // marginPagesDisplayed={2}
          // pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName="pagination"
          activeClassName="active"
        />
      )}
    </div>
  );
}

export default Search;