import React, { useState } from 'react';
import axios from 'axios';

function Delete() {
  const [id, setId] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const handleIdChange = (event) => {
    const id = event.target.value;
    setId(id);
    setError('');
    setResponse('');
  }

  const handledelete = async() => {
    if (id.length !== 24) {
      setError('Id must be a string of length 24');
      return;
    }
    try {
      const deleteSuccess = await axios.delete(`http://localhost:3001/api/User/${id}`);
      setResponse(deleteSuccess?.data?.message);
    } catch (e) {
      setError(e.response?.data?.error);
    } 
  }

  return (
    <div>
      <div>
        <label>
          User Id :&nbsp;
          <input
            type="text"
            name="id"
            value={id}
            onChange={handleIdChange}
            placeholder="Enter user id to delete"
          />
        </label>
      </div>
      <br />
      <button onClick={handledelete}>Delete</button>
      <br />
      {response && <div>{response}</div>}
      {error && <div>{error}</div>}
    </div>
  );
}

export default Delete;