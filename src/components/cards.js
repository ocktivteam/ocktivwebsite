import React from "react";
import { useNavigate } from "react-router-dom"; 
import "../App.css";
import { Mail, BookOpen, GraduationCap, DollarSign, Image } from "lucide-react";

const Cards = () => {
  const navigate = useNavigate(); 

  return (
    <div className="cards-container">
      
      <div className="card clickable-card" onClick={() => navigate("/messages")}>
        <Mail size={40} />
        <p>Messages</p>
      </div>

      
      <div className="card clickable-card" onClick={() => navigate("/course-shell")}>
        <BookOpen size={40} />
        <p>Course Shell</p>
      </div>

      
      <div className="card clickable-card" onClick={() => navigate("/academics")}>
        <GraduationCap size={40} />
        <p>Academics</p>
      </div>

      <div className="card clickable-card" onClick={() => navigate("/Finance")}>
        <DollarSign size={40} />
        <p>Finance</p>
      </div>

      <div className="card">
        <Image size={40} />
        <p>University Website</p>
        <span>Uni Logo</span>
      </div>
    </div>
  );
};

export default Cards;
