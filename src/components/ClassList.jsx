import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from 'xlsx';
import "../style/classList.css";
import { useSessionCheck } from "../hooks/useSessionCheck";
import CourseNavbar from "./courseNavbar";
import "../style/classList.css?v=4";

const COURSE_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/courses"
    : "https://ocktivwebsite-3.onrender.com/api/courses";

function formatLastActive(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000; // seconds
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleString();
}

// Simple academic status
function statusFromPct(pct) {
  if (pct <= 0) return { key: "not-started", label: "Not Started" };
  if (pct >= 100) return { key: "completed", label: "Completed" };
  return { key: "started", label: "Started" };
}

export default function ClassList() {
  useSessionCheck();
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;
      const role = user?.role?.toLowerCase();
      const allowed = role === "instructor" || role === "admin";
      if (!allowed) {
        // send them to the student view of the course instead
        navigate(`/course-content/${courseId}`, { replace: true });
      }
    } catch {
      // if parsing fails, just bounce them to login
      navigate("/login", { replace: true });
    }
  }, [courseId, navigate]);
  
  const [rows, setRows] = useState([]);
  const [totalModules, setTotalModules] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | not_started | module_started | quiz_started | certified
  const [sortKey, setSortKey] = useState("name"); // name | progress | last
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const token = localStorage.getItem("authToken");
        const { data } = await axios.get(`${COURSE_API}/${courseId}/classlist`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!isMounted) return;
        setRows(Array.isArray(data?.students) ? data.students : []);
        setTotalModules(Number(data?.meta?.totalModules || 0));
        setQuizCount(Number(data?.meta?.quizCount || 0));
        setLoading(false);
      } catch {
        if (!isMounted) return;
        setErr("Failed to load class list.");
        setRows([]);
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [courseId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows.filter(r => {
      const match = !q ||
        r.fullName.toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q);
      if (!match) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "not_started") {
        const notStarted =
          !r.status?.moduleStarted && !r.status?.quizStarted && !r.status?.certReceived;
        return notStarted;
      }
      if (statusFilter === "module_started") return !!r.status?.moduleStarted && !r.status?.certReceived;
      if (statusFilter === "quiz_started") return !!r.status?.quizStarted && !r.status?.certReceived;
      if (statusFilter === "certified") return !!r.status?.certReceived;
      return true;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.fullName.localeCompare(b.fullName);
      } else if (sortKey === "progress") {
        const ap = (typeof a.courseProgressPct === "number" ? a.courseProgressPct : a.moduleProgressPct || 0);
        const bp = (typeof b.courseProgressPct === "number" ? b.courseProgressPct : b.moduleProgressPct || 0);
        cmp = ap - bp;
      } else if (sortKey === "last") {
        const aa = a.lastActive ? new Date(a.lastActive).getTime() : 0;
        const bb = b.lastActive ? new Date(b.lastActive).getTime() : 0;
        cmp = aa - bb;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [rows, query, statusFilter, sortKey, sortDir]);

  const downloadExcel = () => {
    const data = filtered.map(r => {
      const pct = Math.max(0, Math.min(100,
        typeof r.courseProgressPct === "number" ? r.courseProgressPct : (r.moduleProgressPct || 0)
      ));
      const stat = statusFromPct(pct);
      
      return {
        'Full Name': r.fullName || "Unnamed Student",
        'Email': r.email || "",
        'Country': r.country || "",
        'Progress %': pct,
        'Status': stat.label,
        'Module Started': r.status?.moduleStarted ? "Yes" : "No",
        'Quiz Started': r.status?.quizStarted ? "Yes" : "No",
        'Certificate Received': r.status?.certReceived ? "Yes" : "No",
        'Last Active': formatLastActive(r.lastActive)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Class List");
    
    const today = new Date().toISOString().split('T')[0];
    const filename = `class-list-${courseId}-${today}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="classlist-page">
      <CourseNavbar />

      <div className="classlist-wrap">
        <div className="classlist-topbar">
          <button
            className="cl-btn ghost"
            onClick={() => navigate(`/course/${courseId}`)}
            title="Back to course"
          >
            Back
          </button>

          <div className="classlist-title">
            Class List
            <span className="cl-subtitle">
              {loading ? "Loading…" : `${filtered.length} student${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="cl-actions">
            <input
              className="cl-input"
              value={query}
              placeholder="Search name or email…"
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="cl-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="not_started">Not started</option>
              <option value="module_started">Module started</option>
              <option value="quiz_started">Quiz started</option>
              <option value="certified">Certified</option>
            </select>
            <select className="cl-select" value={sortKey} onChange={e => setSortKey(e.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="progress">Sort: Progress</option>
              <option value="last">Sort: Last active</option>
            </select>
            <button
              className="cl-btn"
              onClick={() => setSortDir(d => (d === "asc" ? "desc" : "asc"))}
              title="Toggle sort direction"
            >
              {sortDir === "asc" ? "↑" : "↓"}
            </button>
            <button
              className="cl-btn download"
              onClick={downloadExcel}
              title="Download Excel"
            >
              Download Data
            </button>
          </div>
        </div>

        {err && <div className="cl-error">{err}</div>}

        {loading ? (
          <div className="cl-skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="cl-skel-card" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="cl-empty">
            {/* <div className="cl-empty-emoji">🧑</div> */}
            <div className="cl-empty-text">No students yet, or no one matches your filters.</div>
          </div>
        ) : (
          <div className="cl-grid">
            {filtered.map((r) => {
              const pct = Math.max(0, Math.min(100,
                typeof r.courseProgressPct === "number" ? r.courseProgressPct : (r.moduleProgressPct || 0)
              ));
              const stat = statusFromPct(pct);
              const last = formatLastActive(r.lastActive);

              return (
                <div className="cl-card" key={r.userId}>
                  <div className="cl-card-top">
                    <div className="cl-avatar">
                      {r.fullName?.[0]?.toUpperCase() || "S"}
                    </div>
                    <div className="cl-id">
                      <div className="cl-name">{r.fullName || "Unnamed Student"}</div>
                      <div className="cl-meta">
                        <span title={r.email}>{r.email}</span>
                      </div>
                    </div>
                    <div className={`cl-status ${stat.key}`}>
                      {stat.label}
                    </div>
                  </div>

                  <div className="cl-progress">
                    {/* <div className="cl-progress-bar">
                      <div className="cl-progress-fill" style={{ width: `${pct}%` }} />
                    </div> */}
                    <div className="cl-progress-text">
                      {pct}% <span className="cl-progress-sub">
                        of {totalModules}{quizCount > 0 ? " + quiz step" : ""}</span>
                    </div>
                  </div>

                  <div className="cl-badges">
                    <span className={`cl-badge ${r.status?.moduleStarted ? "on" : ""}`}>
                      Module Started
                    </span>
                    <span className={`cl-badge ${r.status?.quizStarted ? "on" : ""}`}>
                      Quiz Started
                    </span>
                    <span className={`cl-badge ${r.status?.certReceived ? "on" : ""}`}>
                      Certificate Received
                    </span>
                  </div>

                  <div className="cl-footer">
                    <div className="cl-country">
                      {r.country ? `Country: ${r.country}` : null}
                    </div>
                    <div className="cl-last">Last active: {last}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}