import React from "react";
import Layout from "./layout";
import { useNavigate } from "react-router-dom"; 
import "../style/EnrolledProgram.css"; 

const EnrolledProgram = () => {
  const navigate = useNavigate(); 
  const title = "Enrolled Program";

  return (
    <div className="container">
      <Layout title={title} />
      <main className="content">
      <div className="card clickable-card" onClick={() => navigate("/course-content")}>
          <div className="image-placeholder">[Image]</div>
          <h2>Data Science</h2>
          <p>University of Toronto</p>
        </div>
      </main>
      <footer className="footer">@ocktiv 2025</footer>
    </div>
  );
};

export default EnrolledProgram;
