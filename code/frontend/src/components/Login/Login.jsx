import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const [recaptchaToken, setRecaptchaToken] = useState(null);
	const recaptchaRef = useRef(null);
  const [formData, setFormData] = useState({ email: '', password: '', recaptchaToken: '' });
  const [message, setMessage] = useState(null);
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleRecaptchaChange = (token) => {
		setRecaptchaToken(token);
    setFormData({ ...formData, recaptchaToken: token });
	}

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setMessage({ type: 'error', text: 'Please verify that you are not a robot.' });
			return;
		}
    try {
      const response = await axios.post('http://localhost:3487/api/user/login', formData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setMessage({ type: 'success', text: 'Login successful' });
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.status === 401 ? 'Invalid username or password. Please try again.' : 'Something went wrong. Please try again later.'
      });
    }
    finally
		{
			recaptchaRef.current.reset();
			setRecaptchaToken(null);
		}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
        {message && (
          <div className={`p-3 mb-4 rounded-md text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 font-semibold">Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-600 font-semibold">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <ReCAPTCHA
							sitekey="6Lc52PYqAAAAAHi2UQWbtiBRKzImnRmcnTBJc2zB"
							onChange={handleRecaptchaChange}
							ref={recaptchaRef}
						/>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
