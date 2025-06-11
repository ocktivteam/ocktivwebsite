// src/components/coursedetails.jsx

import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/coursedetails.css";
import Navbar from "./navbar";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/courses"
    : "https://ocktivwebsite-3.onrender.com/api/courses";

function CourseDetails() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError("");
    axios.get(`${API_URL}/${id}`)
      .then(res => {
        setCourse(res.data.course);
        setLoading(false);
      })
      .catch(() => {
        setCourse(null);
        setLoading(false);
        setError("Unable to fetch course details.");
      });
  }, [id]);

  // "Enroll Now" button logic
  const handleEnroll = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate(`/payment?courseId=${course._id}`);
    } else {
      navigate(`/signup?courseId=${course._id}`);
    }
  };


  return (
    <div className="allcourses-bg">
      <Navbar />

      <div className="course-details-wrapper">
        {/* Breadcrumbs */}
        <div className="course-breadcrumbs">
          <a href="https://ocktiv.com/" target="_blank" rel="noopener noreferrer">Home</a> &nbsp;/&nbsp;
          <a href="/courses">Courses</a> &nbsp;/&nbsp;
          <span>{course ? course.courseTitle : "Loading..."}</span>
        </div>

        <div className="course-details-content">
          {loading ? (
            <div style={{ margin: "2rem" }}>Loading...</div>
          ) : error ? (
            <div style={{ color: "red", margin: "2rem" }}>{error}</div>
          ) : course ? (
            <>
              {/* LEFT COLUMN */}
              <div className="course-details-main">
                <h1 className="course-title">{course.courseTitle}</h1>
                <p className="course-meta">
                  {course.duration || "N/A"}
                  {course.courseType && <> | {course.courseType}</>}
                  {course.semester && <> | {course.semester}</>}
                </p>

                <section className="course-section">
                  <h3>Course Description</h3>
                  <p>
                    {course.description || "No description available."}
                  </p>
                </section>

                <section className="course-section">
                  <h3>Certification</h3>
                  <p>
                    {course.certDesc || "Certificate awarded upon successful completion."}
                  </p>
                </section>

                <hr />

                <section className="course-section">
                  <h3>Syllabus</h3>
                  <div className="syllabus-list">
                    {course.syllabus && course.syllabus.length > 0 ? (
                      course.syllabus.map((item, idx) => (
                        <div className="syllabus-item" key={idx}>
                          <div className="syllabus-title">{item.title}</div>
                          <div className="syllabus-meta">
                            {item.lessons} Lessons &nbsp;·&nbsp; {item.duration}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div>No syllabus available.</div>
                    )}
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN */}
              <aside className="course-details-sidecard">
                <img src="/img/ocktivLogo.png" alt="Ocktiv logo" className="sidecard-logo" />
                <div className="sidecard-price">
                  {(course.price === 0 || course.price === "0" || course.price === undefined) ? (
                    <span className="free">FREE</span>
                  ) : (
                    <span className="sidecard-actual-price">${course.price}</span>
                  )}
                  {course.price !== 0 && <span className="old-price">$99.5</span>}
                </div>
                <button
                  className="sidecard-enroll"
                  style={{ display: 'inline-block', textAlign: 'center', width: "100%" }}
                  onClick={handleEnroll}
                >
                  Enroll Now
                </button>
                <div className="sidecard-share">{/* Share buttons (future) */}</div>
              </aside>
            </>
          ) : (
            <div>No course found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
