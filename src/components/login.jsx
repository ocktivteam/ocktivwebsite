import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import "../style/login.css";
import { handleAuthToken } from '../utils/auth';

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/auth/login"
    : "https://ocktivwebsite-3.onrender.com/auth/login";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation(); // <-- React Router location

  // If redirected due to session expiry, show message
  const sessionExpired = location.state && location.state.sessionExpired;

  // Remove the state after displaying session expired message
  useEffect(() => {
    if (sessionExpired) {
      // Remove state so it doesn't persist after reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [sessionExpired, navigate, location.pathname]);

  // Email format validation
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Please enter a valid email address";

    if (!password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Submit to API
    axios.post(API_URL, { email, password })
      .then(response => {
        if (response.data.status) {
          // Set token
          handleAuthToken(response.data.token);
          if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
          navigate("/course-shell");
        } else {
          setErrors({ general: "Incorrect email or password" });
        }
      })
      .catch(error => {
        if (error.response && error.response.data && error.response.data.message) {
          setErrors({ general: error.response.data.message });
        } else {
          setErrors({ general: "An error occurred while logging in." });
        }
      });
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-content">
          <img src="/img/ocktivLogo.png" alt="Ocktiv Logo" className="logo" />
          <h2 className="login-heading">Log in to your account</h2>
          {/* Session expired message */}
          {sessionExpired && (
            <div className="session-expired-message" style={{
              background: "#ffeaea",
              color: "#c00",
              padding: "8px 12px",
              borderRadius: "6px",
              marginBottom: "12px",
              fontWeight: "bold"
            }}>
              Your session has expired. Please log in again.
            </div>
          )}
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
            {/* <p className="signup-link">Don't have an account? <Link to="/signup">Sign Up</Link></p> */}

            {/* Link to Courses page */}
            <p className="signup-link">Not enrolled in any courses? <Link to="/courses">Enroll Now</Link></p>
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

//======================

// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import "../style/login.css";
// import { handleAuthToken } from '../utils/auth';

// const API_URL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:5050/auth/login"
//     : "https://ocktivwebsite-3.onrender.com/auth/login";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState({});
//   const [showSessionExpired, setShowSessionExpired] = useState(false); // add state
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Show session expired message if redirected after timeout
//   useEffect(() => {
//     if (location.state && location.state.sessionExpired) {
//       setShowSessionExpired(true);
//       // Clean up the state so it doesn't persist after reload or manual nav
//       navigate(location.pathname, { replace: true, state: {} });
//     }
//   }, [location, navigate]);

//   // Email format validation
//   const validateEmail = (email) => {
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     return emailRegex.test(email);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Validation
//     const newErrors = {};
//     if (!email.trim()) newErrors.email = "Email is required";
//     else if (!validateEmail(email)) newErrors.email = "Please enter a valid email address";
//     if (!password.trim()) newErrors.password = "Password is required";

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     setErrors({});
//     setShowSessionExpired(false); // Hide session expired after attempt

//     // Submit to API
//     axios.post(API_URL, { email: email.trim().toLowerCase(), password })
//       .then(response => {
//         if (response.data.status) {
//           // Set token
//           handleAuthToken(response.data.token);
//           if (response.data.user) {
//             localStorage.setItem("user", JSON.stringify(response.data.user));
//           }
//           navigate("/course-shell");
//         } else {
//           setErrors({ general: "Incorrect email or password" });
//         }
//       })
//       .catch(error => {
//         if (error.response && error.response.data && error.response.data.message) {
//           setErrors({ general: error.response.data.message });
//         } else {
//           setErrors({ general: "An error occurred while logging in." });
//         }
//       });
//   };

//   return (
//     <div className="login-page">
//       <div className="login-left">
//         <div className="login-content">
//           <img src="/img/ocktivLogo.png" alt="Ocktiv Logo" className="logo" />
//           <h2 className="login-heading">Log in to your account</h2>
//           {/* Session expired message */}
//           {showSessionExpired && (
//             <div className="session-expired-message" style={{
//               background: "#ffeaea",
//               color: "#c00",
//               padding: "8px 12px",
//               borderRadius: "6px",
//               marginBottom: "12px",
//               fontWeight: "bold"
//             }}>
//               Your session has expired. Please log in again.
//             </div>
//           )}
//           <form onSubmit={handleSubmit} className="login-form" noValidate>
//             <div className="form-group">
//               <label>Email</label>
//               <input
//                 type="email"
//                 placeholder="Enter Email ID"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className={errors.email ? "invalid" : ""}
//                 autoComplete="username"
//               />
//               {errors.email && <span className="error">{errors.email}</span>}
//             </div>

//             <div className="form-group">
//               <label>Password</label>
//               <input
//                 type="password"
//                 placeholder="Enter Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className={errors.password ? "invalid" : ""}
//                 autoComplete="current-password"
//               />
//               {errors.password && <span className="error">{errors.password}</span>}
//             </div>

//             {errors.general && <span className="error">{errors.general}</span>}

//             <button type="submit" className="login-btn">Log In →</button>

//             {/* Link to Forgot Password page */}
//             <Link to="/forgotPassword" className="forgot-link">Forgot your password?</Link>

//             {/* Link to Signup page */}
//             <p className="signup-link">Don't have an account? <Link to="/signup">Sign Up</Link></p>
//           </form>
//         </div>
//       </div>

//       <div className="login-right">
//         <img src="/img/LogInBG.jpg" alt="Login Visual" className="login-image" />
//       </div>
//     </div>
//   );
// };

// export default Login;


//======================

