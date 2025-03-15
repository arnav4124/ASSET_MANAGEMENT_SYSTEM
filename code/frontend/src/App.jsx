import { useState } from 'react'
import SignUp from './components/SignUp/SignUp.jsx'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Login from './components/Login/Login.jsx'
import Navbar from './components/Navbar/Navbar.jsx'
import ProjectEdit from './components/Project/Project_edit.jsx'
import Project_add from './components/Project/Project_add.jsx'
import Add_user from './components/Add_user/Add_user.jsx'
import Add_progrmme from './components/Programme/Add_programme.jsx'
import Add_location from './components/Location/Add_location.jsx'
import AssignAdmin from './components/Add_admin.jsx'
import AddAsset from './components/Asset/Asset_Add.jsx'
import ViewAsset from './components/Asset/View_asset.jsx'
import AssetDetails from './components/Asset/Asset_details.jsx'
import AdminDashboard from './components/Dashboard/AdminDashboard.jsx'
import SuperUserDashboard from './components/Dashboard/SuperUserDashboard.jsx'
import AddCategory from './components/Category/add_category.jsx'
import ViewUsers from './components/Add_user/View_users.jsx'
import ViewLocation from './components/Location/View_location.jsx'
import ViewProgramme from './components/Programme/View_programme.jsx'
import ViewCategory from './components/Category/view_category.jsx'
import ViewLocationsAdmin from './components/Location/View_Locations_Admin.jsx'
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
        <Route path="/admin/add_user" element={<Add_user />} />
        <Route path="/superuser/add_programme" element={<Add_progrmme />} />
        <Route path="/superuser/add_location" element={<Add_location />} />
        <Route path="/superuser/assign_admin" element={<AssignAdmin />} />
        <Route path="/admin/asset/add" element={<AddAsset />} />
        <Route path="/admin/asset/view" element={<ViewAsset />} />
        <Route path="/admin/assets/view/:id" element={<AssetDetails/>}/>
        <Route path="/admin/dashboard" element={<AdminDashboard/>} />
        <Route path='/superuser/dashboard' element={<SuperUserDashboard/>} />
        <Route path="/superuser/add_category" element={<AddCategory/>} />
        <Route path="/admin/view_users" element={<ViewUsers/>} />
        <Route path="/admin/view_locations" element={<ViewLocationsAdmin/>} />
        <Route path="/superuser/view_location" element={<ViewLocation/>} />
        <Route path="/superuser/view_category" element={<ViewCategory/>} />
        <Route path="/superuser/view_programme" element={<ViewProgramme/>} />
      </Routes>
      {/* <button
  class="inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900">
  Button
</button> */}

    </BrowserRouter>
  )
}

export default App
