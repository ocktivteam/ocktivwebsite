// src/components/payment.jsx

import React, { useState, useEffect, useMemo } from "react";
import "../style/payment.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "./navbar";
import { useSessionCheck } from "../hooks/useSessionCheck";

const ENROLL_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/enrollment/enroll"
    : "https://ocktivwebsite-3.onrender.com/api/enrollment/enroll";

const getUserUpdateApi = (userId) =>
  window.location.hostname === "localhost"
    ? `http://localhost:5050/auth/${userId}/legal-country`
    : `https://ocktivwebsite-3.onrender.com/auth/${userId}/legal-country`;

const SUPPORT_EMAIL = "support@ocktiv.com";

const Payment = () => {
  useSessionCheck();

  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);

  // ---- derive user + legal-name state ---------------------------------------
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // prefer a flag on the user object; fall back to a localStorage boolean if you’re setting it there from Profile.jsx
  const hasEditedLegalNameOnce =
    !!storedUser?.legalNameEditedOnce ||
    localStorage.getItem("legalNameEditedOnce") === "true";

  // three UI states for the legal-name input
  // 'unset' -> free text input
  // 'set-can-change-in-profile' -> disabled here, note says to change in Profile
  // 'locked' -> disabled here, note says contact support (already used the one change)
  const nameState = useMemo(() => {
    if (!storedUser?.legalName) return "unset";
    return hasEditedLegalNameOnce
      ? "locked"
      : "set-can-change-in-profile";
  }, [storedUser, hasEditedLegalNameOnce]);

  // Initialize visible values based on stored user
  useEffect(() => {
    if (storedUser?.legalName) setFullName(storedUser.legalName);
    if (storedUser?.country) setCountry(storedUser.country);
  }, [storedUser]);

  // ----------------------------------------------------------------------------

  // Redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) navigate("/login");
  }, [navigate]);

  // Fetch course details
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const courseId = params.get("courseId");
    if (!courseId) return;

    const COURSE_API =
      window.location.hostname === "localhost"
        ? `http://localhost:5050/api/courses/${courseId}`
        : `https://ocktivwebsite-3.onrender.com/api/courses/${courseId}`;

    axios
      .get(COURSE_API)
      .then((res) => {
        setCourse(res.data.course);
        setCourseLoading(false);
      })
      .catch(() => {
        setCourse(null);
        setCourseLoading(false);
      });
  }, [location.search]);

  const updateUserLegalCountry = async (userId, legalNameValue, countryValue, token) => {
    try {
      await axios.patch(
        getUserUpdateApi(userId),
        { legalName: legalNameValue, country: countryValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // silent fail for UX; payment/enrollment can still proceed
      console.warn("Could not update user legal name/country.", err);
    }
  };

  const handleEnroll = async () => {
    setError("");

    // For 'unset', they must provide the full name now
    if (nameState === "unset" && !fullName.trim()) {
      setError("Please enter your full legal name.");
      return;
    }
    if (!country.trim()) {
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
      // Always send the legal name we’re using (either newly entered, or the existing one)
      const res = await axios.post(
        ENROLL_API,
        {
          userId: user._id,
          courseId,
          fullName, // used by backend for certificate info (your code already supports this)
          country,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status) {
        // Persist on the user profile:
        // - If this is the first time (nameState === 'unset'), this saves the brand-new legal name.
        // - Otherwise, it just keeps the current legal name and updates country if needed.
        await updateUserLegalCountry(user._id, fullName, country, token);

        // Optionally refresh localStorage.user for immediate consistency in the UI
        try {
          const updated = { ...(user || {}), legalName: fullName, country };
          localStorage.setItem("user", JSON.stringify(updated));
        } catch {}

        navigate("/course-shell");
      } else {
        setError(res.data.message || "Enrollment failed.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to enroll. Try again.");
    }
  };

  // Helper text under the Full Legal Name input based on nameState
  const renderNameHelp = () => {
    if (nameState === "set-can-change-in-profile") {
      return (
        <span className="label-subtext">
          Full legal name already set from a previous enrollment. To change it, go to your Profile settings (you can change it once).
        </span>
      );
    }
    if (nameState === "locked") {
      return (
        <span className="label-subtext">
          You already changed your full legal name once. To change it again, please contact {SUPPORT_EMAIL}.
        </span>
      );
    }
    return <span className="label-subtext">(as it should appear on the certificate)</span>;
  };

  const isNameDisabled = nameState !== "unset";

  return (
    <div className="payment-page">
      <Navbar />
      <div className="payment-container">
        <div className="checkout-left">
          <h2 className="checkout-title">Checkout</h2>

          <div className="form-group">
            <label>
              Full Legal Name <br />
              {renderNameHelp()}
            </label>
            <input
              type="text"
              placeholder={
                nameState === "unset"
                  ? "Enter your full legal name"
                  : "Full legal name already set"
              }
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isNameDisabled}
              readOnly={isNameDisabled}
            />
          </div>

          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              placeholder="Enter your country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </div>

        <div className="checkout-right">
          <h3 className="order-summary-title">Order Details</h3>
          <div className="order-card">
            <img
              src="/img/ocktivLogo.png"
              alt="Course thumbnail"
              className="order-thumbnail"
            />
            <div className="order-info">
              <p className="course-title">
                {courseLoading
                  ? "Loading..."
                  : course?.courseTitle || "Course not found"}
              </p>
              <p className="course-price">
                {courseLoading
                  ? ""
                  : course?.price === 0 ||
                    course?.price === "0" ||
                    course?.price === undefined
                  ? "$0.00"
                  : `$${course.price}`}
              </p>
            </div>
          </div>

          <div className="coupon-section">
            <input type="text" placeholder="Apply Coupon Code" disabled />
          </div>

          <div className="price-summary">
            <p>
              Subtotal:{" "}
              <span>{course?.price ? `$${course.price}` : "$0.00"}</span>
            </p>
            <p>
              Discount: <span>$0.00</span>
            </p>
            <p>
              Total:{" "}
              <span>{course?.price ? `$${course.price}` : "$0.00"}</span>
            </p>
          </div>

          {error && (
            <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
          )}

          <button className="enroll-btn" onClick={handleEnroll}>
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
