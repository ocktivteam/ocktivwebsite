import React, { useState } from "react";
import "../style/login.css";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password) {
      errs.password = "Please enter your password.";
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ email: true, password: true });
    if (Object.keys(errs).length === 0) {
      alert("Login successful (placeholder)");
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors(validate());
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-content">
          <img src="/img/ocktivLogo.png" alt="Ocktiv Logo" className="logo" />
          <h2 className="login-heading">Log in to your account</h2>
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                className={errors.email && touched.email ? "invalid" : ""}
                autoComplete="username"
              />
              {errors.email && touched.email && (
                <span className="error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                className={errors.password && touched.password ? "invalid" : ""}
                autoComplete="current-password"
              />
              {errors.password && touched.password && (
                <span className="error">{errors.password}</span>
              )}
            </div>

            <button type="submit" className="login-btn">
              Log In <span className="arrow">→</span>
            </button>

            {/* ✅ Link to Forgot Password page */}
            <Link to="/forgotPassword" className="forgot-link">
              Forgot your password?
            </Link>
          </form>
        </div>
      </div>
      <div className="login-right">
        <img
          src="/img/LogInBG.jpg"
          alt="Login Visual"
          className="login-image"
        />
      </div>
    </div>
  );
}
