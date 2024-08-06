import { Routes, Route } from 'react-router-dom';
import Success from './success';
import Cancel from './cancel';

function OrderApp() {
  return(
    <Routes>
      <Route path='/success' element={<Success/>}></Route>
      <Route path='/cancel' element={<Cancel/>}></Route>
    </Routes>
  )
}

export default OrderApp;