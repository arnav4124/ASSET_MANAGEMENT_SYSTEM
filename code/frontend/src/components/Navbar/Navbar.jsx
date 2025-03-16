import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isAdmin }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Inbox");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const userTabs = [
    { name: "Inbox", path: "/" },
    { name: "View Your Assets", path: "/asset/view" },
    { name: "View Your Projects", path: "/project/edit" },
    { name: "Requests", path: "/requests" },
    { name: "Profile", path: "/profile" },
    { name: "Logout", path: "/login" },
  ];

  const adminTabs = [
    { name: "View All Projects", path: "/admin/projects" },
    { name: "View All Assets", path: "/admin/assets" },
    { name: "Add Asset", path: "/admin/asset/add" },
    { name: "Asset List", path: "/admin/assets/list" },
    { name: "People", path: "/admin/people" },
    { name: "Licenses", path: "/admin/licenses" },
  ];

  const tabsToShow = isAdmin ? [ ...adminTabs,...userTabs] : userTabs;

  return (
    <nav className="navbar">
      <div className="nav-header">
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        {tabsToShow.map((tab) => (
          <li key={tab.name} className={activeTab === tab.name ? "active" : ""}>
            {tab.name === "Logout" ? (
              <span onClick={handleLogout}>{tab.name}</span>
            ) : (
              <Link to={tab.path} onClick={() => setActiveTab(tab.name)}>
                {tab.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
