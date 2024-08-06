import { Routes, Route } from 'react-router-dom';
import Login from './login';
import Signup from './signup';
import Search from './search';
import Update from './update';
import Delete from './delete';
import ShowCart from './cart';

function UserApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/signup" element={<Signup />}></Route>
      <Route path="/search" element={<Search />}></Route>
      <Route path='/update/:userId' element={<Update />}></Route> {/* userId is passed from search */}
      <Route path='/delete' element={<Delete />}></Route>
      <Route path='/cart' element={<ShowCart />}></Route>
    </Routes>
  );
}

export default UserApp;