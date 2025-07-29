// src/components/EnrolledProgram.jsx

import React, { useEffect, useState } from "react";
import DashboardNavbar from "./dashboardNavbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/EnrolledProgram.css";
import { useSessionCheck } from '../hooks/useSessionCheck';

const ENROLL_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/enrollment"
    : "https://ocktivwebsite-3.onrender.com/api/enrollment";

const COURSE_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/courses"
    : "https://ocktivwebsite-3.onrender.com/api/courses";

const EnrolledProgram = () => {
  useSessionCheck();
  
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [user, setUser] = useState(null);

  const perPage = 9;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    let userObj = null;
    try {
      userObj = JSON.parse(localStorage.getItem("user"));
    } catch {
      userObj = null;
    }
    setUser(userObj);

    if (!token || !userObj || !userObj._id) {
      setError("You must be logged in to see your courses.");
      setLoading(false);
      return;
    }

    // If instructor, fetch courses they teach
    if (userObj.role === "instructor") {
      setLoading(true);
      axios
        .get(COURSE_API, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const assigned = (res.data.courses || res.data || []).filter(
            c => Array.isArray(c.instructors) && c.instructors.some(i =>
              i === userObj._id || i?._id === userObj._id
            )
          );
          
          setInstructorCourses(assigned);
          setLoading(false);
        })
        .catch(() => {
          setError("Unable to fetch courses.");
          setInstructorCourses([]);
          setLoading(false);
        });
    } else {
      // Otherwise, fetch enrollments (for students)
      setLoading(true);
      axios
        .get(`${ENROLL_API}/user/${userObj._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setEnrollments(res.data.enrollments || []);
          setLoading(false);
        })
        .catch(() => {
          setError("Unable to fetch your courses.");
          setEnrollments([]);
          setLoading(false);
        });
    }
  }, []);

  // Determine courses to show based on role
  let displayCourses = [];
  if (user?.role === "instructor") {
    displayCourses = instructorCourses;
  } else if (user?.role === "student") {
    displayCourses = enrollments.map(e => e.course); // keep same shape as instructorCourses for rendering
  }

  // Filter by search (works for both roles)
  const filtered = displayCourses.filter(c =>
    (c?.courseTitle || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // --- INDEPENDENT CENTERED BLOCK ---
  function NoEnrollmentCenter({ role }) {
    if (role === "student") {
      return (
        <div className="no-enrollment-center">
          <div className="no-results">
            No enrolled courses found<br />
          </div>
          <button
            className="enroll-now-btn"
            onClick={() => navigate("/courses")}
          >
            Enroll in a course
          </button>
        </div>
      );
    } else if (role === "instructor") {
      return (
        <div className="no-enrollment-center">
          <div className="no-results">
          You are not currently teaching any courses.<br />
            <span style={{ color: "#888", fontSize: "1rem" }}>
            </span>
          </div>
        </div>
      );
    } else {
      // Admin, guest, or others – just the base message
      return (
        <div className="no-enrollment-center">
          <div className="no-results">
            No enrolled courses found
          </div>
        </div>
      );
    }
  }

  return (
    <div className="allcourses-bg">
      <DashboardNavbar />
      <div className="allcourses-container">
        <div className="courses-header-row">
          <h2 className="courses-title">
            Your Course(s) <span className="courses-count">({filtered.length})</span>
          </h2>
        </div>

        {loading ? (
          <div style={{ margin: "2rem" }}>Loading...</div>
        ) : error ? (
          <div className="no-results">{error}</div>
        ) : paginated.length > 0 ? (
          <div className="courses-grid">
            {paginated.map((course) => (
              <div
                className="course-card"
                key={course._id}
                onClick={() => {
                  if (user?.role === "instructor") {
                    navigate(`/course/${course._id}`);
                  } else {
                    navigate(`/course-content/${course._id || ""}`);
                  }
                }}
                
              >
                <img
                  src={course.imageUrl || "/img/ocktivLogo.png"}
                  alt={course?.courseTitle || "[Image]"}
                  className="card-logo"
                />
                <div className="card-title">{course?.courseTitle || "Untitled Course"}</div>
                <div className="card-instructor">
    By {course.instructorNames}
  </div>
  <div className="card-duration">
  Course Modules: {Array.isArray(course?.modules) ? course.modules.length : 0}
</div>

              </div>
            ))}
          </div>
        ) : (
          <NoEnrollmentCenter role={user?.role || "student"} />
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination-row">
            <button
              className="pagination-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >{'<'}</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`pagination-btn${page === i + 1 ? " active-page" : ""}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >{'>'}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrolledProgram;
