import React, { useState } from "react";
import Content from "./content";
import CreateQuiz from "./CreateQuiz";
import "../style/instructorTabs.css";
import CourseNavbar from "./courseNavbar";

export default function InstructorTabs() {
  const [activeTab, setActiveTab] = useState("module");

  return (
    <div>
      <CourseNavbar />
      <div className="instructor-tabs-wrapper">
        <div className="instructor-tabs-buttons">
          <button
            className={`instructor-tab-btn ${activeTab === "module" ? "active" : ""}`}
            onClick={() => setActiveTab("module")}
          >
            Create a new module
          </button>
          <button
            className={`instructor-tab-btn ${activeTab === "quiz" ? "active" : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            Create a new Quiz
          </button>
        </div>

        <div className="instructor-tabs-content">
          {activeTab === "module" ? <Content /> : <CreateQuiz />}
        </div>
      </div>
    </div>
  );
}
