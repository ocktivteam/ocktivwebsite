// src/utils/auth.js
import { jwtDecode } from "jwt-decode";

// Remove auth data and redirect to login
export function logoutUser(navigate) {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  navigate("/login", { state: { sessionExpired: true } });
}

// Just save the token—no timers
export function handleAuthToken(token) {
  localStorage.setItem("authToken", token);
}

// Utility: Check if token is expired
export function isTokenExpired() {
  const token = localStorage.getItem("authToken");
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}
