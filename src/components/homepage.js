import React from "react";
import { Menu, Bell, User } from "lucide-react";
import "../App.css";
import Cards from "./cards";
import Logo from "../img/logo-with-name.svg";
import { useNavigate } from "react-router-dom";
//import axios from "axios";

const Homepage = () => {
  const navigate = useNavigate();
  const handleLogout = () => {

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <header className="header">

        <button className="icon-button">
          <Menu size={28} />
        </button>


        <div className="logo-container">
          <img
            src={Logo}
            alt="Ocktiv Logo"
            className="logo"
          />
        </div>


        <div className="icons-container">
          <button className="icon-button">
            <Bell size={24} />
          </button>
          <button className="icon-button">
            <User size={24} />
          </button>
        </div>
      </header>


      <Cards />
      <div className="logout-button-container" onClick={handleLogout}>
        <button className="logout-button">Logout</button>

      </div>

    </div>
  );
};

export default Homepage;

