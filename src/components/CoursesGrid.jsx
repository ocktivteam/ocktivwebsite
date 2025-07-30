import React from "react";
import { MdDelete, MdEdit, MdMenuBook, MdInfoOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom"; // <--- ADD THIS LINE
import "../style/coursesGrid.css";

function getInstructorName(selectedInstructor, instructors) {
  if (!selectedInstructor || !Array.isArray(instructors)) return null;
  const found = instructors.find(i => i._id === selectedInstructor);
  if (!found) return null;
  if (found.firstName && found.lastName) return `${found.firstName} ${found.lastName}`;
  if (found.fullName) return found.fullName;
  if (found.name) return found.name;
  if (found.email) return found.email;
  return "Professor";
}

function CoursesGrid({ selectedInstructor, instructors = [], courses = [], onDeleteCourse, search = "" }) {
  const navigate = useNavigate(); // <--- ADD THIS LINE

  let filteredCourses = courses;

  // Only filter by selected instructor if NOT currently searching
  const searching = !!search.trim();

  if (!searching && selectedInstructor) {
    filteredCourses = filteredCourses.filter(course =>
      (course.instructors || []).some(
        id =>
          (typeof id === "string" && id === selectedInstructor) ||
          (id && id._id === selectedInstructor)
      )
    );
  }

  // --- Header logic ---
  let header = "(Professor's) Courses";
  const instructorName = getInstructorName(selectedInstructor, instructors);
  if (!searching && selectedInstructor && instructorName) {
    header = `${instructorName}'s Courses`;
  } else if (searching) {
    header = "Search Results";
  } else if (!selectedInstructor) {
    header = "All Courses";
  }

  // ===== DELETE LOGIC =====
  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure to delete this course?")) return;
    try {
      const baseUrl =
        window.location.hostname === "localhost"
          ? "http://localhost:5050/api/courses"
          : "https://ocktivwebsite-3.onrender.com/api/courses";
      await fetch(`${baseUrl}/${courseId}`, { method: "DELETE" });
      onDeleteCourse && onDeleteCourse(courseId);
    } catch {
      alert("Delete failed!");
    }
  };

  // for the 2 buttons - course details and course shell
  const FRONTEND_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://ocktivwebsite.vercel.app";

  return (
    <div className="coursesgrid-container">
      <div className="coursesgrid-header-row">
        <h2 className="coursesgrid-title">
          {header} <span className="coursesgrid-count">({filteredCourses.length})</span>
        </h2>
        <button
          className="coursesgrid-add-btn"
          title="Add New Course"
          onClick={() => navigate("/admin/create")}
        >
          +
        </button>
      </div>
      <div className="coursesgrid-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              className="coursesgrid-card"
              key={course._id}
              onClick={() => navigate(`/course/${course._id}`)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={course.imageUrl || "/img/ocktivLogo.png"}
                alt="Course"
                className="coursesgrid-logo"
              />
              <div className="coursesgrid-card-title">{course.courseTitle}</div>
              <div className="coursesgrid-card-instructor">
                By {course.instructorName || course.instructorNames || ""}
              </div>
              <div className="coursesgrid-actions">
                <button
                  className="coursesgrid-edit-btn"
                  onClick={e => {
                    e.stopPropagation();
                    navigate(`/admin/edit-course/${course._id}`); 
                  }}
                  title="Edit Course"
                >
                  <MdEdit size={24} color="black" />
                </button>
                <button
                  className="coursesgrid-delete-btn"
                  onClick={e => {
                    e.stopPropagation();    // <--- So clicking delete does NOT trigger navigation
                    handleDelete(course._id);
                  }}
                  title="Delete Course"
                >
                  <MdDelete size={24} color="red" />
                </button>
                <MdInfoOutline
                  size={24}
                  title="View Course Details"
                  style={{ cursor: "pointer", marginLeft: "6px"}}
                  onClick={e => {
                    e.stopPropagation();
                    window.open(`${FRONTEND_URL}/coursedetails/${course._id}`, "_blank");
                  }}
                />
                <MdMenuBook 
                  size={24}
                  title="Open Course Shell"
                  style={{ cursor: "pointer", marginLeft: "6px", color: "#0d4f95" }}
                  onClick={e => {
                    e.stopPropagation();
                    window.open(`${FRONTEND_URL}/course/${course._id}`, "_blank");
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="coursesgrid-no-results">No courses found.</div>
        )}
      </div>
    </div>
  );
}

export default CoursesGrid;
