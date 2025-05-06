"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaWallet,
  FaChartLine,
  FaSignOutAlt,
  FaUser,
  FaCog,
  FaQuestionCircle,
  FaBars,
  FaTimes,
  FaHome,
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navigateToProfile = () => {
    navigate("/profile");
    setShowDropdown(false);
  };

  const navigateToSettings = () => {
    navigate("/settings");
    setShowDropdown(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-logo">
          <FaWallet className="logo-icon" /> SpendWise
        </a>

        <button className="navbar-mobile-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-links ${mobileMenuOpen ? "open" : ""}`}>
          <a href="/" className="nav-link active">
            <FaHome className="nav-link-icon" /> Dashboard
          </a>
          <a href="/ExpTrack" className="nav-link">
            <FaChartLine className="nav-link-icon" /> Expenses
          </a>
          <a href="/Analytics" className="nav-link">
            <FaChartLine className="nav-link-icon" /> Analytics
          </a>
          <a href="/BudgetTab" className="nav-link">
            <FaWallet className="nav-link-icon" /> Budget
          </a>
        </div>

        <div className="navbar-profile">
          <div className="profile-icon" onClick={toggleDropdown}>
            {user && user.photoURL ? (
              <img
                src={user.photoURL || "/placeholder.svg"}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              getInitials(user?.displayName || user?.email)
            )}
          </div>

          {showDropdown && (
            <div className="profile-dropdown">
              <a href="#" className="dropdown-item" onClick={navigateToProfile}>
                <FaUser className="dropdown-icon" /> Profile
              </a>
              <a
                href="#"
                className="dropdown-item"
                onClick={navigateToSettings}
              >
                <FaCog className="dropdown-icon" /> Settings
              </a>
              <a href="/help" className="dropdown-item">
                <FaQuestionCircle className="dropdown-icon" /> Help
              </a>
              <a href="#" className="dropdown-item" onClick={onLogout}>
                <FaSignOutAlt className="dropdown-icon" /> Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
