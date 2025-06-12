// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from "axios";
// import "../style/signup.css";

// const API_URL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:5050/auth/signup"
//     : "https://ocktivwebsite-3.onrender.com/auth/signup";

// const Signup = () => {
//     const [firstName, setFirstName] = useState("");
//     const [lastName, setLastName] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [errors, setErrors] = useState({});
//     const navigate = useNavigate();
//     const [confirmPassword, setConfirmPassword] = useState("");

//     // Password validation regex
//     const validatePassword = (password) => {
//         // Password must be at least 6 characters long, include at least 1 special character and 1 number
//         const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
//         return passwordRegex.test(password);
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         // Validation
//         const newErrors = {};
//         if (!firstName.trim()) newErrors.firstName = "First name is required";
//         if (!lastName.trim()) newErrors.lastName = "Last name is required";
//         if (!email.trim()) newErrors.email = "Email is required";
//         if (!password.trim()) {
//             newErrors.password = "Password is required";
//         } else if (password.length < 6) {
//             newErrors.password = "Password must be at least 6 characters long.";
//         } else if (!/\d/.test(password)) {
//             newErrors.password = "Password must contain at least 1 number.";
//         } else if (!/[!@#$%^&*]/.test(password)) {
//             newErrors.password = "Password must contain at least 1 special character.";
//         }
//         if (confirmPassword !== password) {
//             newErrors.confirmPassword = "Passwords do not match.";
//         }

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             return;
//         }

//         setErrors({}); // Clear previous errors

//         // Submit to API
//         axios.post(API_URL, {
//             firstName,
//             lastName,
//             email,
//             password,
//             role: 'student'  // Explicitly pass the 'role' here
//         }).then(response => {
//             if (response.data.status) {
//                 // Save the token to localStorage
//                 localStorage.setItem("authToken", response.data.token);

//                 // Redirect to login or another page
//                 navigate("/login");
//             }
//             console.log(response);
//         })
//         .catch(error => {
//             console.error("There was an error signing up!", error);
//         });
//     };

//     return (
//         <div className="signup-page">
//             <div className="signup-left">
//                 <img src="/img/LogSignBG.jpg" alt="Signup Visual" className="signup-image" />
//             </div>
//             <div className="signup-right">
//                 <div className="signup-content">
//                     <img src="/img/ocktivLogo.png" alt="Ocktiv Logo" className="signup-logo" />
//                     <h2>Create Your Account</h2>
//                     <form onSubmit={handleSubmit} className="sign-up-form">

//                         <div className="form-group">
//                             <label>Full Name</label>
//                             <div className="name-fields">
//                                 <input
//                                     type="text"
//                                     placeholder="First Name"
//                                     value={firstName}
//                                     onChange={(e) => setFirstName(e.target.value)}
//                                     className={errors.firstName ? "input-error" : ""}
//                                 />
//                                 <input
//                                     type="text"
//                                     placeholder="Last Name"
//                                     value={lastName}
//                                     onChange={(e) => setLastName(e.target.value)}
//                                     className={errors.lastName ? "input-error" : ""}
//                                 />
//                             </div>
//                             {errors.firstName && <span className="form-error">{errors.firstName}</span>}
//                             {errors.lastName && <span className="form-error">{errors.lastName}</span>}
//                         </div>

//                         <div className="form-group">
//                             <label>Email</label>
//                             <input
//                                 type="email"
//                                 placeholder="Email ID"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 className={errors.email ? "input-error" : ""}
//                             />
//                             {errors.email && <span className="form-error">{errors.email}</span>}
//                         </div>

//                         <div className="form-group">
//                             <label>Password</label>
//                             <div className="password-fields">
//                                 <input
//                                     type="password"
//                                     placeholder="Enter Password"
//                                     value={password}
//                                     onChange={(e) => setPassword(e.target.value)}
//                                     className={errors.password ? "input-error" : ""}
//                                 />
//                                 <input
//                                     type="password"
//                                     placeholder="Confirm Password"
//                                     value={confirmPassword}
//                                     onChange={(e) => setConfirmPassword(e.target.value)}
//                                     className={errors.confirmPassword ? "input-error" : ""}
//                                 />
//                             </div>
//                             {errors.password && <span className="form-error">{errors.password}</span>}
//                             {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
//                         </div>

//                         <button type="submit">Create Account →</button>
//                     </form>

//                     <p>Already have an account? <Link to="/payment">Login</Link></p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Signup;


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
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={errors.confirmPassword ? "input-error" : ""}
                                />
                            </div>
                            {errors.password && <span className="form-error">{errors.password}</span>}
                            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                        </div>
                        {apiError && (
                            <div style={{ color: "red", marginBottom: "10px" }}>
                                {apiError}
                            </div>
                        )}
                        <button type="submit">Create Account →</button>
                    </form>
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
