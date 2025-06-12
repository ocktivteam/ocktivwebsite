// src/components/EnrolledProgram.jsx

import React, { useEffect, useState } from "react";
import DashboardNavbar from "./dashboardNavbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/EnrolledProgram.css";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/enrollment"
    : "https://ocktivwebsite-3.onrender.com/api/enrollment";

const EnrolledProgram = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const perPage = 9;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    if (!token || !user || !user._id) {
      setError("You must be logged in to see enrolled courses.");
      setLoading(false);
      return;
    }

    setLoading(true);
    axios
      .get(`${API_URL}/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setEnrollments(res.data.enrollments || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to fetch enrolled courses.");
        setEnrollments([]);
        setLoading(false);
      });
  }, []);

  // Filter by search
  const filtered = enrollments.filter(e =>
    (e.course?.courseTitle || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // --- INDEPENDENT CENTERED BLOCK ---
  function NoEnrollmentCenter() {
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
  }

  return (
    <div className="allcourses-bg">
      <DashboardNavbar />
      <div className="allcourses-container">
        <div className="courses-header-row">
          <h2 className="courses-title">
            Enrolled Course(s) <span className="courses-count">({enrollments.length})</span>
          </h2>
        </div>

        {loading ? (
          <div style={{ margin: "2rem" }}>Loading...</div>
        ) : error ? (
          <div className="no-results">{error}</div>
        ) : paginated.length > 0 ? (
          <div className="courses-grid">
            {paginated.map((enrollment) => (
              <div
                className="course-card"
                key={enrollment._id}
                onClick={() => navigate(`/course-content/${enrollment.course?._id || ""}`)}
              >
                <img
                  src="/img/ocktivLogo.png"
                  alt={enrollment.course?.courseTitle || "[Image]"}
                  className="card-logo"
                />
                <div className="card-title">{enrollment.course?.courseTitle || "Untitled Course"}</div>
                <div className="card-instructor">
                  By {enrollment.course?.instructorName || "Ocktiv Instructor"}
                </div>
                <div className="card-duration">
                  Course Duration: {enrollment.course?.duration || "N/A"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoEnrollmentCenter />
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
