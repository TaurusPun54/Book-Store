import { Routes, Route } from 'react-router-dom';
import SearchBook from './search';
import Download from './download';

function BookApp() {
  return(
    <Routes>
      <Route path='/search' element={<SearchBook/>}></Route>
      <Route path='/download' element={<Download/>}></Route>
    </Routes>
  )
}

export default BookApp;