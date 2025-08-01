import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      if (window.history.length > 1) {
        navigate(-1, { replace: true });
      } else {
        navigate("/", { replace: true }); // fallback, can set to "/login"
      }
    }
  }, [navigate, user]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return children;
};

export default AdminRoute;
