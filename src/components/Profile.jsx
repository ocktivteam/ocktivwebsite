// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import DashboardNavbar from './dashboardNavbar';
import "../style/profile.css";


const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5050/auth"
  : "https://ocktivwebsite-3.onrender.com/auth";

// same helper used in payment.jsx
const getUserUpdateApi = (userId) =>
  window.location.hostname === "localhost"
    ? `http://localhost:5050/auth/${userId}/legal-country`
    : `https://ocktivwebsite-3.onrender.com/auth/${userId}/legal-country`;

const backendURL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://ocktivwebsite-3.onrender.com";

const Profile = () => {
  const [currentView, setCurrentView] = useState('view'); // 'view', 'edit', 'password', 'legal'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Form states for edit profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");

  // Full Legal Name (one-time edit) UI state
  const [legalNameInput, setLegalNameInput] = useState("");

  // One-time edit lock (local-only)
  const [legalNameEditedOnce, setLegalNameEditedOnce] = useState(
    localStorage.getItem("legalNameEditedOnce") === "true"
  );

  // Has any certificate (local-only flag; read-only in this component)
  const [hasAnyCertificate, setHasAnyCertificate] = useState(false);

  // Form states for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user?._id) {
      const flag = localStorage.getItem(`legalNameEditedOnce_${user._id}`) === "true";
      setLegalNameEditedOnce(flag);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const checkCertificates = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/certificate/by-user`, {
          params: { userId: user._id },
        });

        // Defensive: support both `{ exists: true }` and `{ certificates: [...] }`
        //const exists = res.data.exists || (Array.isArray(res.data.certificates) && res.data.certificates.length > 0);
        const exists = res.data.exists;
        setHasAnyCertificate(exists);
      } catch (err) {
        console.error("Error checking user certificates:", err);
        setHasAnyCertificate(false);
      }
    };

    checkCertificates();
  }, [user?._id]);


  useEffect(() => {
    // Clear messages when view changes
    setApiError("");
    setSuccessMessage("");
    setErrors({});
  }, [currentView]);

  // Real-time password validation
  useEffect(() => {
    if (newPassword) {
      setPasswordValidation({
        minLength: newPassword.length >= 6,
        hasNumber: /\d/.test(newPassword),
        hasSpecialChar: /[!@#$%^&*]/.test(newPassword)
      });
    } else {
      setPasswordValidation({
        minLength: false,
        hasNumber: false,
        hasSpecialChar: false
      });
    }
  }, [newPassword]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/profile`);
      if (response.data.status) {
        const userData = response.data.user;
        setUser(userData);
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");
        setEmail(userData.email || "");
        setCountry(userData.country || "");
        setLegalNameInput(userData.legalName || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setApiError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => setCurrentView('edit');

  const handleCancelEdit = () => {
    // Reset form to original values
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setCountry(user.country || "");
    // keep the one-time flag consistent with localStorage (bug-free reset)
    setLegalNameEditedOnce(localStorage.getItem("legalNameEditedOnce") === "true");
    setCurrentView('view');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.put(`${API_BASE}/profile`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        // We still send country; backend can ignore for instructors if desired
        country: country.trim()
      });
      if (response.data.status) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setSuccessMessage("Profile updated successfully!");
        setCurrentView('view');
      }
    } catch (error) {
      setApiError(error?.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentView('password');
  };
  const handleCancelPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentView('view');
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!currentPassword) newErrors.currentPassword = "Current password is required";
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    } else if (!/\d/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least 1 number";
    } else if (!/[!@#$%^&*]/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least 1 special character";
    }
    if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.put(`${API_BASE}/change-password`, {
        currentPassword,
        newPassword
      });
      if (response.data.status) {
        setSuccessMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setCurrentView('view');
      }
    } catch (error) {
      setApiError(error?.response?.data?.message || "Failed to change password");
    }
  };

  // --------- One-time Full Legal Name editing (local-only locks) ----------
  const startEditLegalName = () => {
    // Instructors cannot access the legal-name editor
    if (user?.role === "instructor") return;

    // Local-only locks: either used once already, or any certificate flag present
    if (legalNameEditedOnce || hasAnyCertificate) {
      setApiError("Further legal name changes are not allowed. Please contact support@ocktiv.com.");
      setCurrentView('view');
      return;
    }

    setLegalNameInput(user?.legalName || "");
    setCurrentView('legal');
  };

  const cancelEditLegalName = () => {
    setLegalNameInput(user?.legalName || "");
    setCurrentView('view');
  };

  const saveLegalName = async () => {
    // Guard again on save (defense-in-depth)
    if (legalNameEditedOnce || hasAnyCertificate) {
      setApiError("Further legal name changes are not allowed. Please contact support@ocktiv.com.");
      setCurrentView("view");
      return;
    }

    const confirm = window.confirm(
      "⚠️ Are you sure you want to update your legal name? You can only update it once."
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("authToken");
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!token || !currentUser?._id) return;

      await axios.patch(
        getUserUpdateApi(currentUser._id),
        { legalName: legalNameInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...currentUser, legalName: legalNameInput };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      // localStorage.setItem("legalNameEditedOnce", "true");
      localStorage.setItem(`legalNameEditedOnce_${currentUser._id}`, "true");
      setLegalNameEditedOnce(true);

      setUser(updatedUser);
      setSuccessMessage("Full legal name saved.");
      setCurrentView("view");
    } catch (err) {
      console.error("Save legal name failed:", err);
    }
  };
  // -----------------------------------------------------------------------

  const getInitials = () => {
    if (!user) return "";
    return (user.firstName?.[0] || "") + (user.lastName?.[0] || "");
  };
  const getFullName = () => {
    if (!user) return "";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="profile-container">
          <div className="profile-loading">Loading...</div>
        </div>
      </>
    );
  }

  const isInstructor = user?.role === "instructor";

  return (
    <>
      <DashboardNavbar />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">{getInitials()}</div>
            <div className="profile-info">
              <h2>{getFullName()}</h2>
              <p>{user?.email}</p>
            </div>
          </div>

          {successMessage && <div className="profile-success-message">{successMessage}</div>}
          {apiError && <div className="profile-error-message">{apiError}</div>}

          {/* VIEW PROFILE */}
          {currentView === 'view' && (
            <div className="profile-content">
              <div className="profile-section">
                <h3>Account Name</h3>
                <div className="profile-field-group">
                  <div className="profile-field">
                    <label>First Name</label>
                    <div className="profile-value">{user?.firstName || ""}</div>
                  </div>

                  {/* Hide Full Legal Name for instructors */}
                  {!isInstructor && (
                    <div className="profile-field">
                      <label>Full Legal Name</label>
                      <div className="profile-value">{user?.legalName || ""}</div>
                      <small>(as it should appear on the certificate)</small>
                    </div>
                  )}
                </div>

                <div className="profile-field-group">
                  <div className="profile-field">
                    <label>Last Name</label>
                    <div className="profile-value">{user?.lastName || ""}</div>
                  </div>

                  {/* Hide Country for instructors */}
                  {!isInstructor && (
                    <div className="profile-field">
                      <label>Country</label>
                      <div className="profile-value">{user?.country || ""}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-actions">
                <button className="profile-edit-btn" onClick={handleEditProfile}>
                  Edit Profile
                </button>

                {/* Full Legal Name one-time edit entry point (hidden for instructors) */}
                {!isInstructor && (
                  (!legalNameEditedOnce && !hasAnyCertificate) ? (
                    <button className="profile-change-password-link" onClick={startEditLegalName}>
                      Edit Full Legal Name
                    </button>
                  ) : (
                    <span
                      className="profile-change-password-link"
                      style={{ cursor: 'default', textDecoration: 'none' }}
                    >
                      You can no longer change your Full Legal Name here. For further changes, contact support@ocktiv.com
                    </span>
                  )
                )}

                <button className="profile-change-password-link" onClick={handleChangePassword}>
                  Change Password
                </button>
              </div>
            </div>
          )}

          {/* EDIT PROFILE */}
          {currentView === 'edit' && (
            <div className="profile-content">
              <form onSubmit={handleUpdateProfile}>
                <div className="profile-section">
                  <h3>Account Name</h3>
                  <div className="profile-field-group">
                    <div className="profile-field">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={errors.firstName ? "input-error" : ""}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                    </div>

                    {/* Hide Full Legal Name input for instructors */}
                    {!isInstructor && (
                      <div className="profile-field">
                        <label>Full Legal Name</label>
                        <input
                          type="text"
                          value={user?.legalName || ""}
                          readOnly
                          className="readonly-input"
                        />
                        <small>(as it should appear on the certificate)</small>
                      </div>
                    )}
                  </div>

                  <div className="profile-field-group">
                    <div className="profile-field">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={errors.lastName ? "input-error" : ""}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                    </div>

                    {/* Hide Country input for instructors */}
                    {!isInstructor && (
                      <div className="profile-field">
                        <label>Country</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Pick your origin country"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="profile-actions">
                  <button type="submit" className="profile-update-btn">
                    Update Profile
                  </button>
                  <button type="button" className="profile-cancel-link" onClick={handleCancelEdit}>
                    Cancel & Return to Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CHANGE PASSWORD */}
          {currentView === 'password' && (
            <div className="profile-content">
              <form onSubmit={handleUpdatePassword}>
                <div className="profile-section">
                  <h3>Change Password</h3>

                  <div className="profile-field">
                    <label>Enter Old Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter your old password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={errors.currentPassword ? "input-error" : ""}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && <span className="field-error">{errors.currentPassword}</span>}
                  </div>

                  <div className="profile-field">
                    <label>Enter New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter your New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={errors.newPassword ? "input-error" : ""}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
                  </div>

                  {/* Password Criteria */}
                  <div className="password-criteria">
                    <h4>Password Criteria</h4>
                    <ul>
                      <li className={passwordValidation.minLength ? "valid" : ""}>
                        <span className="criteria-icon">{passwordValidation.minLength ? "✓" : "○"}</span>
                        Password must be more than 6 characters
                      </li>
                      <li className={passwordValidation.hasSpecialChar ? "valid" : ""}>
                        <span className="criteria-icon">{passwordValidation.hasSpecialChar ? "✓" : "○"}</span>
                        Password must contain atleast 1 special character (e.g. !@#$%)
                      </li>
                      <li className={passwordValidation.hasNumber ? "valid" : ""}>
                        <span className="criteria-icon">{passwordValidation.hasNumber ? "✓" : "○"}</span>
                        Password must contain a number (e.g. 12345)
                      </li>
                    </ul>
                  </div>

                  <div className="profile-field">
                    <label>Re-type New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-type your New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={errors.confirmPassword ? "input-error" : ""}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                  </div>
                </div>

                <div className="profile-actions">
                  <button type="submit" className="profile-update-btn">
                    Update Password
                  </button>
                  <button type="button" className="profile-cancel-link" onClick={handleCancelPassword}>
                    Cancel & Return to Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* EDIT FULL LEGAL NAME (ONE-TIME) — hidden for instructors */}
          {!isInstructor && currentView === 'legal' && (
            <div className="profile-content">
              <div className="profile-section">
                <h3>Edit Full Legal Name (one-time)</h3>
                <div className="profile-field">
                  <label>Full Legal Name</label>
                  <input
                    type="text"
                    value={legalNameInput}
                    onChange={(e) => setLegalNameInput(e.target.value)}
                    placeholder="Enter your full legal name"
                  />
                </div>
              </div>

              <div className="profile-actions">
                <button type="button" className="profile-update-btn" onClick={saveLegalName}>
                  Save Legal Name
                </button>
                <button type="button" className="profile-cancel-link" onClick={cancelEditLegalName}>
                  Cancel
                </button>
              </div>

              <small style={{ color: "#666", display: "block", marginTop: 12 }}>
                You can only change this once. After saving, additional changes require contacting <b>support@ocktiv.com</b>.
              </small>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
