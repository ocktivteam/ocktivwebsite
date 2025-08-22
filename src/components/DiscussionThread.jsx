// src/components/DiscussionThread.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CourseNavbar from "./courseNavbar";
import "../style/discussion.css";
import {
  FiClock,
  FiSend,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiMoreVertical,
  FiMessageSquare,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { FaThumbtack } from "react-icons/fa";

const API_ROOT =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://ocktivwebsite-3.onrender.com";

function useQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
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

// Helper function to get full name from user object
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

// Edit Thread Modal Component
function EditThreadModal({ thread, onClose, onSave }) {
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

// Edit Reply Modal Component
function EditReplyModal({ reply, onClose, onSave }) {
  const [message, setMessage] = useState(reply.message || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setSaving(true);
    try {
      await onSave({ message: message.trim() });
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
          <h3>Edit Reply</h3>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={2000}
                rows={6}
                required
                autoFocus
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
              disabled={saving || !message.trim()}
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

export default function DiscussionThread({ courseId: courseIdProp, threadId: threadIdProp }) {
  const navigate = useNavigate();
  const query = useQuery();

  const courseId =
    courseIdProp || query.get("courseId") || localStorage.getItem("lastCourseId") || "";
  const threadId = threadIdProp || query.get("thread") || "";

  const user = getUser();
  const role = user?.role;
  const userId = user?._id;
  const canModerate = role === "instructor" || role === "admin";

  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  const [showThreadMenu, setShowThreadMenu] = useState(false);
  const [replyMenuFor, setReplyMenuFor] = useState(null);
  const [editingThread, setEditingThread] = useState(null);
  const [editingReply, setEditingReply] = useState(null);

  useEffect(() => {
    if (!courseId || !threadId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: token ? `Bearer ${token}` : "" };

        const res = await axios.get(
          `${API_ROOT}/api/discussions/${courseId}/${threadId}`,
          { headers }
        );

        const t = res.data?.thread || null;
        const r = Array.isArray(res.data?.replies) ? res.data.replies : [];

        if (mounted) {
          setThread(t);
          setReplies(r);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [courseId, threadId]);

  const backToBoard = () => {
    navigate(`/discussion?courseId=${courseId}`);
  };

  const postReply = async (e) => {
    e.preventDefault();
    const body = reply.trim();
    if (!body) return;

    setSending(true);
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      const res = await axios.post(
        `${API_ROOT}/api/discussions/${threadId}/replies`,
        { message: body },
        { headers }
      );
      const created = res.data?.reply;
      if (created) {
        setReplies((prev) => [...prev, created]);
        setReply("");
        inputRef.current?.focus();
      }
    } finally {
      setSending(false);
    }
  };

  // ===== NEW permission helpers (minimal additions) =====
  const userRole = (role || "").toLowerCase();
  const isAdmin = userRole === "admin";
  const isInstructor = userRole === "instructor";
  const authorRoleOfThread = (t) => (t?.author?.role || "").toLowerCase();
  const authorRoleOfReply  = (r) => (r?.author?.role  || "").toLowerCase();

  const canPinThread = (t) => {
    if (!t) return false;
    if (isAdmin) return true;
    if (isInstructor) return authorRoleOfThread(t) !== "admin";
    return false;
  };

  // Check if user can edit/delete a thread
  const canEditDeleteThread = (t) => {
    if (!t) return false;
    if (isAdmin) return true;
    if (isInstructor) {
      if (authorRoleOfThread(t) === "admin") return false;
      return (t.author?._id === userId) || (authorRoleOfThread(t) === "student");
    }
    return t.author?._id === userId;
  };

  // Check if user can edit/delete a reply
  const canEditDeleteReply = (r) => {
    if (!r) return false;
    if (isAdmin) return true;
    if (isInstructor) {
      if (authorRoleOfReply(r) === "admin") return false;
      return (r.author?._id === userId) || (authorRoleOfReply(r) === "student");
    }
    return r.author?._id === userId;
  };
  // ===== end new helpers =====

  const togglePin = async () => {
    if (!canPinThread(thread)) return;
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      const res = await axios.patch(
        `${API_ROOT}/api/discussions/${thread._id}/pin`,
        { pinned: !thread.pinned },
        { headers }
      );
      setThread(res.data?.thread || thread);
      setShowThreadMenu(false);
    } catch {}
  };

  const handleEditThread = async (threadData) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      const res = await axios.patch(
        `${API_ROOT}/api/discussions/${thread._id}`,
        threadData,
        { headers }
      );
      const updated = res.data?.thread;
      if (updated) {
        setThread(updated);
        setEditingThread(null);
        setShowThreadMenu(false);
      }
    } catch (error) {
      console.error("Failed to update thread:", error);
      alert("Failed to update discussion. Please try again.");
    }
  };

  const handleEditReply = async (replyData) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      const res = await axios.patch(
        `${API_ROOT}/api/discussions/${threadId}/replies/${editingReply._id}`,
        replyData,
        { headers }
      );
      const updated = res.data?.reply;
      if (updated) {
        setReplies((prev) =>
          prev.map((r) => (r._id === updated._id ? updated : r))
        );
        setEditingReply(null);
        setReplyMenuFor(null);
      }
    } catch (error) {
      console.error("Failed to update reply:", error);
      alert("Failed to update reply. Please try again.");
    }
  };

  const deleteThread = async () => {
    if (!canEditDeleteThread(thread)) return;
    if (!window.confirm("Delete this discussion?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      await axios.delete(`${API_ROOT}/api/discussions/${thread._id}`, {
        headers,
      });
      backToBoard();
    } catch {}
  };

  const deleteReply = async (replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      await axios.delete(`${API_ROOT}/api/discussions/${threadId}/replies/${replyId}`, {
        headers,
      });
      setReplies((prev) => prev.filter((r) => r._id !== replyId));
      setReplyMenuFor(null);
    } catch {}
  };

  return (
    <div className="discussions-page">
      <CourseNavbar />

      <div className="discussions-wrap">
        <header className="page-hero">
          <h1>Course Discussion</h1>
          <p>Connect with classmates, ask questions, and share knowledge</p>
        </header>

        <div className="thread-head">
          <button className="thread-back" onClick={backToBoard} title="Back">
            <FiChevronLeft size={18} />
            Back to Discussions
          </button>

          {loading && <div className="discussions-loading">Loading…</div>}

          {!loading && thread && (
            <div className="thread-card">
              <div className="thread-card-top">
                <div className="disc-left">
                  {thread.pinned ? (
                    <span className="disc-pin" title="Pinned">
                      <FaThumbtack size={16} />
                    </span>
                  ) : (
                    <span className="disc-avatar">
                      {getInitials(thread.author)}
                    </span>
                  )}
                </div>

                <div className="thread-title-area">
                  <div className="disc-title-row">
                    <div className="disc-title">{thread.subject}</div>
                    {thread.pinned && <span className="disc-badge">Pinned</span>}
                    {thread.updatedAt && new Date(thread.updatedAt) > new Date(thread.createdAt) && (
                      <span className="disc-badge edited">Edited</span>
                    )}
                  </div>
                  <div className="disc-meta">
                    <span className="disc-author">{getFullName(thread.author)}</span>
                    {thread.author?.role && (
                      <span className={`role-badge ${(thread.author.role || "").toLowerCase()}`}>
                        {prettyRole(thread.author.role)}
                      </span>
                    )}
                    <span className="disc-dot">•</span>
                    <span className="disc-when">
                      <FiClock style={{ marginRight: 4 }} />
                      {formatWhen(thread.createdAt)}
                    </span>
                    {thread.updatedAt && new Date(thread.updatedAt) > new Date(thread.createdAt) && (
                      <>
                        <span className="disc-dot">•</span>
                        <span className="disc-edited">
                          Last edited {formatWhen(thread.updatedAt)}
                        </span>
                      </>
                    )}
                    <span className="disc-dot">•</span>
                    <span className="disc-replies">
                      <FiMessageSquare style={{ marginRight: 6 }} />
                      {replies.length}
                    </span>
                  </div>
                </div>

                {canEditDeleteThread(thread) && (
                  <div className="disc-more">
                    <button
                      className="disc-more-btn"
                      onClick={() => setShowThreadMenu((s) => !s)}
                      title="More"
                      type="button"
                    >
                      <FiMoreVertical />
                    </button>
                    {showThreadMenu && (
                      <div className="disc-menu">
                        {canPinThread(thread) && (
                          <button className="disc-menu-item" onClick={togglePin} type="button">
                            <FaThumbtack style={{ marginRight: 8 }} />
                            {thread.pinned ? "Unpin" : "Pin to top"}
                          </button>
                        )}
                        <button
                          className="disc-menu-item"
                          onClick={() => {
                            setEditingThread(thread);
                            setShowThreadMenu(false);
                          }}
                          type="button"
                        >
                          <FiEdit2 style={{ marginRight: 8 }} />
                          Edit
                        </button>
                        <button
                          className="disc-menu-item danger"
                          onClick={deleteThread}
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

              <div className="thread-body">
                <pre className="thread-message">{thread.message}</pre>
              </div>
            </div>
          )}

          {!loading && !thread && (
            <div className="discussions-empty">Thread not found.</div>
          )}
        </div>

        {!loading && thread && (
          <>
            <h3 className="replies-title">Replies</h3>

            <div className="replies-list">
              {replies.length === 0 && (
                <div className="discussions-empty">No replies yet.</div>
              )}
              {replies.map((r) => {
                const isEdited = r.updatedAt && new Date(r.updatedAt) > new Date(r.createdAt);
                return (
                  <div className="reply-card" key={r._id}>
                    <div className="reply-left">
                      <span className="disc-avatar">
                        {getInitials(r.author)}
                      </span>
                    </div>
                    <div className="reply-main">
                      <div className="reply-meta">
                        <span className="disc-author">{getFullName(r.author)}</span>
                        {r.author?.role && (
                          <span className={`role-badge ${(r.author.role || "").toLowerCase()}`}>
                            {prettyRole(r.author.role)}
                          </span>
                        )}
                        <span className="disc-dot">•</span>
                        <span className="disc-when">
                          <FiClock style={{ marginRight: 4 }} />
                          {formatWhen(r.createdAt)}
                        </span>
                        {isEdited && (
                          <>
                            <span className="disc-dot">•</span>
                            <span className="disc-edited">
                              Edited {formatWhen(r.updatedAt)}
                            </span>
                          </>
                        )}
                      </div>
                      <pre className="reply-message">{r.message}</pre>
                      {isEdited && <span className="reply-edited-badge">Edited</span>}
                    </div>

                    {canEditDeleteReply(r) && (
                      <div className="disc-more">
                        <button
                          className="disc-more-btn"
                          onClick={() =>
                            setReplyMenuFor((id) => (id === r._id ? null : r._id))
                          }
                          title="More"
                          type="button"
                        >
                          <FiMoreVertical />
                        </button>
                        {replyMenuFor === r._id && (
                          <div className="disc-menu">
                            <button
                              className="disc-menu-item"
                              onClick={() => {
                                setEditingReply(r);
                                setReplyMenuFor(null);
                              }}
                              type="button"
                            >
                              <FiEdit2 style={{ marginRight: 8 }} />
                              Edit
                            </button>
                            <button
                              className="disc-menu-item danger"
                              onClick={() => deleteReply(r._id)}
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
                );
              })}
            </div>

            <form className="reply-composer" onSubmit={postReply}>
              <div className="composer-row">
                <textarea
                  ref={inputRef}
                  className="composer-textarea"
                  placeholder="Type your reply here..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  required
                />
              </div>
              <div className="composer-actions end">
                <button
                  type="submit"
                  className="composer-submit"
                  disabled={sending || !reply.trim()}
                  title="Post reply"
                >
                  <FiSend size={18} style={{ marginRight: 6 }} />
                  Post Reply
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {editingThread && (
        <EditThreadModal
          thread={editingThread}
          onClose={() => setEditingThread(null)}
          onSave={handleEditThread}
        />
      )}

      {editingReply && (
        <EditReplyModal
          reply={editingReply}
          onClose={() => setEditingReply(null)}
          onSave={handleEditReply}
        />
      )}
    </div>
  );
}
