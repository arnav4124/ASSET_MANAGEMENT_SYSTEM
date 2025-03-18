import React from 'react';
import logo from './mango.png';
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full flex flex-col-reverse md:flex-row items-center justify-between">
        <div className="w-full md:w-7/12 md:pr-10 text-center md:text-left mt-8 md:mt-0">
          <h2 className="text-8xl font-bold text-yellow-400 leading-none mb-4">404</h2>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Oops! Page not found</h1>
          <p className="text-lg text-gray-600 mb-8">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable. Don't worry, even our mango is sad about it!
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-yellow-400 text-gray-800 font-semibold rounded-full hover:bg-yellow-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            Go back home
          </button>
        </div>
        <div className="w-full md:w-5/12 flex justify-center">
          <img 
            src={logo} 
            alt="Sad mango character" 
            className="w-56 md:w-64 lg:w-72"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;