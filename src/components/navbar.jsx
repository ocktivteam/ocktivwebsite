// // src/components/navbar.jsx

// import React, { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import "../style/Navbar.css"; // Create this or import into index.css if you prefer global styles

// function Navbar() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   const navigate = useNavigate();

//   useEffect(() => {
//     setIsLoggedIn(!!localStorage.getItem("authToken"));
//   }, []);

//   // Keep navbar state in sync across tabs/windows
//   useEffect(() => {
//     const handler = () => setIsLoggedIn(!!localStorage.getItem("authToken"));
//     window.addEventListener("storage", handler);
//     return () => window.removeEventListener("storage", handler);
//   }, []);

//   const handleLogout = () => {
//     // Check if we're on course details or payment page
//     const currentPath = window.location.pathname;
//     const isSpecialPage = currentPath.includes('/coursedetails/') || currentPath.includes('/payment');
    
//     // Clear all session data
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("user");
//     setIsLoggedIn(false);
    
//     if (isSpecialPage) {
//       // Special redirect for course details and payment pages
//       navigate('/login', { replace: true });
      
//       // Override back button to go to courses page
//       window.history.pushState(null, '', '/courses');
//       window.history.pushState(null, '', '/login');
//     } else {
//       // Normal logout behavior for other pages
//       navigate('/login', { replace: true });
      
//       // Prevent back button normally
//       window.history.pushState(null, '', window.location.href);
//       window.onpopstate = function () {
//         window.history.go(1);
//       };
//     }
//   };

//   // Prevent background scroll for mobile menu
//   useEffect(() => {
//     document.body.style.overflow = menuOpen ? 'hidden' : '';
//     return () => { document.body.style.overflow = ''; }
//   }, [menuOpen]);

//   return (
//     <nav className="ocktiv-navbar">
//       <div className="navbar-left">
//         <a href="https://ocktiv.com/">
//           <img src="/img/WhiteLogo.png" alt="Ocktiv Logo" className="navbar-logo" />
//         </a>
//       </div>
//       {/* Desktop links */}
//       <ul className="navbar-links desktop-nav">
//         <li>
//           <Link to="/courses" className="active-link">Courses</Link>
//         </li>
//         <li>
//           <a href="https://ocktiv.com/#About" target="_blank" rel="noopener noreferrer">About</a>
//         </li>
//         <li>
//           <a href="https://bucolic-profiterole-262b56.netlify.app/" target="_blank" rel="noopener noreferrer">Services</a>
//         </li>
//       </ul>
//       <div className="navbar-login-wrap desktop-nav">
//         {isLoggedIn ? (
//           <button className="navbar-login-btn" onClick={handleLogout}>Logout</button>
//         ) : (
//           <Link to="/login" className="navbar-login-btn">Login</Link>
//         )}
//       </div>
//       {/* Hamburger mobile menu */}
//       <div
//         className="apple-hamburger"
//         onClick={() => setMenuOpen(true)}
//         tabIndex={0}
//         aria-label="Open navigation"
//         onKeyPress={e => { if (e.key === 'Enter') setMenuOpen(true); }}
//       >
//         <span />
//         <span />
//         <span />
//       </div>
//       {menuOpen && (
//         <div className="apple-mobile-menu">
//           <button
//             className="apple-menu-close"
//             onClick={() => setMenuOpen(false)}
//             aria-label="Close navigation"
//           >&times;</button>
//           <ul>
//             <li><Link to="/courses" className="apple-menu-link bold" onClick={() => setMenuOpen(false)}>Courses</Link></li>
//             <li><a href="https://ocktiv.com/#About" target="_blank" rel="noopener noreferrer" className="apple-menu-link" onClick={() => setMenuOpen(false)}>About</a></li>
//             <li><a href="https://bucolic-profiterole-262b56.netlify.app/" target="_blank" rel="noopener noreferrer" className="apple-menu-link" onClick={() => setMenuOpen(false)}>Services</a></li>
//             {isLoggedIn ? (
//               <li>
//                 <button className="apple-menu-link" style={{ background: "none", border: "none", color: "inherit" }} onClick={() => { setMenuOpen(false); handleLogout(); }}>
//                   Logout
//                 </button>
//               </li>
//             ) : (
//               <li>
//                 <Link to="/login" className="apple-menu-link" onClick={() => setMenuOpen(false)}>Login</Link>
//               </li>
//             )}
//           </ul>
//         </div>
//       )}
//     </nav>
//   );
// }

// export default Navbar;


// === new

// src/components/navbar.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("authToken"));
  }, []);

  // Keep navbar state in sync across tabs/windows
  useEffect(() => {
    const handler = () => setIsLoggedIn(!!localStorage.getItem("authToken"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleLogout = () => {
    const currentPath = window.location.pathname;
    const isSpecialPage =
      currentPath.includes("/coursedetails/") || currentPath.includes("/payment");

    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);

    if (isSpecialPage) {
      navigate("/login", { replace: true });
      window.history.pushState(null, "", "/courses");
      window.history.pushState(null, "", "/login");
    } else {
      navigate("/login", { replace: true });
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = function () {
        window.history.go(1);
      };
    }
  };

  // Prevent background scroll for mobile menu
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav className="ocktiv-navbar">
      <div className="navbar-left">
        <a href="https://ocktiv.com/">
          <img src="/img/WhiteLogo.png" alt="Ocktiv Logo" className="navbar-logo" />
        </a>
      </div>

      {/* Desktop links */}
      <ul className="navbar-links desktop-nav">
        {/* ✅ Dashboard before Courses */}
        <li>
          <Link to="/" className="dashboard-link" aria-label="Dashboard">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/courses" className="active-link">Courses</Link>
        </li>
        <li>
          <a href="https://ocktiv.com/#About" target="_blank" rel="noopener noreferrer">About</a>
        </li>
        <li>
          <a href="https://bucolic-profiterole-262b56.netlify.app/" target="_blank" rel="noopener noreferrer">Services</a>
        </li>
      </ul>

      <div className="navbar-login-wrap desktop-nav">
        {isLoggedIn ? (
          <button className="navbar-login-btn" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login" className="navbar-login-btn">Login</Link>
        )}
      </div>

      {/* Hamburger mobile menu */}
      <div
        className="apple-hamburger"
        onClick={() => setMenuOpen(true)}
        tabIndex={0}
        aria-label="Open navigation"
        onKeyPress={e => { if (e.key === "Enter") setMenuOpen(true); }}
      >
        <span />
        <span />
        <span />
      </div>

      {menuOpen && (
        <div className="apple-mobile-menu">
          <button
            className="apple-menu-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            &times;
          </button>
          <ul>
            {/* ✅ Dashboard in mobile menu */}
            <li>
              <Link
                to="/"
                className="apple-menu-link bold"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/courses"
                className="apple-menu-link bold"
                onClick={() => setMenuOpen(false)}
              >
                Courses
              </Link>
            </li>
            <li>
              <a
                href="https://ocktiv.com/#About"
                target="_blank"
                rel="noopener noreferrer"
                className="apple-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="https://bucolic-profiterole-262b56.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="apple-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                Services
              </a>
            </li>
            {isLoggedIn ? (
              <li>
                <button
                  className="apple-menu-link"
                  style={{ background: "none", border: "none", color: "inherit" }}
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                >
                  Logout
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="apple-menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
