import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/allcourses.css";
 
const courseList = [
  {
    title: "Lean Six Sigma Yellow Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  },
  {
    title: "Lean Six Sigma White Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  },
  {
    title: "Lean Six Sigma Green Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  },
  {
    title: "Lean Six Sigma Master Black Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  },
  {
    title: "Lean Six Sigma Yellow Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  },
  {
    title: "Lean Six Sigma White Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  },
  {
    title: "Lean Six Sigma Green Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  },
  {
    title: "Lean Six Sigma Yellow Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  },
  {
    title: "Lean Six Sigma Black Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  },
  {
    title: "Lean Six Sigma Yellow Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  },
  {
    title: "Lean Six Sigma Yellow Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  },
  
  {
    title: "Lean Six Sigma Black Belt",
    instructor: "Ankit Mathur",
    duration: "3 Hours",
  }
];
 
function AllCourses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
 
  const perPage = 9;
  const navigate = useNavigate();
 
  // Filter courses by search only
  const filteredCourses = courseList.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / perPage);
  const paginatedCourses = filteredCourses.slice((page - 1) * perPage, page * perPage);
 
  // If user changes search, go back to page 1
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);
 
  // Disable background scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; }
  }, [menuOpen]);
 
  return (
    <div className="allcourses-bg">
      {/* NAVBAR */}
      <nav className="ocktiv-navbar">
        <div className="navbar-left">
          <a href="https://ocktiv.com/">
            <img src="/img/WhiteLogo.png" alt="ocktiv logo" className="navbar-logo" />
          </a>
          <input
            className="navbar-search"
            type="text"
            placeholder="Search by Courses"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Desktop links: show on desktop only */}
        <ul className="navbar-links desktop-nav">
          <li>
            <a href="#" className="active-link">Courses</a>
          </li>
          <li>
            <a href="https://ocktiv.com/#About" target="_blank" rel="noopener noreferrer">About</a>
          </li>
          <li>
            <a href="https://bucolic-profiterole-262b56.netlify.app/" target="_blank" rel="noopener noreferrer">Services</a>
          </li>
        </ul>
        <div className="navbar-login-wrap desktop-nav">
          <a href="https://ocktivwebsite.vercel.app/" className="navbar-login-btn">Login</a>
        </div>
 
        {/* Hamburger (Apple style): show on mobile only */}
        <div
          className="apple-hamburger"
          onClick={() => setMenuOpen(true)}
          tabIndex={0}
          aria-label="Open navigation"
          onKeyPress={e => { if (e.key === 'Enter') setMenuOpen(true); }}
        >
          <span />
          <span />
          <span />
        </div>
      </nav>
 
      {/* Apple-style overlay mobile nav */}
      {menuOpen && (
        <div className="apple-mobile-menu">
          <button
            className="apple-menu-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >&times;</button>
          <ul>
            <li><a href="#" className="apple-menu-link bold">Courses</a></li>
            <li><a href="https://ocktiv.com/#About" target="_blank" rel="noopener noreferrer" className="apple-menu-link">About</a></li>
            <li><a href="https://bucolic-profiterole-262b56.netlify.app/" target="_blank" rel="noopener noreferrer" className="apple-menu-link">Services</a></li>
            <li><a href="https://ocktivwebsite.vercel.app/" className="apple-menu-link">Login</a></li>
          </ul>
        </div>
      )}
 
      {/* MAIN CONTENT */}
      <div className="allcourses-container">
        <div className="courses-header-row">
          <h2 className="courses-title">
            Ocktiv Courses <span className="courses-count">({courseList.length})</span>
          </h2>
          <div className="courses-actions"></div>
        </div>
        {/* CARDS GRID */}
        <div className="courses-grid">
          {paginatedCourses.length > 0 ? (
            paginatedCourses.map((course, idx) => (
              <div
                className="course-card"
                key={idx}
                onClick={() => navigate('/coursedetails')}
              >
                <img src="/img/ocktivLogo.png" alt="Course" className="card-logo" />
                <div className="card-title">{course.title}</div>
                <div className="card-instructor">By {course.instructor}</div>
                <div className="card-duration">Course Duration: {course.duration}</div>
              </div>
            ))
          ) : (
            <div className="no-results">No courses found.</div>
          )}
        </div>
        {/* PAGINATION: only show if there is more than one page */}
        {totalPages > 1 && (
          <div className="pagination-row">
            <button
              className="pagination-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >{'<'}</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`pagination-btn${page === i + 1 ? " active-page" : ""}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >{'>'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
 
export default AllCourses;