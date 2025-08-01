import React, { useState } from "react";
import Content from "./content"; // Your module creation component
import CreateQuiz from "./CreateQuiz"; // New quiz form component
import "../style/adminTabs.css";
import CourseNavbar from "./courseNavbar"; // Keep consistent navbar

export default function InstructorTabs() {
  const [activeTab, setActiveTab] = useState("module");

  return (
    <div>
      <CourseNavbar />
      <div className="admin-tabs-wrapper">
        <div className="admin-tabs-buttons">
          <button
            className={`admin-tab-btn ${activeTab === "module" ? "active" : ""}`}
            onClick={() => setActiveTab("module")}
          >
            Create a new module
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "quiz" ? "active" : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            Create a new Quiz
          </button>
        </div>

        <div className="admin-tabs-content">
          {activeTab === "module" ? <Content /> : <CreateQuiz />}
        </div>
      </div>
    </div>
  );
}
