import React, { useState } from 'react';
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

        axios.post("http://localhost:5000/auth/signup", { username, email, password })
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
