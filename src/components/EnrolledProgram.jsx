import React, { useEffect, useState } from "react";
import Layout from "./layout";
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
  const title = "Enrolled Program";

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

  return (
    <div className="container">
      <Layout title={title} />
      <main className="content">
        {loading ? (
          <div style={{ margin: "2rem" }}>Loading...</div>
        ) : error ? (
          <div style={{ margin: "2rem", color: "red" }}>{error}</div>
        ) : enrollments.length === 0 ? (
          <div style={{ margin: "2rem" }}>You have no enrolled courses.</div>
        ) : (
          enrollments.map((enrollment) => (
            <div
              className="card clickable-card"
              key={enrollment._id}
              onClick={() =>
                navigate(`/course-content/${enrollment.course?._id || ""}`)
              }
            >
              <div className="image-placeholder">
                <img
                  src="/img/ocktivLogo.png"
                  alt={enrollment.course?.courseTitle || "[Image]"}
                  style={{ width: "60px", height: "60px", objectFit: "contain" }}
                />
              </div>
              <h2>{enrollment.course?.courseTitle || "Untitled Course"}</h2>
              <p>
                {enrollment.course?.instructorName ||
                  (enrollment.course?.instructor && enrollment.course.instructor.firstName) ||
                  "Ocktiv Instructor"}
              </p>
            </div>
          ))
        )}
      </main>
      <footer className="footer">@ocktiv 2025</footer>
    </div>
  );
};

export default EnrolledProgram;
