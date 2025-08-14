// // src/components/courseNavbar.jsx

// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";
// import "../style/courseNavbar.css";
// import { MdOutlineMail, MdNotificationsNone, MdHome } from "react-icons/md"; // <-- Add MdHome

// const COURSE_API =
//   window.location.hostname === "localhost"
//     ? "http://localhost:5050/api/courses"
//     : "https://ocktivwebsite-3.onrender.com/api/courses";

// const COURSE_SHELL_URL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:3000/course-shell"
//     : "https://ocktivwebsite.vercel.app/course-shell";

// const TABS = [
//   { label: "Content", path: "content" },
//   { label: "News", path: "news" },
//   //{ label: "Evaluation", path: "evaluation" },
//   { label: "Assignments", path: "assignment" },
//   { label: "Gradebook", path: "grades" },
//   { label: "Discussion", path: "discussion" }
// ];

// function CourseNavbar() {
//   const navigate = useNavigate();
//   const { courseId } = useParams();
//   const [courseTitle, setCourseTitle] = useState("Course Name");
//   const [user, setUser] = useState(null);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [tabOpen, setTabOpen] = useState(false);

//   useEffect(() => {
//     // Get user info from localStorage
//     try {
//       const userData = JSON.parse(localStorage.getItem("user"));
//       setUser(userData);
//     } catch {
//       setUser(null);
//     }
//   }, []);

//   useEffect(() => {
//     // Fetch course title if courseId present
//     if (!courseId) return;
//     axios
//       .get(`${COURSE_API}/${courseId}`)
//       .then(res => {
//         const ct =
//           res.data?.course?.courseTitle ||
//           res.data?.courseTitle ||
//           "Course Name";
//         setCourseTitle(ct);
//       })
//       .catch(() => setCourseTitle("Course Name"));
//   }, [courseId]);

//   const handleLogout = () => {
//     // Clear all session data
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("user");
    
//     // Use replace to prevent going back
//     navigate('/login', { replace: true });
    
//     // Prevent back button
//     window.history.pushState(null, '', window.location.href);
//     window.onpopstate = function () {
//       window.history.go(1);
//     };
//   };

//   const initials = user
//     ? (user.firstName?.[0] || "") + (user.lastName?.[0] || "")
//     : "";

//   const fullName = user
//     ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
//     : "";

//   // For tab highlight, check location
//   const currentPath = window.location.pathname;
//   const getActiveTab = () => {
//     for (const t of TABS) {
//       if (currentPath.includes(t.path)) return t.label;
//     }
//     return "Content";
//   };
//   const activeTab = getActiveTab();

//   // Tab navigation handler
//   const handleTabClick = (tab) => {
//     if (!courseId) return;
//     switch (tab) {
//       case "Content":
//         navigate(`/course/${courseId}`);
//         break;
//       case "News":
//         navigate(`/news?courseId=${courseId}`);
//         break;
//       // case "Evaluation":
//       //   navigate(`/evaluation?courseId=${courseId}`);
//       //   break;
//       case "Assignment":
//         navigate(`/course/${courseId}/assignment`);
//         break;
//       case "Gradebook":
//         navigate(`/grades?courseId=${courseId}`);
//         break;
//       case "Discussion":
//         navigate(`/discussion?courseId=${courseId}`);
//         break;
//       default:
//         break;
//     }
//     setTabOpen(false);
//   };

//   // Hamburger body scroll lock
//   useEffect(() => {
//     document.body.style.overflow = (menuOpen || tabOpen) ? "hidden" : "";
//     return () => { document.body.style.overflow = ""; }
//   }, [menuOpen, tabOpen]);

//   // Home icon click handler
//   const handleHomeClick = () => {
//     if (user?.role === "admin") {
//       navigate("/admin-dashboard");
//     } else {
//       window.location.href = COURSE_SHELL_URL;
//     }
//   };
  
