import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState({});
  const [error, setError] = useState('');

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    setError('');
    setResponse('');
    try {
      const response = await axios.post('http://localhost:3001/api/User/login', {email, password}, { withCredentials: true });
      const { loginedUser } = response.data;
      alert(`Welcome, ${loginedUser.name}`);
      navigate('/book/search', {
        state: {
          loginedUser,
        }
      })
    } catch (e) {
      setError(e.response?.data?.error);
  };
  }

  const handleClear = () => {
    setResponse('');
    setError('');
  }

  return (
    <div>
      <h2>Login Page</h2>
      <br />
      <div>
        <label htmlFor="email">Email :</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <br />
      <div>
        <label htmlFor="password">Password :</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <br />
      <button className="btn btn-primary btn-block mb-4" onClick={handleSubmit}>Login&nbsp;</button> <button onClick={handleClear}>Clear</button>
      <br />
      {error && <div>{error}</div>}
      {Object.keys(response).length > 0 && (
        <div>
          <ul>
          <h2>Login User:</h2>
            Id: {response.id}
            <br />
            Role: {response.role}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Login;