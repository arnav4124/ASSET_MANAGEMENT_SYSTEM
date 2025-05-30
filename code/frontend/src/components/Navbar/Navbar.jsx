import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import logo from "./logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("View Assets");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(!!token);
    setRole(userData ? userData.role : null);
    setFirstName(userData ? userData.first_name : "");
  }, [isLoggedIn]);

  useEffect(() => {
    const pathToTab = {
      "/dashboard/user": "Dashboard",
      "/admin/dashboard": "Dashboard",
      "/superuser/dashboard": "Dashboard",
      "/profile": "Profile",
      "/asset/view": "View Assets",
      "/project/view": "View Projects",
      "/admin/asset/view": "View Assets",
      "/admin/projects/view": "View Projects",
      "/admin/view_users": "View Users",
      "/admin/view_report": "View Report",
      "/admin/view_locations": "View Locations",
      "/admin/asset/add": "Add Asset",
      "/superuser/assign_admin": "Assign Admin",
      "/superuser/view_admin": "View Admin",
      "/superuser/view_programme": "View Programmes",
      "/superuser/view_location": "View Locations",
      "/superuser/view_category": "View Categories",
    };
    setActiveTab(pathToTab[location.pathname] || null);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const tabsToShow = role === "Superuser" ? [
    { name: "Dashboard", path: "/superuser/dashboard" },
    { name: "View Admin", path: "/superuser/view_admin" },
    { name: "View Programmes", path: "/superuser/view_programme" },
    { name: "View Locations", path: "/superuser/view_location" },
    { name: "View Categories", path: "/superuser/view_category" }
  ] : role === "Admin" ? [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "View Assets", path: "/admin/asset/view" },
    { name: "View Projects", path: "/admin/projects/view" },
    { name: "View Users", path: "/admin/view_users" },
    { name: "View Locations", path: "/admin/view_locations" },
    { name: "Add Asset", path: "/admin/asset/add" },
    {name : "View Report", path: "/admin/report"},
    {name: "View your assets", path: "user/assets/view"}
  ] : [
    // { name: "Dashboard", path: "/dashboard/user" },//path
    { name: "View Assets", path: "/user/assets/view" },//path
    { name: "View Projects", path: "/user/projects/view/" }//path
  ];

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center">
        <img
            src={logo}
            alt="Logo"
            className="h-10 w-auto cursor-pointer"
            onClick={() => navigate("/")}
          />
        <button className="ml-4 text-xl" onClick={() => setMenuOpen(!menuOpen)}></button>
      </div>
      <ul className={`flex space-x-6 ${menuOpen ? "block" : "hidden"} md:flex`}>
        {tabsToShow.map((tab) => (
          <li key={tab.name} className={activeTab === tab.name ? "font-bold" : ""}>
            <Link to={tab.path} onClick={() => setActiveTab(tab.name)} className="hover:underline">
              {tab.name}
            </Link>
          </li>
        ))}
      </ul>
      {isLoggedIn && (
        <div className="relative">
        <button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className="flex items-center text-gray-700 focus:outline-none"
        >
          <FaUserCircle size={30} />
          <span className="ml-2 text-gray-800 font-medium">{firstName}</span>
        </button>
        {profileDropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
            <Link
              to="/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200"
              onClick={() => setProfileDropdownOpen(false)}
            >
              View Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      
      )}
    </nav>
  );
};

export default Navbar;
