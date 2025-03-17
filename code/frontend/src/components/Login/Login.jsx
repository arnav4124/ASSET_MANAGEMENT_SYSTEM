import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import logo from './eklavya_logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const [formData, setFormData] = useState({ email: '', password: '', recaptchaToken: '' });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setFormData({ ...formData, recaptchaToken: token });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setMessage({ type: 'error', text: 'Please verify that you are not a robot.' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:3487/api/user/login', formData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setMessage({ type: 'success', text: 'Login successful' });
        setIsSuccess(true);

        // get user from local storage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role === 'Superuser') {
          setTimeout(() => navigate('/superuser/dashboard'), 1500);
        } else if (user.role === 'Admin') {
          setTimeout(() => navigate('/admin/dashboard'), 1500);
        } else {
          setTimeout(() => navigate('/profile'), 1500);
        }
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.status === 401 ? 'Invalid username or password. Please try again.' : 'Something went wrong. Please try again later.'
      });
    } finally {
      if (!isSuccess) {
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl flex bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Section */}
        <div className="w-1/2 bg-blue-500 flex flex-col justify-center items-center p-10 text-white">
          <h1 className="text-3xl font-bold">WELCOME BACK</h1>
          <p className="mt-4 text-center text-lg max-w-md">
            Nice to see you again. Login to access your account and continue your journey.
          </p>
        </div>
        {/* Right Section */}
        <div className="w-1/2 flex justify-center items-center p-10">
          <div className="max-w-sm w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login Account</h2>
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
                  disabled={isLoading || isSuccess}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 ${(isLoading || isSuccess) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                  disabled={isLoading || isSuccess}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 ${(isLoading || isSuccess) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey="6Lc52PYqAAAAAHi2UQWbtiBRKzImnRmcnTBJc2zB"
                  onChange={handleRecaptchaChange}
                  ref={recaptchaRef}
                  disabled={isLoading || isSuccess}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full text-white py-2 rounded-lg transition ${isSuccess ? 'bg-green-600 cursor-not-allowed' : isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isLoading ? 'Logging in...' : isSuccess ? 'Success! Redirecting...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;