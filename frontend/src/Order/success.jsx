import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Success () {
  const navigate = useNavigate();
  return (
    <div className='container'>
      <p>
        Success.
      </p>
      <button className='btn d-flex' onClick={() => navigate('/book/search')}> Back to Store </button>
    </div>
  )
}

export default Success;