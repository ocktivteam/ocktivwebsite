// src/components/courseNavbar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "../style/courseNavbar.css";
import { MdOutlineMail, MdNotificationsNone, MdHome } from "react-icons/md";
import EmailComposePopup from "./EmailComposePopup";

const COURSE_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/courses"
    : "https://ocktivwebsite-3.onrender.com/api/courses";

const COURSE_SHELL_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/course-shell"
    : "https://ocktivwebsite.vercel.app/course-shell";

// Base tabs (we'll insert Class List dynamically after Content)
const BASE_TABS = [
  { label: "Content", path: "content" },
  { label: "News", path: "news" },
  { label: "Assignments", path: "assignment" },
  { label: "Gradebook", path: "grades" },
  { label: "Discussion", path: "discussions" }, // <- plural to match route
];

function CourseNavbar() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();

  const [courseTitle, setCourseTitle] = useState("Course Name");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tabOpen, setTabOpen] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  // Helper: read courseId from query string
  const getCourseIdFromQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get("courseId");
  };

  // Helper: best available courseId
  const getUsableCourseId = () => {
    return courseId || getCourseIdFromQuery() || localStorage.getItem("lastCourseId") || null;
  };

  // Load user
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  // Remember last visited courseId whenever we can detect one (param or query)
  useEffect(() => {
    const fromQuery = getCourseIdFromQuery();
    const cid = courseId || fromQuery;
    if (cid) localStorage.setItem("lastCourseId", cid);
  }, [courseId, location.search]);

  // Navbar title logic
  useEffect(() => {
    if (location.pathname.startsWith("/profile")) {
      setCourseTitle("User Profile");
      return;
    }

    const cid = getUsableCourseId();

    if (cid) {
      axios
        .get(`${COURSE_API}/${cid}`)
        .then((res) => {
          const ct =
            res.data?.course?.courseTitle ||
            res.data?.courseTitle ||
            "Course Name";
          setCourseTitle(ct);
        })
        .catch(() => setCourseTitle("Course Name"));
    } else {
      setCourseTitle("Course Name");
    }
  }, [location.pathname, location.search, courseId]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
  };

  const initials = user
    ? (user.firstName?.[0] || "") + (user.lastName?.[0] || "")
    : "";

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "";

  // Build tabs dynamically: insert "Class List" after Content for instructors/admins only
  const tabs = useMemo(() => {
    const arr = [...BASE_TABS];
    const canSeeClassList =
      user && (user.role === "instructor" || user.role === "admin");
    if (canSeeClassList) {
      arr.splice(1, 0, { label: "Class List", path: "classlist" });
    }
    return arr;
  }, [user]);

  // Active tab highlight
  const currentPath = window.location.pathname;
  const getActiveTab = () => {
    for (const t of tabs) {
      if (currentPath.includes(t.path)) return t.label;
    }
    return "Content";
  };
  const activeTab = getActiveTab();

  // Ensure tabs work from any page (including /profile)
  const handleTabClick = (tab) => {
    const cid = getUsableCourseId();

    if (!cid) {
      navigate("/course-shell");
      setTabOpen(false);
      return;
    }

    switch (tab) {
      case "Content":
        navigate(`/course/${cid}`);
        break;
      case "Class List":
        navigate(`/course/${cid}/classlist`);
        break;
      case "News":
        navigate(`/news?courseId=${cid}`);
        break;
      case "Assignments":
      case "Assignment":
        navigate(`/course/${cid}/assignment`);
        break;
      case "Gradebook":
        navigate(`/grades?courseId=${cid}`);
        break;
      case "Discussion":
        navigate(`/course/${cid}/discussions`); // <- new route
        break;
      default:
        break;
    }
    setTabOpen(false);
  };

  // Scroll lock for overlays
  useEffect(() => {
    document.body.style.overflow = menuOpen || tabOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, tabOpen]);

  const handleHomeClick = () => {
    if (user?.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      window.location.href = COURSE_SHELL_URL;
    }
  };

  const openCompose = () => {
    if (user?.role === "student") {
      setShowEmailPopup(true);
    } else {
      alert("This feature is only available for students.");
    }
  };
  const closeCompose = () => setShowEmailPopup(false);

  const senderId = user?._id;

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="course-navbar">
        <div className="course-navbar-left">
          <a
            href="https://ocktiv.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/img/GreenLogoOnly.png"
              alt="Course Logo"
              className="course-navbar-logo"
            />
          </a>
          <span className="course-navbar-title">{courseTitle}</span>
        </div>

        {/* Desktop Right */}
        <div className="course-navbar-right desktop-nav">
          <button
            className="course-icon-btn"
            title="Home"
            aria-label="Home"
            type="button"
            onClick={handleHomeClick}
          >
            <MdHome className="course-icon" size={36} />
          </button>
          <button
            className="course-icon-btn"
            title="Email"
            aria-label="Email"
            type="button"
            onClick={openCompose}
          >
            <MdOutlineMail className="course-icon" size={36} />
          </button>
          <button
            className="course-icon-btn"
            title="Notifications"
            aria-label="Notifications"
            type="button"
            onClick={() => alert("Notifications clicked!")}
          >
            <MdNotificationsNone className="course-icon" size={36} />
          </button>
          <span className="course-user-initials">{initials}</span>
          <span
            className="course-user-fullname clickable-name"
            onClick={handleProfileClick}
            style={{ cursor: "pointer" }}
            title="Go to Profile"
          >
            {fullName}
          </span>
          <button className="course-navbar-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Hamburger */}
        <div
          className="course-hamburger"
          onClick={() => setMenuOpen(true)}
          tabIndex={0}
          aria-label="Open navigation"
          onKeyPress={(e) => {
            if (e.key === "Enter") setMenuOpen(true);
          }}
        >
          <span />
          <span />
          <span />
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="course-mobile-menu">
            <button
              className="course-menu-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation"
            >
              &times;
            </button>
            <ul>
              <li>
                <span
                  className="course-menu-link"
                  style={{ display: "flex", alignItems: "center" }}
                  onClick={() => {
                    setMenuOpen(false);
                    handleHomeClick();
                  }}
                >
                  <MdHome className="course-icon" style={{ marginRight: 8 }} size={16} /> Home
                </span>
              </li>
              <li>
                <span
                  className="course-menu-link"
                  style={{ display: "flex", alignItems: "center" }}
                  onClick={() => {
                    setMenuOpen(false);
                    openCompose();
                  }}
                >
                  <MdOutlineMail className="course-icon" style={{ marginRight: 8 }} size={16} /> Email
                </span>
              </li>
              <li>
                <span
                  className="course-menu-link"
                  style={{ display: "flex", alignItems: "center" }}
                  onClick={() => alert("Notifications clicked!")}
                >
                  <MdNotificationsNone
                    className="course-icon"
                    style={{ marginRight: 8 }}
                    size={16}
                  />{" "}
                  Notifications
                </span>
              </li>
              <li>
                <span className="course-menu-link course-user-initials" style={{ marginRight: 8 }}>
                  {initials}
                </span>
                <span
                  className="course-menu-link clickable-name"
                  onClick={() => {
                    setMenuOpen(false);
                    handleProfileClick();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {fullName}
                </span>
              </li>
              <li>
                <button
                  className="course-menu-link"
                  style={{ background: "none", border: "none", color: "inherit" }}
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </li>
              <li>
                <button
                  className="course-menu-link"
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    marginTop: 14,
                  }}
                  onClick={() => {
                    setTabOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  Course Menu
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Second (Green) Navbar */}
      <div className="course-tabs-navbar desktop-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`course-tab-btn${activeTab === tab.label ? " active" : ""}`}
            onClick={() => handleTabClick(tab.label)}
            tabIndex={0}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile Course Menu */}
      {tabOpen && (
        <div className="course-mobile-tabs-menu">
          <button
            className="course-menu-close"
            onClick={() => setTabOpen(false)}
            aria-label="Close menu"
          >
            &times;
          </button>
          <ul>
            {tabs.map((tab) => (
              <li key={tab.label}>
                <button
                  className={`course-tab-btn${activeTab === tab.label ? " active" : ""}`}
                  onClick={() => handleTabClick(tab.label)}
                  tabIndex={0}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Compose popup */}
      {showEmailPopup && user?._id && (
        <EmailComposePopup
          courseId={getUsableCourseId() || undefined}
          senderId={user._id}
          onClose={setShowEmailPopup.bind(null, false)}
        />
      )}
    </>
  );
}

export default CourseNavbar;
