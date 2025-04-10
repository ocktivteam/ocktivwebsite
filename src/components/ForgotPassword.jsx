
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {  
    const [email, setEmail] = useState("");
    const navigate = useNavigate(); 

    const handleSubmit = (e) => {
        e.preventDefault();  

        axios.post("http://localhost:5000/auth/forgotPassword", { email})
            .then(response => {
                if (response.data.status) {
                    console.log(response.data.message); 
                    alert("Password reset link sent to your email");
                    navigate("/login"); 
                    
                } 
            })
            .catch(err => {
                console.log(err);
            }); 
    };

    return (
        <div className="sign-up-container">
            <h2>Forgot Password</h2>
            <form className="sign-up-form" onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input 
                    type="email" 
                    autoComplete="off" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
        
                <button type="submit">Send</button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
};

export default ForgotPassword;
