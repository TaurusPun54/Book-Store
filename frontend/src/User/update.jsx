import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function Update() {
  const { userId } = useParams() ?? '';
  const [updateBody, setUpdate] = useState({});
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState([]);
  
  const [popup, setPopup] = useState({
    show: false, // initial values set to false and null,
  });
  const [confirmDelete, setconfirmDelete] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://localhost:3001/api/User/${userId}`);
          const data = res?.data;
          console.log(data);
          setUserData(data);
          //console.log(data);
    };
    fetchData()
  }, [userId]); // Empty dependency array to run the effect only once, if userId not change, useEffect will not do again.

  const handleUpdateBodyChange = (event) => {
    const { name, value } = event.target;
    setUpdate((prevQuery) => ({ ...prevQuery, [name]: value }));
    setResponse('');
    setError('');
  }
  
  const handleUpdate = async() => {
    setError('');
    if (!updateBody.checkpassword || updateBody.checkpassword === '') {
      setError('Please enter current password');
    }
    console.log(updateBody.checkpassword);
    if (updateBody.checkpassword !== '' && updateBody.checkpassword) {
      try {
        const updateSuccess = await axios.put(`http://localhost:3001/api/User/${userId}`, updateBody);
        setResponse(updateSuccess?.data?.message);
      } catch (e) {
        setError(e.response?.data?.error);
        // console.log(e.response?.data?.error)
      }
    } 
  }

  // This will show the Cofirmation Box
const handleShowDeletePopUp = () => {
  setPopup({
    show: true,
  });
};

// This will perform the deletion and hide the Confirmation Box
const handleDeleteTrue = async (confirmText, id) => {
if (popup.show && confirmText === 'DELETE') {
  try {
    setPopup({
      show: false,
    });
    const deleteSuccess = await axios.delete(`http://localhost:3001/api/User/${id}`);
    alert(deleteSuccess?.data?.message);
    navigate(`/user/search`);
  } catch (e) {
    setError(e.response?.data?.error);
  }
}
};

// This will just hide the Confirmation Box when user clicks "No"/"Cancel"
const handleDeleteFalse = () => {
setPopup({
  show: false,
});
};

// This will update the confirm delete text
const handleDeleteTextChange = (event) => {
const { value } = event.target;
setconfirmDelete(value);
}

  return (
    <div>
      <br />
      <div>
        <label>
          new Name :&nbsp;
          <input
            type="text"
            name="name"
            value={updateBody.name || userData.name}
            onChange={handleUpdateBodyChange}
            placeholder="Enter new name"
          />
        </label>
      </div>
      <br />
      <div>
        <label>
          new email :&nbsp;
          <input
            type="email"
            name="email"
            value={updateBody.email || userData.email}
            onChange={handleUpdateBodyChange}
            placeholder="Enter new email"
          />
        </label>
      </div>
      <br />
      <div>
        <label>
          new Age :&nbsp;
          <input
            type="text"
            name="age"
            value={updateBody.age || userData.age}
            onChange={handleUpdateBodyChange}
            placeholder="Enter new age"
          />
        </label>
      </div>
      <br />
      <div>
        <label>
          new Address :&nbsp;
          <input
            type="text"
            name="address"
            value={updateBody.address || userData.address}
            onChange={handleUpdateBodyChange}
            placeholder="Enter new address"
          />
        </label>
      </div>
      <br />
      <div>
        <label>
          current Password :&nbsp;
          <input
            type="password"
            name="checkpassword"
            value={updateBody.checkpassword || ''}
            onChange={handleUpdateBodyChange}
            placeholder="Enter current password"
          />
        </label>
      </div>
      <br />
      <div>
        <label>
          new Password :&nbsp;
          <input
            type="password"
            name="password"
            value={updateBody.password || ''}
            onChange={handleUpdateBodyChange}
            placeholder="Enter new password"
          />
        </label>
      </div>
      <br />
      <button className='btn btn-primary' onClick={handleUpdate}>Update</button>
      <br />
      <br />
      <button className='btn btn-danger' onClick={() => handleShowDeletePopUp(setPopup)}>DELETE</button>
      {response && <div>{response}</div>}
      {error && <div>{error}</div>}
      {popup.show && 
      <div
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
      >
      <Modal.Dialog>
        <Modal.Header closeButton onClick={handleDeleteFalse}>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Please enter DELETE.</p>
          <input type="text" value={confirmDelete || ''} onChange={handleDeleteTextChange} placeholder='DELETE'/>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteFalse}>cancell</Button>
          <Button variant="primary" className='btn btn-danger' onClick={() => handleDeleteTrue(confirmDelete, userId)}>Confirm DELETE</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>}
    </div>
  );
  
}

export default Update;