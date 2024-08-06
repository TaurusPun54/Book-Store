import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { loadStripe } from '@stripe/stripe-js';

function ShowCart () {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loginedUser, setUser] = useState(state?.loginedUser ?? {});
  const [cart, setCart] = useState(state?.booksInCart ?? []); // cart of book details, not only _id
  const [orderitems, setOrderItems] = useState(cart.map((books) => {
    return {...books, quantity: 1};
  }));
  const [displayCart, setDisplayCart] = useState(orderitems);

  const [popup, setPopup] = useState({
    show: false, // initial values set to false and null,
  });

  const handlePopUpFalse = () => {
    setPopup({ show: false });
  }

  const handlePopUpTrue = () => {
    setPopup({ show: true });
  }

  const showConfirm = () => {
    let totalcost = 0;
    const show = orderitems.map((items) => {
      const id = items._id;
      const title = items.title;
      const { saleprice } = items.price;
      const { regularprice } = items.price;
      const price = parseFloat(saleprice?.substring(3, saleprice.length) ?? regularprice.substring(3, regularprice.length));
      const quantity = items.quantity;
      const cost = price * quantity;
      const itemDetail = {
        id,
        title,
        quantity,
        unitPrice: price,
        cost,
      };
      totalcost += cost;
      return itemDetail;
    })
    return (
    <div className='row'>
      <div
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
      >
      <Modal.Dialog>
        <Modal.Header closeButton onClick={() => handlePopUpFalse()}>
          <Modal.Title>Confirm cart</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {show.map((items) => (
            <div key={items._id} className='row d-flex'>
              <div>
                {items.title}, quantity: {items.quantity}, price: {items.cost}
              </div>
            </div>
          ))}
          <br></br>
          <div className='float-right'>
            Total price: {Math.floor(totalcost * 10) / 10}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => handlePopUpFalse()}>Back to cart</Button>
          <Button variant="primary" className='btn btn-success' onClick={() => handleMakeOrder(show, loginedUser)}>CheckOut</Button>
        </Modal.Footer>
      </Modal.Dialog>
      </div>
    </div>
    )
  }

  const handleBackToStore = () => {
    // console.log(loginedUser.cart);
    navigate('/book/search', {
      state: {
        loginedUser,
      }
    });
    return;
  }

  const handleMakeOrder = async (orderitemArr, user) => {
    const stripe = await loadStripe('pk_test_51PiAVgCI45u5t8sxTy6Cbpnqu9zzvBRcUDoPc4DPIm68SvssDu7oiSpUHOlwgdsQNSlQNlS7CJHyepLjm1bpz9Zf00QEUjbvER');
    try {
      const response = await axios.post('http://localhost:3001/api/Order/checkout', {
        orderitemArr,
        user,
      }, {
        headers: {
          Authorization: `Bearer ${loginedUser.acctoken}`
        }
      });
      const sessionId = response.data.id;
      // console.log(response.data.id);
  
      const result = stripe.redirectToCheckout({
        sessionId
      })
    } catch (e) {
      console.log(e);
    }
  }

  const handleMinusOne = (index) => {
    // Create a new array with the updated quantity for the item
    const updatedItems = orderitems.map((orderitem, i) => {
      if (i === index) {
        // Decrease the quantity of the selected item by 1
        const updatedItem = { ...orderitem, quantity: orderitem.quantity - 1 };
        return updatedItem;
      }
      return orderitem;
    });

    // Update the state with the modified orderitems array
    setOrderItems(updatedItems);
  }

  const handlePlusOne = (index) => {
    // Create a new array with the updated quantity for the item
    const updatedItems = orderitems.map((orderitem, i) => {
      if (i === index) {
        // Increase the quantity of the selected item by 1
        const updatedItem = { ...orderitem, quantity: orderitem.quantity + 1 };
        return updatedItem;
      }
      return orderitem;
    });

    // Update the state with the modified orderitems array
    setOrderItems(updatedItems);
  }

  const handleRemove = async (bookid) => {
    try {
      const removeBook = await axios.post(`http://localhost:3001/api/User/tocart/${bookid}`, null, {
        headers: {
          Authorization: `Bearer ${loginedUser.acctoken}`
        }
      });
      alert(removeBook?.data?.message);
      const newBookIdCart = removeBook?.data?.cart;
      setOrderItems((prevItems) => {
        return prevItems.filter((item) => {return item._id !== bookid});
      });
      setUser((loginedUser) => ({...loginedUser, cart: newBookIdCart}));
    } catch (e) {
      if (e.response?.status === 401) {
        alert(`${e.response?.data?.error}`);
        navigate('/user/login');
      }
    }
  }

  useEffect(() => {
    setDisplayCart(orderitems);
  }, [orderitems]);

  return (
    <div className='container'>
      <div className='row'>
        <button className='btn d-flex' onClick={() => handleBackToStore()}> Back to store </button>
      </div>
      <div className='row'>
      {displayCart.length > 0 && displayCart.map((items, i) => (
        <div key={items._id} className='row d-flex'>
          <li>
          title: {items.title} , regularprice: {`${items.price.regularprice}`}, saleprice: {`${items.price.saleprice}`}
          <div className='btn'>
            <button onClick={() => handleMinusOne(i)} disabled={items.quantity === 1}> {'-'} </button>
          </div>
          { items.quantity }
          <div className='btn'>
            <button onClick={() => handlePlusOne(i)}> {'+'} </button>
          </div>
          <div className='btn'>
            <button onClick={() => handleRemove(items._id)}> {'Remove'} </button>
          </div>
          </li>
        </div>
      ))}
      {displayCart.length > 0 && 
      <div>
        <button className='btn d-flex' onClick={() => handlePopUpTrue()}> Make Order </button>
      </div>}
      {popup.show && showConfirm()}
      {displayCart.length === 0 && <p> No books in cart </p>}
      </div>
      
    </div>
  )
}

export default ShowCart;