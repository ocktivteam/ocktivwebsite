// src/components/payment.jsx

import React, { useState, useEffect } from "react";
import "../style/payment.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "./navbar";
import { useSessionCheck } from '../hooks/useSessionCheck';

const ENROLL_API =
    window.location.hostname === "localhost"
        ? "http://localhost:5050/api/enrollment/enroll"
        : "https://ocktivwebsite-3.onrender.com/api/enrollment/enroll";

        const getUserUpdateApi = (userId) =>
            window.location.hostname === "localhost"
                ? `http://localhost:5050/auth/${userId}/legal-country`
                : `https://ocktivwebsite-3.onrender.com/auth/${userId}/legal-country`;
        

    const Payment = () => {
    useSessionCheck();
    
    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const [course, setCourse] = useState(null);
    const [courseLoading, setCourseLoading] = useState(true);

    // Redirect to login if not authenticated
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);



    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const courseId = params.get("courseId");
        if (!courseId) return;

        const COURSE_API =
            window.location.hostname === "localhost"
                ? `http://localhost:5050/api/courses/${courseId}`
                : `https://ocktivwebsite-3.onrender.com/api/courses/${courseId}`;

        axios.get(COURSE_API)
            .then(res => {
                setCourse(res.data.course);
                setCourseLoading(false);
            })
            .catch(() => {
                setCourse(null);
                setCourseLoading(false);
            });
    }, [location.search]);

    const updateUserLegalCountry = async (userId, fullName, country, token) => {
        try {
            await axios.patch(
                getUserUpdateApi(userId),
                { legalName: fullName, country },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            // Optionally handle error (you can show a warning, but it's not fatal)
            console.warn("Could not update user legal name/country.", err);
        }
    };

    const handleEnroll = async () => {
        setError("");
        if (!fullName.trim() || !country.trim()) {
            setError("Please fill in all required fields.");
            return;
        }
        const token = localStorage.getItem("authToken");
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem("user"));
        } catch {
            setError("User info missing.");
            return;
        }
        const params = new URLSearchParams(location.search);
        const courseId = params.get("courseId");
        if (!token || !user || !courseId) {
            setError("Missing info. Please log in and try again.");
            return;
        }
        try {
            const res = await axios.post(
                ENROLL_API,
                {
                    userId: user._id,
                    courseId: courseId,
                    // Optionally send fullName/country to backend for certificate info
                    fullName,
                    country,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.data.status) {
                
                await updateUserLegalCountry(user._id, fullName, country, token);
                
                navigate("/course-shell");
            } else {
                setError(res.data.message || "Enrollment failed.");
            }
        } catch (err) {
            setError(
                err?.response?.data?.message || "Failed to enroll. Try again."
            );
        }
    };

    return (
        <div className="payment-page">
            <Navbar />
            <div className="payment-container">
                <div className="checkout-left">
                    <h2 className="checkout-title">Checkout</h2>
                    <div className="form-group">
                        <label>
                            Full Legal Name <br />
                            <span className="label-subtext">(as it should appear on the certificate)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your full legal name"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Country</label>
                        <input
                            type="text"
                            placeholder="Enter your country"
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                        />
                    </div>
                </div>

                <div className="checkout-right">
                    <h3 className="order-summary-title">Order Details</h3>
                    <div className="order-card">
                        <img src="/img/ocktivLogo.png" alt="Course thumbnail" className="order-thumbnail" />
                        <div className="order-info">
                            <p className="course-title">
                                {courseLoading ? "Loading..." : course?.courseTitle || "Course not found"}
                            </p>
                            <p className="course-price">
                                {courseLoading ? "" : (course?.price === 0 || course?.price === "0" || course?.price === undefined)
                                    ? "$0.00"
                                    : `$${course.price}`}
                            </p>

                        </div>
                    </div>
                    <div className="coupon-section">
                        <input type="text" placeholder="Apply Coupon Code" disabled />
                    </div>
                    <div className="price-summary">
                        <p>Subtotal: <span>{course?.price ? `$${course.price}` : "$0.00"}</span></p>
                        <p>Discount: <span>$0.00</span></p>
                        <p>Total: <span>{course?.price ? `$${course.price}` : "$0.00"}</span></p>

                    </div>
                    {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
                    <button
                        className="enroll-btn"
                        onClick={handleEnroll}
                    >
                        Enroll
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Payment;
