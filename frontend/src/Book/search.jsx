import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function SearchBook () {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState({
    title: '',
    author: '',
    isbn: '',
    _page: 1,
    _size: 5,
  });
  const [currentQuery, setCurrentQuery] = useState({...searchQuery});
  const [searchResults, setSearchResults] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { state } = useLocation() ?? {};
  const [loginedUser, setUser] = useState(state?.loginedUser ?? {}); // these 4 values will be undefined if user is {}
  const [cart, setCart] = useState(loginedUser.cart ?? []); // this cart only store _id
  const IsLogined = loginedUser.name ?? 'Login';

  const handleSearchQueryChange = (event) => {
    setLoading(false);
    let { name, value } = event.target;
    if (typeof(value) === 'string' && value.length > 500) value = value.substring(0, 500);
    setSearchQuery((prevQuery) => ({ ...prevQuery, [name]: value }));
    setError('');
  };

  const handleSearch = async (query) => {
    setError('');
    setLoading(true);
    setSearchResults([]);
    setDisplayResults([]);
    setCurrentQuery(() => ({ ...query }));
    if (query.isbn.length > 0 && (query.title.length > 0 || query.author.length > 0)) {
    return setError('isbn cannot search with other fields');
    }
    if (query.isbn.length !== 13 && query.isbn.length > 0) return setError('isbn format not valid');
    if (query.isbn.length === 13) {
      try {
        const response = await axios.get('http://localhost:3001/api/Book/searchisbn/', { params: {isbn: query.isbn} });
        const { BookExist } = response?.data;
        setLoading(false);
        if (BookExist) {
          return setSearchResults(BookExist);
        }
        return setSearchResults(() => []);
      } catch (e) {
        return setError(e.response?.data?.error);
      }
    }
    try {
      const {isbn, ...noisbn} = query;
      const response = await axios.get('http://localhost:3001/api/Book/search/', { params: noisbn });
      const { bookList, totalpages } = response?.data;
      if (bookList && totalpages) {
        setLoading(false);
        setSearchResults(bookList);
        setTotalPages(totalpages);
        return;
      }
      return setSearchResults([]);
    } catch (e) {
      setError(e.response?.data?.error);
    }
  }

  const handlePrevPage = async () => {
    if (currentQuery._page > 1) {
        const newPage = currentQuery._page - 1;
        setCurrentQuery((prevQuery) => ({ ...prevQuery, _page: newPage }));
        setCurrentPage(newPage);
        // handleSearch(currentQuery);
    }
  };

  const handleNextPage = async () => {
    if (currentQuery._page < totalPages) {
        const newPage = currentQuery._page + 1;
        setCurrentQuery((prevQuery) => ({ ...prevQuery, _page: newPage }));
        setCurrentPage(newPage);
        // handleSearch(currentQuery);
    }
  };

  const handleUpdateCart = async (bookid) => {
    try {
      if (!loginedUser.id) {
        alert('Please login first');
        navigate('/user/login');
      }
      const response = await axios.post(`http://localhost:3001/api/User/tocart/${bookid}`, null, {
        headers: {
          Authorization: `Bearer ${loginedUser.acctoken}`
        }
      });
      alert(response?.data?.message)
      const newCart = response?.data?.cart ?? [];
      setCart(response?.data?.cart);
      setUser((loginedUser) => ({...loginedUser, cart: newCart}));
    } catch (e) {
      if (e.response?.status === 401) {
        alert(`${e.response?.data?.error}`);
        navigate('/user/login');
      }
      setError(e.response?.data?.error);
    }
  }

  const handleClear = () => {
    setCurrentPage(1);
    setSearchResults([]);
    setDisplayResults([]);
    setError('');
    setTotalPages(1);
  };

  const handleloginOrlogout = async () => {
    try {
      if (loginedUser.id) {
        setCart([]);
        setUser({});
        const response = await axios.post(`http://localhost:3001/api/User/logout/${loginedUser.id}`);
        alert(response?.data?.message);
        navigate('/user/login');
        return;
      }
      navigate('/user/login');
      return;
    } catch (e) {
      setError(e.response?.data?.error);
    }
  }

  const handleCheckCart = async () => {
    try {
      if (!loginedUser.id) {
        alert('Please login first');
        navigate('/user/login');
        return;
      }
      const response = await axios.get(`http://localhost:3001/api/User/cart/${loginedUser.id}`, {
        headers: {
          Authorization: `Bearer ${loginedUser.acctoken}`
        }
      });
      // console.log(response.data);
      const booksInCart = response?.data;
      //console.log(booksInCart);
      setUser((loginedUser) => ({...loginedUser, cart: booksInCart}));
      // console.log(loginedUser.cart);
      navigate('/user/cart', {
        state: {
          loginedUser,
          booksInCart
        }
      });
      return;
    } catch (e) {
      if (e.response?.status === 401) {
        alert(`${e.response?.data?.error}`);
        navigate('/user/login');
        return;
      }
      // setError(e.response?.data?.error);
    }
  }

  useEffect(() => {
    handleSearch(currentQuery);
  }, [currentQuery._page]);

  useEffect(() => {
    if (loginedUser.id) {
      const checkInCartOrNot = searchResults.map((e) => {
        let addstatus = {};
        if (cart.includes(e._id)) {
          addstatus = { ...e, status: 'Remove from cart' };
          return addstatus;
        }
        addstatus = { ...e, status: 'Add to cart' };
        return addstatus;
      })
      setDisplayResults(checkInCartOrNot);
    }else {
      setDisplayResults(searchResults);
    }
  }, [searchResults, cart])

  return (
    <div className="container">
      <div className='row'>
        <div className='col-8'>
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
            <button onClick={() => handleSearch(searchQuery)}>Search</button>
          </div>
          <br />
          <div>
            <button className="btn btn-outline-primary" onClick={handleClear}>Clear</button>
          </div>
        </div>
        <div className='col-2'>
          <button className='btn d-flex' onClick={() => handleCheckCart()}> In cart: {cart.length ?? 0} </button>
        </div>
        <div className='col-2'>
          <button className='btn d-flex' onClick={() => handleloginOrlogout()}> {IsLogined} </button>
        </div>
      </div>
      <div className='row'>
        {error && <div>{error}</div>}
          {loading && !error && <p>Loading...</p>}
          {displayResults.length > 0 && (
            <div>
              <h2>Search Results :</h2>
              <ul>
                {displayResults.map((result) => (
                <div key={result._id} className='row d-flex'>
                  <li>
                    title: {result.title}, author: {result.author}, regularprice: {`${result.price.regularprice}`}, saleprice: {`${result.price.saleprice}`}
                    <div className='btn'>
                      <button onClick={() => handleUpdateCart(result._id)}> {result.status ?? 'Add to cart'} </button>
                    </div>
                  </li>
                </div>
                ))}
              </ul>
            </div>
          )}
          <div className='col-1'>
            <button onClick={handlePrevPage} className='btn btn-outline-secondary' disabled={currentPage === 1}> Prev </button>
          </div>
          <div className='col-1'>
            <button onClick={handleNextPage} className='btn btn-outline-primary' disabled={currentPage === totalPages}> Next </button>
          </div>
      </div>
    </div>
  )
}

export default SearchBook;