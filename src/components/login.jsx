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
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation(); // <-- React Router location

//   // If redirected due to session expiry, show message
//   const sessionExpired = location.state && location.state.sessionExpired;

//   // Remove the state after displaying session expired message
//   useEffect(() => {
//     if (sessionExpired) {
//       // Remove state so it doesn't persist after reload
//       navigate(location.pathname, { replace: true, state: {} });
//     }
//   }, [sessionExpired, navigate, location.pathname]);

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

//     // Submit to API
//     axios.post(API_URL, { email, password })
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
//           {sessionExpired && (
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
//   <label>Password</label>
//   <div className="password-input-wrapper">
//     <input
//       type={showPassword ? "text" : "password"}
//       placeholder="Enter Password"
//       value={password}
//       onChange={(e) => setPassword(e.target.value)}
//       className={errors.password ? "invalid" : ""}
//       autoComplete="current-password"
//     />
//     <button
//       type="button"
//       className="login-password-toggle"
//       onClick={() => setShowPassword(!showPassword)}
//       aria-label={showPassword ? "Hide password" : "Show password"}
//     >
//       {showPassword ? (
//         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
//         </svg>
//       ) : (
//         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
//         </svg>
//       )}
//     </button>
//   </div>
//   {errors.password && <span className="error">{errors.password}</span>}
// </div>

//             {errors.general && <span className="error">{errors.general}</span>}

//             <button type="submit" className="login-btn">Log In</button>

//             {/* Link to Forgot Password page */}
//             <Link to="/forgotPassword" className="forgot-link">Forgot your password?</Link>

//             {/* Link to Signup page */}
//             {/* <p className="signup-link">Don't have an account? <Link to="/signup">Sign Up</Link></p> */}

//             {/* Link to Courses page */}
//             <p className="signup-link">Not enrolled in any courses? <Link to="/courses">Enroll Now</Link></p>
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
  const [showPassword, setShowPassword] = useState(false);
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
          // REDIRECT LOGIC HERE
          if (response.data.user && response.data.user.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/course-shell");
          }
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
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "invalid" : ""}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
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
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            {errors.general && <span className="error">{errors.general}</span>}

            <button type="submit" className="login-btn">Log In</button>

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
