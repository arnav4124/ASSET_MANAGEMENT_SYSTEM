import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './eklavya_logo.png';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [logoPosition, setLogoPosition] = useState('center'); // 'center' or 'left'
  const [textVisible, setTextVisible] = useState(false);
  const [currentText, setCurrentText] = useState(0);
  const rotatingTexts = ["assets", "projects", "users"];

  useEffect(() => {
    // Start logo animation after component mounts
    const logoTimer = setTimeout(() => {
      setLogoPosition('left');
      
      // Show text only after logo has moved to the left
      const textTimer = setTimeout(() => {
        setTextVisible(true);
      }, 1000); // Wait for 1s after logo animation starts
      
      return () => clearTimeout(textTimer);
    }, 1000);
    
    return () => clearTimeout(logoTimer);
  }, []);

  useEffect(() => {
    if (textVisible) {
      const interval = setInterval(() => {
        setCurrentText((prev) => (prev + 1) % rotatingTexts.length);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [textVisible]);

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      {/* Logo positioned absolutely relative to the entire page */}
      <div 
        className="transition-all duration-1000 ease-in-out absolute z-10"
        style={{
          top: logoPosition === 'center' ? '50vh' : '1rem',
          left: logoPosition === 'center' ? '50vw' : '1rem',
          transform: logoPosition === 'center' ? 'translate(-50%, -50%)' : 'translate(0, 0)',
          width: logoPosition === 'center' ? '10rem' : '6rem',
          height: logoPosition === 'center' ? '10rem' : '4rem',
        }}
      >
        <div className="w-full h-full bg-blue-600 flex items-center justify-center p-2 rounded shadow-md">
          <img 
            src={logo}
            alt="AMS Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      {/* Header with official website link */}
      <header className="w-full flex justify-end items-center p-4 relative">
        {/* Official website link */}
        <a 
          href="https://www.eklavya.in/" 
          className={`text-blue-600 hover:text-blue-800 font-medium transition-opacity duration-1000 ${
            logoPosition === 'left' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Go to Official Website →
        </a>
      </header>
      
      <main className="flex-grow flex justify-between items-center p-8 max-w-6xl mx-auto w-full">
        {/* Main content with improved entrance animation */}
        <div className={`transition-all duration-1000 ease-out space-y-6 max-w-lg ${
          textVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-24"
        }`}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Welcome to
            <span className="block text-blue-600">Asset Management System</span>
          </h1>
          
          <div className="text-xl md:text-2xl text-gray-700">
            Manage <span className="font-bold text-blue-600 inline-block min-w-24 transition-all duration-500 ease-in-out">{rotatingTexts[currentText]}</span> 
            with ease and efficiency
          </div>
          
          <p className="text-gray-600">
            Streamline your organization's resource management with our comprehensive 
            asset tracking solution. Get started now!
          </p>
        </div>
        
        {/* Login button section with improved entrance animation */}
        <div className={`transition-all duration-1000 ease-out ${
          textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}>
          <button 
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 text-lg"
          >
            Login
          </button>
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;