//   return (
//     <>
//       {/* Top Navbar */}
//       <nav className="course-navbar">
//         <div className="course-navbar-left">
//         <a
//   href="https://ocktiv.com/"
//   target="_blank"
//   rel="noopener noreferrer"
// >
//   <img
//     src="/img/GreenLogoOnly.png"
//     alt="Course Logo"
//     className="course-navbar-logo"
//   />
// </a>
//           <span className="course-navbar-title">{courseTitle}</span>
//         </div>
//         {/* Desktop Right */}
//         <div className="course-navbar-right desktop-nav">
//           {/* HOME ICON */}
//           <button
//             className="course-icon-btn"
//             title="Home"
//             aria-label="Home"
//             type="button"
//             onClick={handleHomeClick}
//           >
//             <MdHome className="course-icon" size={36} />
//           </button>
//           {/* EMAIL ICON */}
//           <button
//             className="course-icon-btn"
//             title="Email"
//             aria-label="Email"
//             type="button"
//             onClick={() => alert("Email clicked!")}
//           >
//             <MdOutlineMail className="course-icon" size={36} />
//           </button>
//           {/* NOTIFICATION ICON */}
//           <button
//             className="course-icon-btn"
//             title="Notifications"
//             aria-label="Notifications"
//             type="button"
//             onClick={() => alert("Notifications clicked!")}
//           >
//             <MdNotificationsNone className="course-icon" size={36} />
//           </button>
//           <span className="course-user-initials">{initials}</span>
//           <span className="course-user-fullname">{fullName}</span>
//           <button className="course-navbar-logout-btn" onClick={handleLogout}>
//             Logout
//           </button>
//         </div>
//         {/* Hamburger for mobile */}
//         <div
//           className="course-hamburger"
//           onClick={() => setMenuOpen(true)}
//           tabIndex={0}
//           aria-label="Open navigation"
//           onKeyPress={e => { if (e.key === "Enter") setMenuOpen(true); }}
//         >
//           <span />
//           <span />
//           <span />
//         </div>
//         {/* Mobile menu */}
//         {menuOpen && (
//           <div className="course-mobile-menu">
//             <button
//               className="course-menu-close"
//               onClick={() => setMenuOpen(false)}
//               aria-label="Close navigation"
//             >
//               &times;
//             </button>
//             <ul>
//               <li>
//                 {/* HOME ICON in mobile */}
//                 <span
//                   className="course-menu-link"
//                   style={{ display: "flex", alignItems: "center" }}
//                   onClick={() => {
//                     setMenuOpen(false);
//                     handleHomeClick();
//                   }}
//                 >
//                   <MdHome className="course-icon" style={{ marginRight: 8 }} size={16} /> Home
//                 </span>
//               </li>
//               <li>
//                 <span
//                   className="course-menu-link"
//                   style={{ display: "flex", alignItems: "center" }}
//                   onClick={() => alert("Email clicked!")}
//                 >
//                   <MdOutlineMail className="course-icon" style={{ marginRight: 8 }} size={16} /> Email
//                 </span>
//               </li>
//               <li>
//                 <span
//                   className="course-menu-link"
//                   style={{ display: "flex", alignItems: "center" }}
//                   onClick={() => alert("Notifications clicked!")}
//                 >
//                   <MdNotificationsNone className="course-icon" style={{ marginRight: 8 }} size={16} /> Notifications
//                 </span>
//               </li>
//               <li>
//                 <span className="course-menu-link course-user-initials" style={{ marginRight: 8 }}>{initials}</span> {fullName}
//               </li>
//               <li>
//                 <button
//                   className="course-menu-link"
//                   style={{ background: "none", border: "none", color: "inherit" }}
//                   onClick={() => { setMenuOpen(false); handleLogout(); }}
//                 >
//                   Logout
//                 </button>
//               </li>
//               <li>
//                 <button
//                   className="course-menu-link"
//                   style={{ background: "none", border: "none", color: "inherit", marginTop: 14 }}
//                   onClick={() => { setTabOpen(true); setMenuOpen(false); }}
//                 >
//                   Course Menu
//                 </button>
//               </li>
//             </ul>
//           </div>
//         )}
//       </nav>
//       {/* Second (Green) Navbar */}
//       <div className="course-tabs-navbar desktop-tabs">
//         {TABS.map(tab => (
//           <button
//             key={tab.label}
//             className={`course-tab-btn${activeTab === tab.label ? " active" : ""}`}
//             onClick={() => handleTabClick(tab.label)}
//             tabIndex={0}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>
//       {/* Mobile Course Menu (tabs) */}
//       {tabOpen && (
//         <div className="course-mobile-tabs-menu">
//           <button
//             className="course-menu-close"
//             onClick={() => setTabOpen(false)}
//             aria-label="Close menu"
//           >&times;</button>
//           <ul>
//             {TABS.map(tab => (
//               <li key={tab.label}>
//                 <button
//                   className={`course-tab-btn${activeTab === tab.label ? " active" : ""}`}
//                   onClick={() => handleTabClick(tab.label)}
//                   tabIndex={0}
//                 >
//                   {tab.label}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </>
//   );
// }

// export default CourseNavbar;


// New Aug 12

// src/components/courseNavbar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../style/courseNavbar.css";
import { MdOutlineMail, MdNotificationsNone, MdHome } from "react-icons/md"; // <-- Add MdHome
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
  //{ label: "Evaluation", path: "evaluation" },
  { label: "Assignments", path: "assignment" },
  { label: "Gradebook", path: "grades" },
  { label: "Discussion", path: "discussion" }
];

