import React, { useState } from "react";
import Content from "./content";
import CreateQuiz from "./CreateQuiz";
import "../style/instructorTabs.css";
import CourseNavbar from "./courseNavbar";

export default function InstructorTabs() {
  // You can default to "module" or "quiz"
  const [activeTab, setActiveTab] = useState("module");

  return (
    <div>
      <CourseNavbar />
      <div className="instructor-tabs-wrapper">
        {/* You asked to REMOVE THE BUTTONS HERE */}
        {/* Tab navigation is gone! */}

        {/* You can switch activeTab programmatically if needed */}
        <div className="instructor-tabs-content">
          {activeTab === "module" ? <Content /> : <CreateQuiz />}
        </div>
      </div>
    </div>
  );
}
