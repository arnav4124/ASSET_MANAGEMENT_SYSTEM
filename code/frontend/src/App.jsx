import { useState } from 'react'
import SignUp from './components/SignUp/SignUp.jsx'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Login from './components/Login/Login.jsx'
import Navbar from './components/Navbar/Navbar.jsx'
import ProjectEdit from './components/Project/Project_edit.jsx'
import Project_add from './components/Project/Project_add.jsx'
function App() {
  const [isAdmin, setIsAdmin] = useState(false); 
  return (
    <BrowserRouter>
      <Navbar isAdmin={isAdmin} />
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/project/edit" element={<ProjectEdit />} />  
        <Route path="/project/add" element={<Project_add />} />  

      </Routes>
      {/* <button
  class="inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900">
  Button
</button> */}

    </BrowserRouter>
  )

}

export default App
