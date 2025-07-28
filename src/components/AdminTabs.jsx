// src/components/AdminTabs.jsx

import React, { useState } from "react";
import "../style/adminTabs.css";
import RegisterInstructorForm from "./RegisterInstructorForm";
import CreateCourseForm from "./CreateCourseForm";
import AdminDashboardNavbar from "./adminDashboardNavbar"; 

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState("instructor");

  return (
    <div>
      <AdminDashboardNavbar /> {/* NAVBAR */}
      <div className="admin-tabs-wrapper">
        <div className="admin-tabs-buttons">
          <button
            className={`admin-tab-btn ${activeTab === "instructor" ? "active" : ""}`}
            onClick={() => setActiveTab("instructor")}
          >
            Register a new Instructor
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "course" ? "active" : ""}`}
            onClick={() => setActiveTab("course")}
          >
            Create a new course
          </button>
        </div>

        <div className="admin-tabs-content">
          {activeTab === "instructor" ? <RegisterInstructorForm /> : <CreateCourseForm />}
        </div>
      </div>
    </div>
  );
}
