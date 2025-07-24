import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import "../style/signup.css";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/auth/signup"
    : "https://ocktivwebsite-3.onrender.com/auth/signup";

const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [apiError, setApiError] = useState(""); // show backend errors
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!firstName.trim()) newErrors.firstName = "First name is required";
        if (!lastName.trim()) newErrors.lastName = "Last name is required";
        if (!email.trim()) newErrors.email = "Email is required";
        if (!password.trim()) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long.";
        } else if (!/\d/.test(password)) {
            newErrors.password = "Password must contain at least 1 number.";
        } else if (!/[!@#$%^&*]/.test(password)) {
            newErrors.password = "Password must contain at least 1 special character.";
        }
        if (confirmPassword !== password) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setApiError(""); 
            return;
        }

        setErrors({});
        setApiError(""); 

        axios.post(API_URL, {
            firstName,
            lastName,
            email,
            password,
            role: 'student'
        }).then(response => {
            if (response.data.status) {
                // Save the JWT token and user object for auto-login
                localStorage.setItem("authToken", response.data.token);
                if (response.data.user) {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }

                // Get courseId from URL query param if present
                const params = new URLSearchParams(location.search);
                const courseId = params.get("courseId");
                if (courseId) {
                    navigate(`/payment?courseId=${courseId}`);
                } else {
                    navigate("/courses");
                }
            }
        })
        .catch(error => {
            setApiError(
                error?.response?.data?.message || "There was an error signing up!"
            );
            console.error("There was an error signing up!", error);
        });
    };

    return (
        <div className="signup-page">
            <div className="signup-left">
                <img src="/img/LogSignBG.jpg" alt="Signup Visual" className="signup-image" />
            </div>
            <div className="signup-right">
                <div className="signup-content">
                    <img src="/img/ocktivLogo.png" alt="Ocktiv Logo" className="signup-logo" />
                    <h2>Create Your Account</h2>
                    <form onSubmit={handleSubmit} className="sign-up-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="name-fields">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={errors.firstName ? "input-error" : ""}
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={errors.lastName ? "input-error" : ""}
                                />
                            </div>
                            {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                            {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Email ID"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={errors.email ? "input-error" : ""}
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>
                        <div className="form-group">
  <label>Password</label>
  <div className="password-fields">
    <div className="password-input-wrapper">
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={errors.password ? "input-error" : ""}
      />
      <button
        type="button"
        className="signup-password-toggle"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
          </svg>
        )}
      </button>
    </div>
    <div className="password-input-wrapper">
      <input
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className={errors.confirmPassword ? "input-error" : ""}
      />
      <button
        type="button"
        className="signup-password-toggle"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
      >
        {showConfirmPassword ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
          </svg>
        )}
      </button>
    </div>
  </div>
  {errors.password && <span className="form-error">{errors.password}</span>}
  {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
</div>
                        {apiError && (
                            <div style={{ color: "red", marginBottom: "10px" }}>
                                {apiError}
                            </div>
                        )}
                        <button type="submit">Create Account</button>
                    </form>
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
