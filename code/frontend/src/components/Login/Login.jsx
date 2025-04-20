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
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setFormData({ ...formData, recaptchaToken: token });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading || isSuccess}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 ${(isLoading || isSuccess) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  <button 
                    type="button" 
                    onClick={togglePasswordVisibility}
                    disabled={isLoading || isSuccess}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
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