function CourseNavbar() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [courseTitle, setCourseTitle] = useState("Course Name");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tabOpen, setTabOpen] = useState(false);

  const [showEmailPopup, setShowEmailPopup] = useState(false);

  useEffect(() => {
    // Get user info from localStorage
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Fetch course title if courseId present
    if (!courseId) return;
    axios
      .get(`${COURSE_API}/${courseId}`)
      .then(res => {
        const ct =
          res.data?.course?.courseTitle ||
          res.data?.courseTitle ||
          "Course Name";
        setCourseTitle(ct);
      })
      .catch(() => setCourseTitle("Course Name"));
  }, [courseId]);

  const handleLogout = () => {
    // Clear all session data
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    
    // Use replace to prevent going back
    navigate('/login', { replace: true });
    
    // Prevent back button
    window.history.pushState(null, '', window.location.href);
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
    const canSeeClassList = user && (user.role === "instructor" || user.role === "admin");
    if (canSeeClassList) {
      // Insert right after "Content" (index 0)
      arr.splice(1, 0, { label: "Class List", path: "classlist" });
    }
    return arr;
  }, [user]);

  // For tab highlight, check location
  const currentPath = window.location.pathname;
  const getActiveTab = () => {
    for (const t of tabs) {
      if (currentPath.includes(t.path)) return t.label;
    }
    return "Content";
  };
  const activeTab = getActiveTab();

  // Tab navigation handler
  const handleTabClick = (tab) => {
    if (!courseId) return;
    switch (tab) {
      case "Content":
        navigate(`/course/${courseId}`);
        break;
      case "Class List":
        navigate(`/course/${courseId}/classlist`);
        break;
      case "News":
        navigate(`/news?courseId=${courseId}`);
        break;
      // case "Evaluation":
      //   navigate(`/evaluation?courseId=${courseId}`);
      //   break;
      case "Assignment":
      case "Assignments": // handle both just in case
        navigate(`/course/${courseId}/assignment`);
        break;
      case "Gradebook":
        navigate(`/grades?courseId=${courseId}`);
        break;
      case "Discussion":
        navigate(`/discussion?courseId=${courseId}`);
        break;
      default:
        break;
    }
    setTabOpen(false);
  };

  // Hamburger body scroll lock
  useEffect(() => {
    document.body.style.overflow = (menuOpen || tabOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; }
  }, [menuOpen, tabOpen]);

  // Home icon click handler
  const handleHomeClick = () => {
    if (user?.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      window.location.href = COURSE_SHELL_URL;
    }
  };

  // ↓Open compose helpers
  const openCompose = () => setShowEmailPopup(true);
  const closeCompose = () => setShowEmailPopup(false);

  const senderId = user?._id; // used by the popup

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
          {/* HOME ICON */}
          <button
            className="course-icon-btn"
            title="Home"
            aria-label="Home"
            type="button"
            onClick={handleHomeClick}
          >
            <MdHome className="course-icon" size={36} />
          </button>
          {/* EMAIL ICON */}
           <button
            className="course-icon-btn"
            title="Email"
            aria-label="Email"
            type="button"
            onClick={openCompose}
          >
            <MdOutlineMail className="course-icon" size={36} />
          </button>
          {/* NOTIFICATION ICON */}
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
          <span className="course-user-fullname">{fullName}</span>
          <button className="course-navbar-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        {/* Hamburger for mobile */}
        <div
          className="course-hamburger"
          onClick={() => setMenuOpen(true)}
          tabIndex={0}
          aria-label="Open navigation"
          onKeyPress={e => { if (e.key === "Enter") setMenuOpen(true); }}
        >
          <span />
          <span />
          <span />
        </div>
        {/* Mobile menu */}
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
                {/* HOME ICON in mobile */}
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
                  onClick={() => { setMenuOpen(false); openCompose(); }}
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
                  <MdNotificationsNone className="course-icon" style={{ marginRight: 8 }} size={16} /> Notifications
                </span>
              </li>
              <li>
                <span className="course-menu-link course-user-initials" style={{ marginRight: 8 }}>{initials}</span> {fullName}
              </li>
              <li>
                <button
                  className="course-menu-link"
                  style={{ background: "none", border: "none", color: "inherit" }}
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                >
                  Logout
                </button>
              </li>
              <li>
                <button
                  className="course-menu-link"
                  style={{ background: "none", border: "none", color: "inherit", marginTop: 14 }}
                  onClick={() => { setTabOpen(true); setMenuOpen(false); }}
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
        {tabs.map(tab => (
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
      {/* Mobile Course Menu (tabs) */}
      {tabOpen && (
        <div className="course-mobile-tabs-menu">
          <button
            className="course-menu-close"
            onClick={() => setTabOpen(false)}
            aria-label="Close menu"
          >&times;</button>
          <ul>
            {tabs.map(tab => (
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
   {/* Compose popup (bottom-right) */}
   {showEmailPopup && user?._id && (
        <EmailComposePopup
          courseId={courseId}
          senderId={senderId}
          onClose={closeCompose}
        />
      )}
    </>
  );
}

export default CourseNavbar;
