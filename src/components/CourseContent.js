import React, { useState } from "react";
import Layout from "./layout";
import "../style/CourseContent.css";
import { Link } from "react-router-dom";

//course data with course names
const courses = [
  { id: 1, name: "COMP 123" },
  { id: 2, name: "COMP 122" },
  { id: 3, name: "COMP 124" },
  { id: 4, name: "COMP 125" },
  { id: 5, name: "COMP 126" },
  { id: 6, name: "COMP 127" },
];

const CourseContent = () => {
  const [viewMode, setViewMode] = useState("card"); //default view is card view
  const title = "Course Contents";

  const handleViewToggle = () => {
    
    setViewMode(viewMode === "card" ? "list" : "card");
  };

  return (
    <div>
      <Layout title={title} />
      <div className="view-toggle">
        <button onClick={handleViewToggle}>
          {viewMode === "card" ? "Switch to List View" : "Switch to Card View"}
        </button>
      </div>

      <div className={viewMode === "card" ? "course-container card-view" : "course-container list-view"}>
        {courses.map((course) => (
          <Link to={`/course/${course.name.toLowerCase()}`} key={course.id} className="course-item">
            <div className={viewMode === "card" ? "course-card" : "course-list-item"}>
              {viewMode === "card" && (
                <img src="/img/placeholder-image.png" alt={course.name} className="course-img" />
              )}
              <p>{course.name}</p>
            </div>
          </Link>
        ))}
      </div>

      <footer className="footer">@ocktiv 2025</footer>
    </div>
  );
};

export default CourseContent;
