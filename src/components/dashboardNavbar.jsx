// // src/components/dashboardNavbar.jsx

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import "../style/dashboardNavbar.css";
// import { MdOutlineMail, MdNotificationsNone } from "react-icons/md"; // MATERIAL ICONS

// function DashboardNavbar() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     try {
//       const userData = JSON.parse(localStorage.getItem("user"));
//       setUser(userData);
//     } catch {
//       setUser(null);
//     }
//   }, []);

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

//   useEffect(() => {
//     document.body.style.overflow = menuOpen ? 'hidden' : '';
//     return () => { document.body.style.overflow = ''; }
//   }, [menuOpen]);

//   const initials = user
//     ? (user.firstName?.[0] || "") + (user.lastName?.[0] || "")
//     : "";

//   const fullName = user
//     ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
//     : "";

//   return (
//     <nav className="dashboard-navbar">
//       <div className="dashboard-navbar-left">
//         <a href="https://ocktiv.com/">
//           <img
//             src="/img/WhiteLogoOnly.png"
//             alt="Ocktiv Logo"
//             className="dashboard-navbar-logo"
//           />
//         </a>
//         <span className="dashboard-navbar-title">Your Course(s)</span>
//       </div>

//       {/* Desktop right section with Material Icons */}
//       <div className="dashboard-navbar-right desktop-nav">
//         {/* Mail/Email Icon */}
//         <button
//           className="dashboard-icon-btn"
//           title="Email"
//           aria-label="Email"
//           type="button"
//           onClick={() => {
//             alert("Email clicked!");
//           }}
//         >
//           <MdOutlineMail className="dashboard-icon" size={48} />
//         </button>
//         {/* Notification Icon */}
//         <button
//           className="dashboard-icon-btn"
//           title="Notifications"
//           aria-label="Notifications"
//           type="button"
//           onClick={() => {
//             alert("Notifications clicked!");
//           }}
//         >
//           <MdNotificationsNone className="dashboard-icon" size={48} />
//         </button>
//         <span className="dashboard-user-initials">{initials}</span>
//         <span className="dashboard-user-fullname">{fullName}</span>
//         <button className="dashboard-navbar-login-btn" onClick={handleLogout}>
//           Logout
//         </button>
//       </div>

//       {/* Hamburger for mobile, appears rightmost */}
//       <div
//         className="dashboard-apple-hamburger"
//         onClick={() => setMenuOpen(true)}
//         tabIndex={0}
//         aria-label="Open navigation"
//         onKeyPress={e => { if (e.key === 'Enter') setMenuOpen(true); }}
//       >
//         <span />
//         <span />
//         <span />
//       </div>

//       {/* Apple style mobile menu (Material Icons here too) */}
//       {menuOpen && (
//         <div className="dashboard-apple-mobile-menu">
//           <button
//             className="dashboard-apple-menu-close"
//             onClick={() => setMenuOpen(false)}
//             aria-label="Close navigation"
//           >&times;</button>
//           <ul>
//             <li>
//               <span className="dashboard-apple-menu-link" style={{display: "flex", alignItems: "center"}}>
//                 <MdOutlineMail className="dashboard-icon" style={{marginRight: 8}} size={16}/> Email
//               </span>
//             </li>
//             <li>
//               <span className="dashboard-apple-menu-link" style={{display: "flex", alignItems: "center"}}>
//                 <MdNotificationsNone className="dashboard-icon" style={{marginRight: 8}} size={16}/> Notifications
//               </span>
//             </li>
//             <li>
//               <span className="dashboard-apple-menu-link dashboard-user-initials" style={{marginRight: 8}}>{initials}</span> {fullName}
//             </li>
//             <li>
//               <button
//                 className="dashboard-apple-menu-link"
//                 style={{ background: "none", border: "none", color: "inherit" }}
//                 onClick={() => { setMenuOpen(false); handleLogout(); }}
//               >
//                 Logout
//               </button>
//             </li>
//           </ul>
//         </div>
//       )}
//     </nav>
//   );
// }

// export default DashboardNavbar;


// === new

// src/components/dashboardNavbar.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/dashboardNavbar.css";
import { MdOutlineMail, MdNotificationsNone } from "react-icons/md"; // MATERIAL ICONS

function DashboardNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate('/login', { replace: true });
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
  };

  // const handleProfileClick = () => {
  //   setMenuOpen(false);        // close mobile menu if open
  //   navigate('/profile');      // go to profile
  // };


  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; }
  }, [menuOpen]);

  const initials = user
    ? (user.firstName?.[0] || "") + (user.lastName?.[0] || "")
    : "";

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "";

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-navbar-left">
        <a href="https://ocktiv.com/">
          <img
            src="/img/WhiteLogoOnly.png"
            alt="Ocktiv Logo"
            className="dashboard-navbar-logo"
          />
        </a>
        <span className="dashboard-navbar-title">Your Course(s)</span>
      </div>

      {/* Desktop right section */}
      <div className="dashboard-navbar-right desktop-nav">
        <button
          className="dashboard-icon-btn"
          title="Email"
          aria-label="Email"
          type="button"
          onClick={() => alert("Email clicked!")}
        >
          <MdOutlineMail className="dashboard-icon" size={48} />
        </button>
        <button
          className="dashboard-icon-btn"
          title="Notifications"
          aria-label="Notifications"
          type="button"
          onClick={() => alert("Notifications clicked!")}
        >
          <MdNotificationsNone className="dashboard-icon" size={48} />
        </button>
        <span className="dashboard-user-initials">{initials}</span>
        <span
          className="dashboard-user-fullname"
          style={{ cursor: "pointer" }}
          onClick={handleProfileClick}
          title="Go to Profile"
        >
          {fullName}
        </span>
        <button className="dashboard-navbar-login-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Hamburger */}
      <div
        className="dashboard-apple-hamburger"
        onClick={() => setMenuOpen(true)}
        tabIndex={0}
        aria-label="Open navigation"
        onKeyPress={e => { if (e.key === 'Enter') setMenuOpen(true); }}
      >
        <span />
        <span />
        <span />
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="dashboard-apple-mobile-menu">
          <button
            className="dashboard-apple-menu-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >&times;</button>
          <ul>
            <li>
              <span className="dashboard-apple-menu-link" style={{display: "flex", alignItems: "center"}}>
                <MdOutlineMail className="dashboard-icon" style={{marginRight: 8}} size={16}/> Email
              </span>
            </li>
            <li>
              <span className="dashboard-apple-menu-link" style={{display: "flex", alignItems: "center"}}>
                <MdNotificationsNone className="dashboard-icon" style={{marginRight: 8}} size={16}/> Notifications
              </span>
            </li>
            <li>
              <span className="dashboard-apple-menu-link dashboard-user-initials" style={{marginRight: 8}}>{initials}</span>
              <span
                className="dashboard-apple-menu-link"
                style={{ cursor: "pointer" }}
                onClick={() => { setMenuOpen(false); handleProfileClick(); }}
              >
                {fullName}
              </span>
            </li>

            <li>
              <button
                className="dashboard-apple-menu-link"
                style={{ background: "none", border: "none", color: "inherit" }}
                onClick={() => { setMenuOpen(false); handleLogout(); }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default DashboardNavbar;
