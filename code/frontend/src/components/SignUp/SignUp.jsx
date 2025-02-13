import React, { useState } from 'react';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    supervisor: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User Signed Up:', formData);
  };

  return (
    <div className="container">
      <h2 className="title">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>First Name</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Last Name</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>City</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Supervisor</label>
          <input type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn">Sign Up</button>
      </form>
      <div className='login-link'>
        <p>Already have an account?</p>
        <a href='/login'>Login</a>
      </div>
    </div>
  );
};

export default SignUp;
