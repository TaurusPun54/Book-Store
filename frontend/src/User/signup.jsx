import React, { useState } from 'react';
import axios from 'axios';

function Signup () {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [address, setAddress] = useState();
  const [age, setAge] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    age: 1
  })
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (age <= 0 || !Number.isSafeInteger(age)) {
      setError('age should be larger than 0');
      return;
    }
    try {
      const signupSuccess = await axios.post('http://localhost:3001/api/User/signup', {name, email, password, address, age});
      setError('');
      setResponse(signupSuccess.data.message);
    } catch (e) {
      setError(e?.response?.data?.error);
    }
  };

  return (
    <div>
      <h2>Signup Page</h2>
      <br />
      <div>
          <label htmlFor="name">Name :&nbsp;</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            placeholder="Enter name"
            onChange={(e) => {
              setForm({...form, mame: e?.target?.value })
            }}
          />
        </div>
        <br />
        <div>
          <label htmlFor="email">Email :&nbsp;</label>
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
          <label htmlFor="password">Password :&nbsp;</label>
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
        <div>
          <label htmlFor="address">Address :&nbsp;</label>
          <input
            type="text"
            id="address"
            name="address"
            value={address}
            placeholder="Enter address"
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <br />
        <div>
          <label htmlFor="age">Age :&nbsp;</label>
          <input
            type="number"
            id="age"
            name="age"
            value={age}
            placeholder="Enter age"
            onChange={(e) => {
              let rawValue = e?.target?.value ?? 1
              if (rawValue < 1) rawValue = 1
              if (rawValue > Number.MAX_SAFE_INTEGER) rawValue = Number.MAX_SAFE_INTEGER
              if (!Number.isInteger(rawValue)) rawValue = Math.round(rawValue)
              setAge(rawValue)
            }}
          />
        </div>
        <br />
        <button onClick={handleSubmit}>Signup</button>
        {error && <div>{error}</div>}
        {response && <div>{response}</div>}
    </div>
  );
}

export default Signup;