import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPen, FaChevronUp, FaChevronDown } from "react-icons/fa";
import "../style/instructorList.css";

export default function InstructorList({
  selected,
  setSelected,
  instructors,
  search,
  setSearch,
  onDelete // Optional, keep if needed
}) {
  // Responsive: detect mobile and tablet (≤ 1024px)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) setSidebarOpen(true);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleSelect(id) {
    if (setSelected) setSelected(id);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this instructor?")) return;
    if (onDelete) onDelete(id);
  }

  return (
    <div className="instructor-list-panel">
      {/* --- SEARCH BAR MOVED TO TOP --- */}
      <div className="instructor-list-search-row">
        <input
          type="text"
          placeholder="Search by Name, Email, or Course"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="instructor-list-search"
        />
      </div>
      {/* Collapsible title header with arrow */}
      <div
        className={`instructor-list-title${isMobile ? " mobile-centered" : ""}`}
        style={{
          cursor: isMobile ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "center" : "flex-start",
          gap: "8px",
          userSelect: "none"
        }}
        onClick={() => isMobile && setSidebarOpen(v => !v)}
      >
        List of Instructors
        {isMobile && (
          sidebarOpen
            ? <FaChevronUp style={{ marginLeft: 8, fontSize: 18 }} />
            : <FaChevronDown style={{ marginLeft: 8, fontSize: 18 }} />
        )}
      </div>
      {/* Only show scroll list if sidebarOpen */}
      {(!isMobile || sidebarOpen) && (
        <div className="instructor-list-scroll">
          {instructors.map(i => (
            <div
              key={i._id}
              className={`instructor-list-item${selected === i._id ? " active" : ""}`}
              onClick={() => handleSelect(i._id)}
            >
              <div className="instructor-list-info">
                <div className="instructor-list-name">
                  {(i.firstName && i.lastName)
                    ? `${i.firstName} ${i.lastName}`
                    : (i.fullName || i.name || i.email)}
                </div>
                <div className="instructor-list-email">
                  {i.email}
                </div>
              </div>
              <div className="instructor-list-icons">
                <FaPen
                  className="instructor-list-edit"
                  title="Edit"
                  onClick={e => {
                    e.stopPropagation();
                    navigate(`/admin/edit-instructor/${i._id}`);
                  }}
                />
                <FaTrash
                  className="instructor-list-delete"
                  title="Delete"
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(i._id);
                  }}
                />
              </div>
            </div>
          ))}
          {instructors.length === 0 && (
            <div className="instructor-list-empty">
              No instructors found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
