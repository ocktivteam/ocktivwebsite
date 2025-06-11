// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import "../style/login.css";

// const API_URL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:5050/auth/login"
//     : "https://ocktivwebsite-3.onrender.com/auth/login";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();

//     // Email format validation
//     const validateEmail = (email) => {
//         const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//         return emailRegex.test(email);
//       };

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

//     setErrors({}); // Clear previous errors

//     // Submit to API
//     axios.post(API_URL, {
//       email,
//       password,
//     }).then(response => {
//       if (response.data.status) {
//         // Save the token to localStorage
//         localStorage.setItem("authToken", response.data.token);
//         localStorage.setItem("user", JSON.stringify(response.data.user));

//         // Redirect to the desired page (e.g., dashboard or home)
//         navigate("/home"); // Change this route as needed
//       } else {
//         setErrors({ general: "Incorrect email or password" }); // General error message
//       }
//     }).catch(error => {
//         if (error.response && error.response.data && error.response.data.message) {
//           setErrors({ general: error.response.data.message }); // Show backend message
//         } else {
//           setErrors({ general: "An error occurred while logging in." });
//         }
//       });
//     }      

//   return (
//     <div className="login-page">
//       <div className="login-left">
//         <div className="login-content">
//           <img src="/img/ocktivLogo.png" alt="Ocktiv Logo" className="logo" />
//           <h2 className="login-heading">Log in to your account</h2>
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

//              {/* Link to Signup page */}
//              <p className="signup-link">Don't have an account? <Link to="/signup">Sign Up</Link></p>
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


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../style/login.css";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/auth/login"
    : "https://ocktivwebsite-3.onrender.com/auth/login";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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
    axios.post(API_URL, {
      email,
      password,
    }).then(response => {
      if (response.data.status) {
        // Save the token and user to localStorage
        localStorage.setItem("authToken", response.data.token);
        if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        navigate("/home");
      } else {
        setErrors({ general: "Incorrect email or password" });
      }
    }).catch(error => {
        if (error.response && error.response.data && error.response.data.message) {
          setErrors({ general: error.response.data.message });
        } else {
          setErrors({ general: "An error occurred while logging in." });
        }
      });
    }      

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
