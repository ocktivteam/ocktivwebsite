/*import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../style/login.css";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Signup = () => {  
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); 

    const handleSubmit = (e) => {
        e.preventDefault();  

        axios.post("https://ocktivwebsite-3.onrender.com/auth/signup", { username, email, password })
            .then(response => {
                if (response.data.status) {
                    navigate("/login"); 
                } 
                console.log(response);
            })
            .catch(error => {
                console.error("There was an error signing up!", error);
            }); 
    };

    return (
        <div className="sign-up-container">
          <h2>Sign Up</h2>
          <form className="sign-up-form" onSubmit={handleSubmit}>
            <label htmlFor="username">Username:</label>
            <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
      
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
      
            <button type="submit">Sign Up</button>
          </form>
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
};

export default Signup;
*/


/*
// works

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import "../style/login.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = (e) => {
    e.preventDefault();  
    axios.post("https://ocktivwebsite-3.onrender.com/auth/signup", {
      username,
      email,
      password
    }).then(response => {
      if (response.data.status) {
        navigate("/login"); 
      }
      console.log(response);
    }).catch(error => {
      console.error("There was an error signing up!", error);
    }); 
  };

  return (
    <div className="signup-page">
      <div className="signup-left">
      </div>
      <div className="signup-right">
        <div className="signup-card">
          <img src="/logo.png" alt="Ocktiv Logo" className="signup-logo" />
          <h2>Create Your Account</h2>
          <form onSubmit={handleSubmit} className="sign-up-form">
            <div className="name-fields">
              <input
                type="text"
                placeholder="First Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                disabled
              />
            </div>
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="password-fields">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                disabled
              />
            </div>
            <button type="submit">Create Account →</button>
          </form>
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
*/
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import "../style/signup.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!username.trim()) newErrors.username = "First name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear previous errors

    // Submit to API
    axios.post("https://ocktivwebsite-3.onrender.com/auth/signup", {
      username,
      email,
      password
    }).then(response => {
      if (response.data.status) {
        navigate("/login");
      }
      console.log(response);
    }).catch(error => {
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
        <img src="/img/ocktivLogo.png"  alt="Ocktiv Logo" className="signup-logo" />
          <h2>Create Your Account</h2>
          <form onSubmit={handleSubmit} className="sign-up-form">

            <div className="form-group">
              <label>Full Name</label>
              <div className="name-fields">
                <input
                  type="text"
                  placeholder="First Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={errors.username ? "input-error" : ""}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  disabled
                />
              </div>
              {errors.username && <span className="form-error">{errors.username}</span>}
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
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "input-error" : ""}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  disabled
                />
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button type="submit">Create Account →</button>
          </form>

          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
