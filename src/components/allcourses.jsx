import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Navbar from "./navbar";
import "../style/allcourses.css";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/courses"
    : "https://ocktivwebsite-3.onrender.com/api/courses";

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const perPage = 9;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get(API_URL)
      .then(res => {
        setCourses((res.data.courses || []).reverse()); // Reverse to show latest first
        setLoading(false);
        setError("");
      })
      .catch(() => {
        setCourses([]);
        setLoading(false);
        setError("Unable to fetch courses.");
      });
  }, []);

  const filteredCourses = courses.filter(course =>
    (course.courseTitle || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCourses.length / perPage);
  const paginatedCourses = filteredCourses.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  return (
    <div className="allcourses-bg">
      <Navbar />
      <div className="allcourses-container">
        <div className="courses-header-row">
          <h2 className="courses-title">
            Ocktiv Courses <span className="courses-count">({courses.length})</span>
          </h2>
          <div className="courses-actions"></div>
        </div>
        <div className="courses-search-row">
          <input
            className="navbar-search"
            type="text"
            placeholder="Search by Courses"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="courses-grid">
          {loading ? (
            <div style={{ margin: "2rem" }}>Loading...</div>
          ) : error ? (
            <div className="no-results">{error}</div>
          ) : paginatedCourses.length > 0 ? (
            paginatedCourses.map((course, idx) => (
              <div
                className="course-card"
                key={course._id || idx}
                onClick={() => navigate(`/coursedetails/${course._id}`)}
              >
                <img loading="lazy" src={course.imageUrl || "/img/ocktivLogo.png"} alt="Course" className="card-logo" />
                <div className="card-title">{course.courseTitle}</div>
                <div className="card-instructor">By {course.instructorNames}</div>
              </div>
            ))
          ) : (
            <div className="no-results">No courses found.</div>
          )}
        </div>
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
}

export default AllCourses;
