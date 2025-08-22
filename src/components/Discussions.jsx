// src/components/Discussions.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CourseNavbar from "./courseNavbar";
import DiscussionThread from "./DiscussionThread";
import "../style/discussion.css";
import {
  FiMessageSquare,
  FiClock,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { FaThumbtack } from "react-icons/fa";
import { MdAddComment } from "react-icons/md";

const API_ROOT =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://ocktivwebsite-3.onrender.com";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function useQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

function isNew(createdAt) {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return now - created <= 24 * 60 * 60 * 1000; // 24h
}

function formatWhen(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString();
}

function prettyRole(r) {
  if (!r) return "";
  const s = String(r).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getFullName(author) {
  if (!author) return "User";
  
  // Try different possible field combinations
  if (author.fullName) return author.fullName;
  if (author.name) return author.name;
  if (author.firstName && author.lastName) {
    return `${author.firstName} ${author.lastName}`;
  }
  if (author.firstName) return author.firstName;
  if (author.lastName) return author.lastName;
  
  return "User";
}

// Helper function to get initials from full name
function getInitials(author) {
  const fullName = getFullName(author);
  if (!fullName || fullName === "User") return "U";
  
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Edit Modal Component
function EditModal({ thread, onClose, onSave }) {
  const [subject, setSubject] = useState(thread.subject || "");
  const [message, setMessage] = useState(thread.message || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    
    setSaving(true);
    try {
      await onSave({ subject: subject.trim(), message: message.trim() });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Discussion</h3>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={120}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={2000}
                rows={6}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={saving || !subject.trim() || !message.trim()}
            >
              <FiCheck style={{ marginRight: 6 }} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Discussions() {
  const navigate = useNavigate();
  const query = useQuery();

  const courseId =
    query.get("courseId") || localStorage.getItem("lastCourseId") || "";

  const threadId = query.get("thread");

  const user = getUser();
  const role = user?.role;
  const userId = user?._id;
  const canModerate = role === "instructor" || role === "admin";

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [showMenuFor, setShowMenuFor] = useState(null);
  const [editingThread, setEditingThread] = useState(null);

  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: token ? `Bearer ${token}` : "" };

        const res = await axios.get(`${API_ROOT}/api/discussions/${courseId}`, {
          headers,
        });

        const list = Array.isArray(res.data?.threads) ? res.data.threads : [];

        list.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          const ta = new Date(a.latestReplyAt || a.updatedAt || a.createdAt).getTime();
          const tb = new Date(b.latestReplyAt || b.updatedAt || b.createdAt).getTime();
          return tb - ta;
        });

        if (mounted) setThreads(list);
      } catch {
        if (mounted) setThreads([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  const totalPages = Math.max(1, Math.ceil(threads.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const paged = threads.slice(
    (pageClamped - 1) * PAGE_SIZE,
    pageClamped * PAGE_SIZE
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      setPosting(true);
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      const payload = {
        courseId,
        subject: subject.trim(),
        message: message.trim(),
      };
      const res = await axios.post(`${API_ROOT}/api/discussions`, payload, {
        headers,
      });
      const created = res.data?.thread;
      if (created) {
        setSubject("");
        setMessage("");

        const next = [created, ...threads];
        next.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          const ta = new Date(a.latestReplyAt || a.updatedAt || a.createdAt).getTime();
          const tb = new Date(b.latestReplyAt || b.updatedAt || b.createdAt).getTime();
          return tb - ta;
        });
        setThreads(next);
        setPage(1);
      }
    } finally {
      setPosting(false);
    }
  };

  const gotoThread = (id) => {
    navigate(`/discussion?courseId=${courseId}&thread=${id}`);
  };

  // ===== NEW permission helpers (minimal additions) =====
  const userRole = (role || "").toLowerCase();
  const isAdmin = userRole === "admin";
  const isInstructor = userRole === "instructor";
  const authorRoleOfThread = (t) => (t?.author?.role || "").toLowerCase();

  const canPinThread = (t) => {
    if (!t) return false;
    if (isAdmin) return true;
    if (isInstructor) return authorRoleOfThread(t) !== "admin";
    return false;
  };

  // Check if user can edit/delete a thread
  const canEditDelete = (t) => {
    if (!t) return false;
    if (isAdmin) return true;
    if (isInstructor) {
      if (authorRoleOfThread(t) === "admin") return false;
      return (t.author?._id === userId) || (authorRoleOfThread(t) === "student");
    }
    return t.author?._id === userId;
  };
  // ===== end new helpers =====

  const togglePin = async (thread) => {
    if (!canPinThread(thread)) return;
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      const res = await axios.patch(
        `${API_ROOT}/api/discussions/${thread._id}/pin`,
        { pinned: !thread.pinned },
        { headers }
      );
      const updated = res.data?.thread;
      if (!updated) return;

      const next = threads.map((t) => (t._id === updated._id ? updated : t));
      next.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const ta = new Date(a.latestReplyAt || a.updatedAt || a.createdAt).getTime();
        const tb = new Date(b.latestReplyAt || b.updatedAt || b.createdAt).getTime();
        return tb - ta;
      });
      setThreads(next);
      setShowMenuFor(null);
    } catch {}
  };

  const handleEdit = async (threadData) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      const res = await axios.patch(
        `${API_ROOT}/api/discussions/${editingThread._id}`,
        threadData,
        { headers }
      );
      const updated = res.data?.thread;
      if (updated) {
        const next = threads.map((t) => (t._id === updated._id ? updated : t));
        setThreads(next);
        setEditingThread(null);
        setShowMenuFor(null);
      }
    } catch (error) {
      console.error("Failed to update thread:", error);
      alert("Failed to update discussion. Please try again.");
    }
  };

  const doDelete = async (thread) => {
    if (!window.confirm("Delete this discussion?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      await axios.delete(`${API_ROOT}/api/discussions/${thread._id}`, {
        headers,
      });
      setThreads((prev) => prev.filter((t) => t._id !== thread._id));
      setShowMenuFor(null);
    } catch {}
  };

  if (threadId) {
    return <DiscussionThread courseId={courseId} threadId={threadId} />;
  }

  return (
    <div className="discussions-page">
      <CourseNavbar />

      <div className="discussions-wrap">
        <header className="page-hero">
          <h1>Course Discussion</h1>
          <p>Connect with classmates, ask questions, and share knowledge</p>
        </header>

        <form className="discussions-composer" onSubmit={handleCreate}>
          <div className="composer-title">
            <span className="composer-dot" />
            <span className="composer-title-text">Start a Discussion</span>
          </div>
          <div className="composer-row">
            <input
              type="text"
              className="composer-input"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              required
            />
          </div>
          <div className="composer-row">
            <textarea
              className="composer-textarea"
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={2000}
              required
            />
          </div>
          <div className="composer-actions">
            <button
              type="submit"
              className="composer-submit"
              disabled={posting || !subject.trim() || !message.trim()}
              title="Post discussion"
            >
              <MdAddComment size={18} style={{ marginRight: 6 }} />
              Post Discussion
            </button>
          </div>
        </form>

        <div className="list-head-row">
          <h2>Discussion Threads</h2>
          <div className="list-count">
            {threads.length} {threads.length === 1 ? "discussion" : "discussions"}
          </div>
        </div>

        <div className="discussions-list">
          {loading && <div className="discussions-loading">Loading…</div>}
          {!loading && threads.length === 0 && (
            <div className="discussions-empty">No discussions yet.</div>
          )}

          {!loading &&
            paged.map((t) => {
              const latest = t.latestReplyAt || t.updatedAt || t.createdAt;
              const roleClass = (t.author?.role || "").toLowerCase();
              const isEdited = t.updatedAt && new Date(t.updatedAt) > new Date(t.createdAt);
              
              return (
                <div
                  key={t._id}
                  className={`disc-card ${t.pinned ? "pinned" : ""}`}
                  role="button"
                  onClick={() => gotoThread(t._id)}
                  onKeyDown={(e) => e.key === "Enter" && gotoThread(t._id)}
                  tabIndex={0}
                >
                  <div className="disc-left">
                    {t.pinned ? (
                      <span className="disc-pin" title="Pinned">
                        <FaThumbtack size={16} />
                      </span>
                    ) : (
                      <span className="disc-avatar">
                        {getInitials(t.author)}
                      </span>
                    )}
                  </div>

                  <div className="disc-main">
                    <div className="disc-title-row">
                      <div className="disc-title">{t.subject}</div>
                      {isNew(t.createdAt) && <span className="disc-badge">New</span>}
                      {isEdited && <span className="disc-badge edited">Edited</span>}
                    </div>

                    <div className="disc-card-body">{t.message}</div>

                    <div className="disc-meta">
                      <span className="disc-author">{getFullName(t.author)}</span>
                      {t.author?.role && (
                        <span className={`role-badge ${roleClass}`}>
                          {prettyRole(t.author.role)}
                        </span>
                      )}
                      <span className="disc-dot">•</span>
                      <span className="disc-when">
                        <FiClock style={{ marginRight: 4 }} />
                        {formatWhen(latest)}
                      </span>
                      {isEdited && (
                        <>
                          <span className="disc-dot">•</span>
                          <span className="disc-edited">
                            Last edited {formatWhen(t.updatedAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    className="disc-right"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <span className="disc-replies" title="Replies">
                      <FiMessageSquare style={{ marginRight: 6 }} />
                      {t.replyCount || 0}
                    </span>

                    {canEditDelete(t) && (
                      <div className="disc-more">
                        <button
                          className="disc-more-btn"
                          onClick={() =>
                            setShowMenuFor((id) => (id === t._id ? null : t._id))
                          }
                          title="More"
                          type="button"
                        >
                          <FiMoreVertical />
                        </button>

                        {showMenuFor === t._id && (
                          <div className="disc-menu">
                            {canPinThread(t) && (
                              <button
                                className="disc-menu-item"
                                onClick={() => togglePin(t)}
                                type="button"
                              >
                                <FaThumbtack style={{ marginRight: 8 }} />
                                {t.pinned ? "Unpin" : "Pin to top"}
                              </button>
                            )}
                            <button
                              className="disc-menu-item"
                              onClick={() => {
                                setEditingThread(t);
                                setShowMenuFor(null);
                              }}
                              type="button"
                            >
                              <FiEdit2 style={{ marginRight: 8 }} />
                              Edit
                            </button>
                            <button
                              className="disc-menu-item danger"
                              onClick={() => doDelete(t)}
                              type="button"
                            >
                              <FiTrash2 style={{ marginRight: 8 }} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {!loading && threads.length > PAGE_SIZE && (
            <div className="disc-pager">
              <button
                className={`pager-btn ${pageClamped <= 1 ? "" : "hoverable"}`}
                disabled={pageClamped <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`pager-btn ${n === pageClamped ? "active" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className={`pager-btn ${pageClamped >= totalPages ? "" : "hoverable"}`}
                disabled={pageClamped >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {editingThread && (
        <EditModal
          thread={editingThread}
          onClose={() => setEditingThread(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}
