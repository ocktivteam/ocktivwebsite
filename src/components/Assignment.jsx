import React from "react";
import DashboardNavbar from "./dashboardNavbar";
import CourseNavbar from "./courseNavbar";
import { useSessionCheck } from "../hooks/useSessionCheck"; // Add this import

export default function Assignment() {
  useSessionCheck(); // Add this line - protects the route

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