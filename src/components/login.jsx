import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../style/login.css"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Login = () => {  
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;
    const handleSubmit = (e) => {
        e.preventDefault();  

        axios.post("https://ocktivwebsite-3.onrender.com/auth/login", { email, password })
            .then(response => {
                console.log(response.data);
                if (response.data.status) {
                    setErrorMessage("");
                    navigate ("/home"); 
                }
            })
            .catch(error => {
                console.error("There was an error logging in!", error);
                setErrorMessage("Wrong email or password.");
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
          <Link to="/forgotPassword">Forgot Password?</Link>
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
    );
};

export default Login;
