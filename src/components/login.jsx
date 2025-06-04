/*import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/login.css"; 
import axios from "axios";

const Login = () => {  
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    const handleSubmit = (e) => {
        e.preventDefault();  

       axios.post("https://ocktivwebsite-3.onrender.com/auth/login", { email, password })
            .then(response => {
                console.log(response.data);
                if (response.data.status) {
                    navigate("/home"); 
                } else {
                    setMessage("Username or password is incorrect.");
                }
            })
            .catch(error => {
                console.error("There was an error logging in!", error);
                setMessage("Something went wrong. Please try again.");
            }); 
    };

    return (
        <div id="login-page">
            <h2>Login</h2>
            <form id="login-form" onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input 
                    type="email" 
                    autoComplete="off" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="password">Password:</label>
                <input 
                    type="password" 
                    placeholder="******" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Login</button>
            </form>

            {message && (
                <p className="login-message" style={{ color: "red", marginTop: "10px" }}>
                    {message}
                </p>
            )}

            <Link to="/forgotPassword">Forgot Password?</Link>
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
    );
};

export default Login;


*/


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../style/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear previous errors

    // Submit to API
    axios.post("http://localhost:5000/auth/login", {
      email,
      password,
    }).then(response => {
      if (response.data.status) {
        // Save the token to localStorage
        localStorage.setItem("authToken", response.data.token);

        // Redirect to the desired page (e.g., dashboard or home)
        navigate("/home"); // Change this route as needed
      } else {
        setErrors({ general: response.data.message });
      }
    }).catch(error => {
      console.error("There was an error logging in!", error);
      setErrors({ general: "An error occurred while logging in." });
    });
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-content">
          <img src="/img/ocktivLogo.png" alt="Ocktiv Logo" className="logo" />
          <h2 className="login-heading">Log in to your account</h2>
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "invalid" : ""}
                autoComplete="username"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "invalid" : ""}
                autoComplete="current-password"
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            {errors.general && <span className="error">{errors.general}</span>}

            <button type="submit" className="login-btn">Log In →</button>

            {/* Link to Forgot Password page */}
            <Link to="/forgotPassword" className="forgot-link">Forgot your password?</Link>

             {/* Link to Signup page */}
             <p className="signup-link">Don't have an account? <Link to="/signup">Sign Up</Link></p>
          </form>
        </div>
      </div>

      <div className="login-right">
        <img src="/img/LogInBG.jpg" alt="Login Visual" className="login-image" />
      </div>
    </div>
  );
};

export default Login;
