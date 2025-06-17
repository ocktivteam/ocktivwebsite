import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SessionWarning from "./SessionWarning";
import axios from "axios";

const REFRESH_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/auth/refresh-token"
    : "https://ocktivwebsite-3.onrender.com/auth/refresh-token";

function SessionManager({ children }) {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const warningTimeout = useRef();
  const logoutTimeout = useRef();

  // Utility: clear timers
  const clearTimers = () => {
    clearTimeout(warningTimeout.current);
    clearTimeout(logoutTimeout.current);
  };

  // Set up session timers (run when token changes)
  useEffect(() => {
    if (!token) return;

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch {
      handleLogout(true); // auto-logout
      return;
    }
    if (!decoded.exp) {
      handleLogout(true); // auto-logout
      return;
    }

    const expiry = decoded.exp * 1000;
    const now = Date.now();
    const msUntilExpire = expiry - now;
    const msUntilWarning = msUntilExpire - 60000; // 1min before expiry

    if (msUntilWarning > 0) {
      warningTimeout.current = setTimeout(() => setShowWarning(true), msUntilWarning);
    } else {
      setShowWarning(true); // If already within 1min
    }
    if (msUntilExpire > 0) {
      logoutTimeout.current = setTimeout(() => handleLogout(true), msUntilExpire);
    } else {
      handleLogout(true); // auto-logout
    }

    return () => clearTimers();
    // eslint-disable-next-line
  }, [token]);

  // Handle logout logic
  const handleLogout = (isSessionExpired = true) => {
    clearTimers();
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setShowWarning(false);
    setToken(null);
    // Only show sessionExpired message if it's an auto-logout
    if (isSessionExpired) {
      navigate("/login", { state: { sessionExpired: true } });
    } else {
      navigate("/login");
    }
  };

  // Handle continue session
  const handleContinue = async () => {
    try {
      clearTimers();
      const oldToken = token;
      const res = await axios.post(REFRESH_URL, {}, {
        headers: { Authorization: `Bearer ${oldToken}` }
      });
      if (res.data && res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        setShowWarning(false);
        setToken(res.data.token);
      } else {
        handleLogout(true);
      }
    } catch (err) {
      handleLogout(true);
    }
  };

  return (
    <>
      {children}
      <SessionWarning
        open={showWarning}
        onContinue={handleContinue}
        onLogout={() => handleLogout(false)} // Manual: don't show session expired message
      />
    </>
  );
}

export default SessionManager;
