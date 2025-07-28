// src/components/adminDashboardNavbar.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdHome } from "react-icons/md";
import "../style/dashboardNavbar.css";

function AdminDashboardNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
  };

  const initials = user
    ? (user.firstName?.[0] || "") + (user.lastName?.[0] || "")
    : "";
  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "";

  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-navbar-left">
        <a href="https://ocktiv.com/">
          <img
            src="/img/WhiteLogoOnly.png"
            alt="Ocktiv Logo"
            className="dashboard-navbar-logo"
          />
        </a>
        <span className="dashboard-navbar-title">ADMIN Dashboard</span>
      </div>
      <div className="dashboard-navbar-right desktop-nav">
        <button
          className="dashboard-icon-btn"
          aria-label="Home"
          onClick={() => navigate("/admin-dashboard")}
        >
          <MdHome className="dashboard-icon" size={32} />
        </button>
        <span className="dashboard-user-initials">{initials}</span>
        <span className="dashboard-user-fullname">{fullName}</span>
        <button className="dashboard-navbar-login-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      {/* Apple Hamburger for mobile (if needed) */}
      <div
        className="dashboard-apple-hamburger"
        onClick={() => setMenuOpen(true)}
        tabIndex={0}
        aria-label="Open navigation"
        onKeyPress={e => { if (e.key === "Enter") setMenuOpen(true); }}
      >
        <span />
        <span />
        <span />
      </div>
      {menuOpen && (
        <div className="dashboard-apple-mobile-menu">
          <button
            className="dashboard-apple-menu-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >&times;</button>
          <ul>
            <li>
              <span
                className="dashboard-apple-menu-link"
                style={{ display: "flex", alignItems: "center" }}
                onClick={() => { setMenuOpen(false); navigate("/admin-dashboard"); }}
              >
                <MdHome className="dashboard-icon" style={{ marginRight: 8 }} size={16} />
                Home
              </span>
            </li>
            <li>
              <span className="dashboard-apple-menu-link dashboard-user-initials" style={{ marginRight: 8 }}>
                {initials}
              </span>{" "}
              {fullName}
            </li>
            <li>
              <button
                className="dashboard-apple-menu-link"
                style={{ background: "none", border: "none", color: "inherit" }}
                onClick={() => { setMenuOpen(false); handleLogout(); }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default AdminDashboardNavbar;
