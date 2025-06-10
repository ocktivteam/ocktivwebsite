import { Link } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../style/coursedetails.css";
 
function CourseDetails() {
  const [menuOpen, setMenuOpen] = useState(false);
 
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);
 
  const navigate = useNavigate();
 
  return (
    <div className="allcourses-bg">
      {/* NAVBAR */}
      <nav className="ocktiv-navbar">
        <div className="navbar-left">
          <a href="https://ocktiv.com/">
            <img src="/img/WhiteLogo.png" alt="ocktiv logo" className="navbar-logo" />
          </a>
          {/* <input
            className="navbar-search"
            type="text"
            placeholder="Search by Courses"
            disabled
            style={{ background: '#e9ecef', cursor: 'not-allowed' }}
          /> */}
        </div>
        {/* Desktop links */}
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
 
        {/* Apple-style hamburger for mobile */}
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
 
      {/* Apple-style mobile menu overlay */}
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
 
      {/* MAIN PAGE CONTENT */}
      <div className="course-details-wrapper">
        {/* Breadcrumbs */}
        <div className="course-breadcrumbs">
  <a href="https://ocktiv.com/" target="_blank" rel="noopener noreferrer">Home</a> &nbsp;/&nbsp;
  <a href="https://ocktivwebsite.vercel.app/courses" target="_blank" rel="noopener noreferrer">Courses</a> &nbsp;/&nbsp;
  <span>Lean Six Sigma Yellow Belt</span>
</div>
 
 
        <div className="course-details-content">
          {/* LEFT COLUMN */}
          <div className="course-details-main">
            <h1 className="course-title">Lean Six Sigma</h1>
            <p className="course-meta">4 Total Hours. 10 Lectures. All levels</p>
 
            <section className="course-section">
              <h3>Course Description</h3>
              <p>
              This Six Sigma Yellow Belt course provides a foundational understanding of the Six Sigma methodology and its role in process improvement. This course introduces participants to key concepts such as DMAIC (Define, Measure, Analyze, Improve, Control), basic data collection and analysis techniques, and the principles of reducing variation and improving quality. Designed for team members and support staff, this course enables participants to contribute effectively to Six Sigma projects and support Green and Black Belt initiatives within their organization.
              </p>
            </section>
 
            <section className="course-section">
              <h3>Certification</h3>
              <p>
              The Six Sigma Yellow Belt certification is awarded to learners upon successful completion of the Yellow Belt training and assessment, Participants are officially certified as Six Sigma Yellow Belt by a Lean Six Sigma Black Belt professional.
              </p>
            </section>
 
            <hr />
 
            <section className="course-section">
              <h3>Syllabus</h3>
              <div className="syllabus-list">
                <div className="syllabus-item">
                  <div className="syllabus-title">Lean Six Sigma Yellow Belt</div>
                  <div className="syllabus-meta">2 Lessons &nbsp;·&nbsp; 1 hour</div>
                </div>
                <div className="syllabus-item">
                  <div className="syllabus-title">Basics of the Topic</div>
                  <div className="syllabus-meta">1 Lessons &nbsp;·&nbsp; 1 hour</div>
                </div>
                <div className="syllabus-item">
                  <div className="syllabus-title">Elements of the Topic</div>
                  <div className="syllabus-meta">1 Lessons &nbsp;·&nbsp; 1 hour</div>
                </div>
                <div className="syllabus-item">
                  <div className="syllabus-title">Sales Topic</div>
                  <div className="syllabus-meta">1 Lessons &nbsp;·&nbsp; 1 hour</div>
                </div>
              </div>
            </section>
          </div>
 
          {/* RIGHT COLUMN */}
          <aside className="course-details-sidecard">
          <img src="/img/ocktivLogo.png" alt="Ocktiv logo" className="sidecard-logo" />
            <div className="sidecard-price">
              <span className="free">FREE</span>
              <span className="old-price">$99.5</span>
            </div>
            <Link
  to="/payment"
  className="sidecard-enroll"
  style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
>
  Enroll Now
</Link>
 
            <div className="sidecard-share">
              {/* <span>Share</span>
              <div className="share-icons">
  <a href="https://www.facebook.com/people/Ocktiv/61572925888950/?mibextid=wwXIfr&rdid=i218km9PjtXvBwP3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AYtFgzuja%2F%3Fmibextid%3DwwXIfr" target="_blank" rel="noopener noreferrer">
    <img src="/img/facebook.png" alt="Facebook" />
  </a>
  <a href="https://www.linkedin.com/company/ocktiv/posts/?feedView=all" target="_blank" rel="noopener noreferrer">
    <img src="/img/linkedin.png" alt="LinkedIn" />
  </a>
  <a href="https://www.instagram.com/accounts/login/?next=%2Focktiv.team%2F&source=omni_redirect" target="_blank" rel="noopener noreferrer">
    <img src="/img/instagram.png" alt="Instagram" />
  </a>
</div> */}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
 
export default CourseDetails;