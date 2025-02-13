import React, { useState } from "react";
import "./Navbar.css";

const Navbar = ({ isAdmin }) => {
  const [activeTab, setActiveTab] = useState("Inbox");
  const [menuOpen, setMenuOpen] = useState(false);

  const userTabs = [
    "Inbox",
    "View Your Assets",
    "View Your Projects",
    "Requests",
    "Profile",
  ];

  const adminTabs = [
    "View All Projects",
    "View All Assets",
    "Add Asset",
    "Asset List",
    "People",
    "Licenses",
  ];

  const tabsToShow = isAdmin ? [...userTabs, ...adminTabs] : userTabs;

  return (
    <nav className="navbar">
      <div className="nav-header">
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        {tabsToShow.map((tab) => (
          <li
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
