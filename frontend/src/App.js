import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserApp from './User/main';
import BookApp from './Book/main';
import OrderApp from './Order/main';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/user/*" element={<UserApp />} />
        <Route path="/book/*" element={<BookApp />} />
        <Route path="/order/*" element={<OrderApp />} />
      </Routes>
    </Router>
  );
}

export default App;

// pagination: _page, _pagesize, _sort, use filter first, then sort, last paginate. mongoose.skip

// decide a order of buying, need what table, find some sample, see the design
// data structure