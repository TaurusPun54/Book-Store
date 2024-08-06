import React, { useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

// This will show the Cofirmation Box
const handleShowDeletePopUp = () => {
    setPopup({
      show: true,
    });
};

// This will perform the deletion and hide the Confirmation Box
const handleDeleteTrue = async () => {
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
const handleDeleteTextChange = () => {
  const { value } = event.target;
  setconfirmDelete(value);
}

function Popup({ popup, confirmtext, id, setPopup, navigate, setError, setconfirmDelete, handleDeleteFalse, handleDeleteTrue, handleDeleteTextChange}) {
  return (
    <div
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
    >
      <Modal.Dialog>
        <Modal.Header closeButton onClick={handleDeleteFalse(setPopup)}>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Please enter DELETE.</p>
          <input type="text" value={confirmtext || ''} onChange={(event) => handleDeleteTextChange(event, setconfirmDelete)} placeholder='DELETE'/>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteFalse(setPopup)}>cancell</Button>
          <Button variant="primary" className='btn btn-danger' onClick={() => handleDeleteTrue(popup, confirmtext, id, setPopup, navigate, setError)}>Confirm DELETE</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  )
}