import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../style/registerInstructorForm.css";
import axios from "axios";

export default function RegisterInstructorForm() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // Add navigation hook
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const { id: instructorId } = useParams();
    const isEditMode = Boolean(instructorId);


    useEffect(() => {
        if (!isEditMode) return;

        const url =
            window.location.hostname === "localhost"
                ? `http://localhost:5050/auth/instructors`
                : `https://ocktivwebsite-3.onrender.com/auth/instructors`;

        axios.get(url)
            .then(res => {
                const instructor = res.data.instructors.find(i => i._id === instructorId);
                if (!instructor) return navigate("/admin-dashboard");

                setFormData({
                    firstName: instructor.firstName || "",
                    lastName: instructor.lastName || "",
                    email: instructor.email || "",
                    password: "", // ✅ leave blank
                });
            })
            .catch(() => navigate("/admin-dashboard"));
    }, [instructorId]);

    function validate() {
        const errs = {};
        if (!formData.firstName.trim()) errs.firstName = "First name is required.";
        if (!formData.lastName.trim()) errs.lastName = "Last name is required.";
        if (!formData.email.trim()) errs.email = "Email is required.";
        if (!isEditMode && !formData.password.trim()) errs.password = "Password is required.";
        return errs;
    }

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setErrors({});

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            setLoading(false);
            return;
        }

        const base = window.location.hostname === "localhost"
            ? "http://localhost:5050/auth"
            : "https://ocktivwebsite-3.onrender.com/auth";

        const url = isEditMode
            ? `${base}/instructors/${instructorId}`
            : `${base}/signup`;

        const payload = {
            ...formData,
            role: "instructor",
            gender: null,
            legalName: "N/A",
            country: "N/A",
        };

        try {
            const res = isEditMode
                ? await axios.put(url, payload)
                : await axios.post(url, payload);

            if (res.data.status) {
                setMessage(isEditMode ? "Instructor updated successfully." : "Instructor registered successfully.");
                setFormData({ firstName: "", lastName: "", email: "", password: "" });

                setTimeout(() => {
                    navigate("/admin-dashboard");
                }, 1500);
            } else {
                setMessage("❌ " + (res.data.message || "Something went wrong."));
            }
        } catch (err) {
            setMessage("❌ " + (isEditMode ? "Update failed." : "Registration failed."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-form-box">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>{isEditMode ? "Edit Instructor" : "Register Instructor"}</h2>
                <label>First Name <span className="required">*</span></label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
                {errors.firstName && <div className="form-error">{errors.firstName}</div>}

                <label>Last Name <span className="required">*</span></label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
                {errors.lastName && <div className="form-error">{errors.lastName}</div>}

                <label>Email <span className="required">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                {errors.email && <div className="form-error">{errors.email}</div>}
                <label>
                    Password {!isEditMode && <span className="required">*</span>}
                </label>
                <div className="password-input-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        //required={!isEditMode}
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                                    fill="currentColor"
                                />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                                    fill="currentColor"
                                />
                            </svg>
                        )}
                    </button>
                </div>
                {errors.password && <div className="form-error">{errors.password}</div>}
                <button type="submit" className="register-btn" disabled={loading}>
                    {loading ? (isEditMode ? "Updating..." : "Registering...") : (isEditMode ? "Update" : "Register")}
                </button>
                {message && (
                    <div className={message.startsWith("Instructor") ? "form-success" : "form-error"}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}
