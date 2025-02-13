import { useState } from 'react'
import SignUp from './components/SignUp/SignUp.jsx'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Login from './components/Login/Login.jsx'
import Navbar from './components/Navbar/Navbar.jsx'

function App() {
  const [isAdmin, setIsAdmin] = useState(false); 
  return (
    <BrowserRouter>
      <Navbar isAdmin={isAdmin} />
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
