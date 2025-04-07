import React from "react";
import "../style/layout.css";
import logo from "../img/logo.svg";


const Layout = ({ title }) => {
  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      
      <div className="header-title">
        <h1>{title}</h1> 
      </div>

      <button className="menu-btn">&#9776;</button> 
    </header>
  );
};

export default Layout;
