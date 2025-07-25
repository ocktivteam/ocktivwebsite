import React from "react";
import DashboardNavbar from "./dashboardNavbar";
import CourseNavbar from "./courseNavbar";

export default function Assignment() {
  return (
    <div>
      <CourseNavbar />
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
          fontSize: "1.3rem",
          color: "#555",
        }}
      >
        No assignments for this course.
      </div>
    </div>
  );
}