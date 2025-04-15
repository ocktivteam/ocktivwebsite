import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/login.css"; 

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/auth/reset-password", {
                token,
                password
            });

            setMessage(response.data.message);

            if (response.data.status) {
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (err) {
            setMessage("Error resetting password.");
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                <h2>Reset Your Password</h2>
                <form onSubmit={handleSubmit} className="reset-form">
                    <input 
                        type="password" 
                        placeholder="New password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Confirm password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Reset Password</button>
                </form>
                {message && <p className="reset-message">{message}</p>}
            </div>
        </div>
    );
};

export default ResetPassword;
