import React from "react";
import { Link } from "react-router-dom";
import "../style/Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-links">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/video" className="nav-link">Lectures</Link>
          <Link to="/News" className="nav-link">News</Link>
          <Link to="/Evaluation" className="nav-link">Evaluation</Link>
          <Link to="/Grades" className="nav-link">Gradebook</Link>
          <Link to="/Discussion" className="nav-link">Discussions</Link>
          <Link to="/Groups" className="nav-link">Groups</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
