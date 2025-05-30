import { useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import SignUp from './components/SignUp/SignUp.jsx'
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
import AssignAsset from './components/Asset/Assign_Asset.jsx'
import Footer from './components/Footer/Footer.jsx'
import Profile from './components/Profile/Profile.jsx'
import WelcomePage from './components/Welcome/welcome.jsx'
import ViewProject from './components/Project/Project_view.jsx'
import ProjectDetails from './components/Project/Project_details.jsx'
import View_admin from './components/View_admin.jsx'
import View_asset_for_user from './components/Asset/View_asset_for_user.jsx'
import EditUser from './components/Add_user/Edit_user.jsx'
import View_your_project from './components/Project/View_your_project.jsx'
import NotFound from './wrong.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import AssetReport from './components/Report/AssetReport.jsx'
import AssetEdit from './components/Asset/Asset_edit.jsx'
import Asset_maintenance from './components/Asset/Asset_maintenance.jsx'
import Edit_maintenance from './components/Asset/Edit_maintenance.jsx'
import ViewPendingMaintenance from './components/Dashboard/ViewAll/ViewPendingMaintenance.jsx'
import ViewApproachingWarranty from './components/Dashboard/ViewAll/ViewApproachingWarranty.jsx'
import ViewApproachingInsurance from './components/Dashboard/ViewAll/ViewApproachingInsurance.jsx'
import Asset_history from './components/Asset/Asset_history.jsx'
function Layout({ children }) {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/login']; // Paths where Navbar should be hidden
  const showNavbar = !hideNavbarPaths.includes(location.pathname); // Show navbar only if not in these paths

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/project/edit/:id" element={<ProjectEdit />} />
            <Route path="admin/project/add" element={<Project_add />} />
            <Route path="/admin/projects/view" element={<ViewProject />} />
            <Route path="/admin/projects/view/:id" element={<ProjectDetails />} />
            <Route path="/admin/add_user" element={<Add_user />} />
            <Route path="/superuser/add_programme" element={<Add_progrmme />} />
            <Route path="/superuser/add_location" element={<Add_location />} />
            <Route path="/superuser/assign_admin" element={<AssignAdmin />} />
            <Route path="/admin/asset/add" element={<AddAsset />} />
            <Route path="/admin/asset/view" element={<ViewAsset />} />
            <Route path="/admin/assets/view/:id" element={<AssetDetails />} />
            <Route path="/admin/assets/edit/:id" element={<AssetEdit />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/superuser/dashboard" element={<SuperUserDashboard />} />
            <Route path="/superuser/add_category" element={<AddCategory />} />
            <Route path="/admin/view_users" element={<ViewUsers />} />
            <Route path="/admin/edit_user/:userId" element={<EditUser />} />
            <Route path="/admin/view_locations" element={<ViewLocationsAdmin />} />
            <Route path="/superuser/view_location" element={<ViewLocation />} />
            <Route path="/superuser/view_category" element={<ViewCategory />} />
            <Route path="/superuser/view_programme" element={<ViewProgramme />} />
            <Route path="/superuser/view_admin" element={<View_admin />} />
            <Route path="/admin/assets/assign_asset/:id" element={<AssignAsset />} />
            <Route path="/admin/assets/maintenance/:id" element={<Asset_maintenance />} />
            <Route path="/admin/assets/edit-maintenance/:id" element={<Edit_maintenance />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/assets/view/" element={<View_asset_for_user />} />
            <Route path="/user/projects/view/" element={<View_your_project />} />
            <Route path="/admin/report" element={< AssetReport />} />
            <Route path="/admin/assets/history/:id" element={<Asset_history />} />
            <Route path="/admin/view-pending-maintenance" element={<ViewPendingMaintenance />} />
            <Route path="/admin/view-approaching-warranty" element={<ViewApproachingWarranty />} />
            <Route path="/admin/view-approaching-insurance" element={<ViewApproachingInsurance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;