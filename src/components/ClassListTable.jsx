import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from 'xlsx';
import "../style/classListTable.css";
import { useSessionCheck } from "../hooks/useSessionCheck";

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

export default function ClassListTable() {
  useSessionCheck();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [, setTotalModules] = useState(0);
  const [, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

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

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

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
    <div className="classlist-table-page">
      <div className="classlist-table-wrap">
        <div className="classlist-table-topbar">
          <button
            className="clt-btn ghost"
            onClick={() => navigate(`/course/${courseId}`)}
            title="Back to course"
          >
            Back
          </button>

          <div className="classlist-table-title">
            Class List
            <span className="clt-subtitle">
              {loading ? "Loading…" : `${filtered.length} student${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="clt-actions">
            <input
              className="clt-input"
              value={query}
              placeholder="Search name or email…"
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="clt-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="not_started">Not started</option>
              <option value="module_started">Module started</option>
              <option value="quiz_started">Quiz started</option>
              <option value="certified">Certified</option>
            </select>
            <select className="clt-select" value={sortKey} onChange={e => setSortKey(e.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="progress">Sort: Progress</option>
              <option value="last">Sort: Last active</option>
            </select>
            <button
              className="clt-btn"
              onClick={() => setSortDir(d => (d === "asc" ? "desc" : "asc"))}
              title="Toggle sort direction"
            >
              {sortDir === "asc" ? "↑" : "↓"}
            </button>
            <button
              className="clt-btn download"
              onClick={downloadExcel}
              title="Download Excel"
            >
              Download Data
            </button>
          </div>
        </div>

        {err && <div className="clt-error">{err}</div>}

        {loading ? (
          <div className="clt-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="clt-skeleton-row" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="clt-empty">
            <div className="clt-empty-text">No students yet, or no one matches your filters.</div>
          </div>
        ) : (
          <div className="clt-table-container">
            <table className="clt-table">
              <thead>
                <tr>
                  <th 
                    className={`sortable ${sortKey === 'name' ? `sorted-${sortDir}` : ''}`}
                    onClick={() => handleSort('name')}
                  >
                    Student
                  </th>
                  <th>Country</th>
                  <th 
                    className={`sortable ${sortKey === 'progress' ? `sorted-${sortDir}` : ''}`}
                    onClick={() => handleSort('progress')}
                  >
                    Progress
                  </th>
                  <th>Status Badges</th>
                  <th 
                    className={`sortable ${sortKey === 'last' ? `sorted-${sortDir}` : ''}`}
                    onClick={() => handleSort('last')}
                  >
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const pct = Math.max(0, Math.min(100,
                    typeof r.courseProgressPct === "number" ? r.courseProgressPct : (r.moduleProgressPct || 0)
                  ));
                  const stat = statusFromPct(pct);
                  const last = formatLastActive(r.lastActive);

                  return (
                    <tr key={r.userId} className="clt-row">
                      <td className="student-info">
                        <div className="student-avatar">
                          {r.fullName?.[0]?.toUpperCase() || "S"}
                        </div>
                        <div className="student-details">
                          <div className="student-name">{r.fullName || "Unnamed Student"}</div>
                          <div className="student-email">{r.email}</div>
                        </div>
                      </td>
                      <td className="country-cell">
                        {r.country || "—"}
                      </td>
                      <td className="progress-cell">
                        <div className="progress-info">
                          <span className="progress-pct">{pct}%</span>
                          <div className={`progress-status ${stat.key}`}>
                            {stat.label}
                          </div>
                        </div>
                      </td>
                      <td className="badges-cell">
                        <div className="status-badges">
                          <span className={`status-badge ${r.status?.moduleStarted ? "active" : ""}`}>
                            Module Started
                          </span>
                          <span className={`status-badge ${r.status?.quizStarted ? "active" : ""}`}>
                            Quiz Started
                          </span>
                          <span className={`status-badge ${r.status?.certReceived ? "active" : ""}`}>
                            Certificate Received
                          </span>
                        </div>
                      </td>
                      <td className="last-active-cell">
                        {last}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}