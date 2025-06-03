import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/forgotpassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Automatically use localhost for dev, Vercel for prod (you can keep both for quick swap)
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5050/auth/forgot-password"
      : "https://ocktivwebsite-3.onrender.com/auth/forgot-password";
  // Or hardcode if you prefer: const API_URL = "http://localhost:5050/auth/forgot-password";

  // Validation
  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    return errs;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setMessage("");
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        const res = await axios.post(
          API_URL,
          { email },
          { withCredentials: true }
        );
        setMessage(
          "If this email is registered, a reset link has been sent. Please check your inbox."
        );
        setEmail("");
      } catch (err) {
        if (
          err.response &&
          err.response.data &&
          typeof err.response.data.message === "string"
        ) {
          setMessage(err.response.data.message);
        } else {
          setMessage("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-left">
        <div className="forgot-content">
          <img
            src="/img/ocktivLogo.png"
            alt="Ocktiv Logo"
            className="logo centered-logo"
          />

          <h2 className="forgot-heading">Forgot Password</h2>
          <form className="forgot-form" onSubmit={handleSubmit} noValidate>
            <p>Enter your Email to get a reset password link</p>
            <input
              type="email"
              placeholder="Enter Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "invalid" : ""}
              autoComplete="username"
              disabled={loading}
            />
            {errors.email && <span className="error">{errors.email}</span>}
            {message && <span className="message">{message}</span>}
            <button type="submit" className="send-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Email"}{" "}
              <span className="arrow">→</span>
            </button>
          </form>
          <button className="back-link" onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </div>
      </div>
      <div className="forgot-right">
        <img
          src="/img/ForgotPassBG.jpg"
          alt="Forgot Visual"
          className="forgot-image"
        />
      </div>
    </div>
  );
}
