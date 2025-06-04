import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/resetpassword.css";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/auth/reset-password"
    : "https://ocktivwebsite-3.onrender.com/auth/reset-password";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Both fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        API_URL,
        { token, password },
        { withCredentials: true }
      );

      setMessage(response.data.message);
      if (response.data.status) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError("Error resetting password.");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <img
          src="/img/ocktivLogo.png"
          alt="Ocktiv Logo"
          className="reset-logo"
        />
        <h2 className="reset-title">Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="reset-form">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="reset-input"
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="reset-input"
            required
          />
          <button type="submit" className="reset-btn">
            Reset Password
          </button>
        </form>
        {error && <p className="reset-error">{error}</p>}
        {message && <p className="reset-message">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
