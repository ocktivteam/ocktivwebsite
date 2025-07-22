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

const ENROLLMENT_API_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:5050/api/enrollment"
        : "https://ocktivwebsite-3.onrender.com/api/enrollment";

function CourseDetails() {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        setUserRole(userData?.role || null);
    }, []);

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

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const userData = JSON.parse(localStorage.getItem("user"));

        if (token && course?._id && userData?._id && userData.role === "student") {
            axios.get(`${ENROLLMENT_API_URL}/user/${userData._id}`)
                .then(res => {
                    const enrolledCourseIds = res.data.enrollments.map(e => e.course._id);
                    if (enrolledCourseIds.includes(course._id)) {
                        setIsEnrolled(true);
                    }
                })
                .catch(err => {
                    console.error("Enrollment check failed:", err);
                });
        }
    }, [course]);

    // "Enroll Now" button logic
    const handleEnroll = () => {
        const token = localStorage.getItem("authToken");
        if (token) {
            navigate(`/payment?courseId=${course._id}`);
        } else {
            navigate(`/signup?courseId=${course._id}`);
        }
    };

    // Only show uploaded modules under Syllabus
    function renderModules() {
        if (!course?.modules || course.modules.length === 0) {
            return <div>No modules available yet.</div>;
        }
        else if (!course?.modules || course.modules.length === 0) {
            enrollBtnProps = {
                disabled: true,
                label: "Coming Soon",
                color: "#ccc",
                extraMsg: (
                    <p style={{ color: "#d32f2f", marginTop: "1rem", fontWeight: 500 }}>
                        Enrollment will open once modules are available.
                    </p>
                )
            };
        }        
        return (
            <>
                {course.modules.map((mod, idx) => (
                    <div className="syllabus-item" key={mod._id || idx}>
                        <div className="syllabus-title">
                            {mod.moduleTitle || `Module ${idx + 1}`}
                        </div>
                    </div>
                ))}
            </>
        );
    }

    // Button/Message Logic
    let enrollBtnProps = {
        disabled: false,
        label: "Enroll Now",
        color: undefined,
        extraMsg: null
    };

    if (userRole === "instructor") {
        enrollBtnProps = {
            disabled: true,
            label: "Instructors cannot enroll",
            color: "#ccc",
            extraMsg: (
                <p style={{ color: "#d32f2f", marginTop: "1rem", fontWeight: 500 }}>
                    Instructors cannot enroll in courses.
                </p>
            )
        };
    } else if (isEnrolled) {
        enrollBtnProps = {
            disabled: true,
            label: "Already Enrolled",
            color: "#ccc",
            extraMsg: (
                <p style={{ color: "#d32f2f", marginTop: "1rem", fontWeight: 500 }}>
                    You are already enrolled in this course.
                </p>
            )
        };
    } else if (!course?.modules || course.modules.length === 0) {
        enrollBtnProps = {
            disabled: true,
            label: "Coming Soon",
            color: "#ccc",
            extraMsg: (
                <p style={{ color: "#d32f2f", marginTop: "1rem", fontWeight: 500 }}>
                    Enrollment will open once modules are available.
                </p>
            )
        };
    }

    // Only show enroll button for students/guests/instructors (never hide)
    const showEnrollBtn = true;

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
                                        {renderModules()}
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
                                {/* {showEnrollBtn && (
                                    <>
                                        <button
                                            className="sidecard-enroll"
                                            style={{
                                                display: 'inline-block',
                                                textAlign: 'center',
                                                width: "100%",
                                                backgroundColor: enrollBtnProps.color,
                                                cursor: enrollBtnProps.disabled ? "not-allowed" : "pointer"
                                            }}
                                            onClick={handleEnroll}
                                            disabled={enrollBtnProps.disabled}
                                        >
                                            {enrollBtnProps.label}
                                        </button>
                                        {enrollBtnProps.extraMsg}
                                    </>
                                )} */}
                                {showEnrollBtn && (
                                    <>
                                        <button
                                            className="sidecard-enroll"
                                            style={{
                                                display: 'inline-block',
                                                textAlign: 'center',
                                                width: "100%",
                                                backgroundColor: enrollBtnProps.color,
                                                cursor: enrollBtnProps.disabled ? "not-allowed" : "pointer",
                                                marginBottom: isEnrolled ? "10px" : "0px"
                                            }}
                                            onClick={handleEnroll}
                                            disabled={enrollBtnProps.disabled}
                                        >
                                            {enrollBtnProps.label}
                                        </button>
                                        {enrollBtnProps.extraMsg}

                                        {/* New Button: Go to Course Shell */}
                                        {isEnrolled && (
                                            <button
                                                className="sidecard-enroll"
                                                style={{
                                                    width: "100%",
                                                    backgroundColor: "#69982f",
                                                    color: "#fff",
                                                    padding: "10px",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    marginTop: "16px"  
                                                }}
                                                onClick={() => navigate(`/course-shell?courseId=${course._id}`)}
                                            >
                                                Go to Course Shell
                                            </button>
                                        )}

                                    </>
                                )}

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
