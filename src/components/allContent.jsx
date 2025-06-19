import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CourseNavbar from "./courseNavbar";
import "../style/allContent.css";
import { FaPlusCircle, FaPen, FaTrash } from "react-icons/fa";
import { MdDone } from "react-icons/md";
import YouTube from "react-youtube";

// API endpoints
const MODULE_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/modules"
    : "https://ocktivwebsite-3.onrender.com/api/modules";
const PROGRESS_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/module-progress"
    : "https://ocktivwebsite-3.onrender.com/api/module-progress";

// Utility: get user from localStorage
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

// Extract YouTube video ID from HTML (iframe/link)
function getYoutubeId(html = "") {
  const doc = document.createElement("div");
  doc.innerHTML = html;
  // iframe src
  const iframe = doc.querySelector("iframe");
  if (iframe && iframe.src) {
    const match = iframe.src.match(/embed\/([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
  }
  // direct link
  const a = doc.querySelector("a[href*='youtu']");
  if (a) {
    let url = a.href;
    let id = "";
    if (url.includes("youtu.be/")) {
      id = url.split("youtu.be/")[1].split(/[?&]/)[0];
    } else if (url.includes("v=")) {
      id = url.split("v=")[1].split(/[?&]/)[0];
    }
    if (id.length === 11) return id;
  }
  return null;
}

// Remove all YouTube iframes/links from HTML string
function stripYoutubeEmbeds(html = "") {
  if (!html) return "";
  const doc = document.createElement("div");
  doc.innerHTML = html;
  // Remove YouTube iframes
  doc.querySelectorAll("iframe").forEach(iframe => {
    if (iframe.src && (iframe.src.includes("youtube.com") || iframe.src.includes("youtu.be"))) {
      iframe.remove();
    }
  });
  // Remove direct YouTube links
  doc.querySelectorAll("a[href*='youtu']").forEach(a => a.remove());
  return doc.innerHTML;
}

// Get file icon for attached files (simple svg, fallback by type)
function fileIconSvg(type) {
  const map = {
    pdf: "📄", doc: "📄", docx: "📄", pptx: "📊", xlsx: "📊", image: "🖼️",
    video: "🎬", zip: "🗜️", text: "📄", external: "🔗", default: "📁"
  };
  return map[type] || map.default;
}

export default function AllContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();

  // State
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({}); // moduleId: { completed, lastWatchedTime }
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Refs for YouTube player
  const playerRef = useRef();
  const watchTimer = useRef();

  // Fetch modules
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    axios.get(`${MODULE_API}/course/${courseId}`)
      .then(res => {
        setModules(res.data.modules || []);
        setSelectedIdx(0);
        setLoading(false);
      })
      .catch(() => {
        setModules([]);
        setLoading(false);
      });
  }, [courseId]);

  // Fetch progress
  useEffect(() => {
    if (!user?._id || user.role !== "student" || !modules.length) return;

    // Only fetch once when both are present
    axios.get(`${PROGRESS_API}/user/${user._id}`)
      .then(res => {
        const obj = {};
        (res.data.progress || []).forEach(p => {
          obj[p.moduleId] = p;
        });
        setProgress(obj);
      })
      .catch(() => setProgress({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, modules.length]);

  console.log("Fetching module progress for user:", user?._id);

  // Add new module handler
  function handleAddModule() {
    navigate(`/course/${courseId}/content`);
  }
  // Edit module handler
  function handleEditModule(moduleId) {
    navigate(`/course/${courseId}/content/${moduleId}`);
  }
  // Delete module handler
  async function handleDeleteModule(moduleId) {
    if (!window.confirm("Are you sure you want to delete this module?")) return;
    setDeleting(true);
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(`${MODULE_API}/${moduleId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const idx = modules.findIndex(m => m._id === moduleId);
      let newIdx = Math.max(0, idx - 1);
      const newModules = modules.filter(m => m._id !== moduleId);
      setModules(newModules);
      setSelectedIdx(newIdx);
      setDeleting(false);
    } catch (err) {
      setError("Delete failed. Try again.");
      setDeleting(false);
    }
  }

  // Show empty state if no modules
  if (!loading && modules.length === 0) {
    return (
      <div>
        <CourseNavbar />
        <div className="allcontent-body">
          <div className="allcontent-sidebar">
            <div className="allcontent-sidebar-header">Course Contents</div>
            <div className="allcontent-empty">
              You have not created any modules yet,<br />
              please click the plus button below to add any courses.
            </div>
            {user?.role === "instructor" && (
              <button className="allcontent-add-btn" title="Add Module" onClick={handleAddModule}>
                <FaPlusCircle size={36} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Progress summary
  const totalModules = modules.length;
  const completedModules = modules.filter(
    m => progress[m._id]?.completed
  ).length;
  const percentComplete = totalModules
    ? Math.round((completedModules / totalModules) * 100)
    : 0;

  // Show selected module (default: first)
  const selectedModule = modules[selectedIdx] || modules[0];
  const youtubeId = selectedModule ? getYoutubeId(selectedModule.description) : null;

  // -- YOUTUBE PLAYER LOGIC (no skip ahead) --
  // Save progress
  const saveProgress = (currentTime, ended = false) => {
    if (!selectedModule || !user || user.role !== "student") return;
  
    const token = localStorage.getItem("authToken");
    if (!token) return;
  
    axios.put(`${PROGRESS_API}`, {
      courseId,
      moduleId: selectedModule._id,
      lastWatchedTime: currentTime,
      completed: ended,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(() => { });
  
    // Optimistically update local state
    setProgress(prev => ({
      ...prev,
      [selectedModule._id]: {
        ...(prev[selectedModule._id] || {}),
        lastWatchedTime: currentTime,
        completed: ended || prev[selectedModule._id]?.completed,
      }
    }));
  };
  

  // YouTube player events
  function onPlayerReady(event) {
    if (user?.role !== "student") return;
    playerRef.current = event.target;
    const lastWatched = progress[selectedModule._id]?.lastWatchedTime || 0;
    if (lastWatched > 0) {
      event.target.seekTo(lastWatched, true);
    }
  }

  function onPlayerStateChange(event) {
    // 1 = playing, 2 = paused, 0 = ended
    if (event.data === 1) { // playing
      // Start timer to autosave progress every 5s
      if (watchTimer.current) clearInterval(watchTimer.current);
      watchTimer.current = setInterval(() => {
        if (playerRef.current) {
          const t = playerRef.current.getCurrentTime();
          saveProgress(t, false);
        }
      }, 5000);
    }
    if (event.data === 2) { // paused
      if (watchTimer.current) clearInterval(watchTimer.current);
      if (playerRef.current) {
        const t = playerRef.current.getCurrentTime();
        saveProgress(t, false);
      }
    }
    if (event.data === 0) { // ended
      if (watchTimer.current) clearInterval(watchTimer.current);
      if (playerRef.current) {
        const t = playerRef.current.getCurrentTime();
        saveProgress(t, true);
      }
    }
  }
  function onPlayerPlayback(event) {
    if (user?.role !== "student") return;
    // Prevent skipping ahead
    const allowed = progress[selectedModule._id]?.lastWatchedTime || 0;
    const attempted = playerRef.current.getCurrentTime();
    // Allow going back, but not forward more than a couple seconds
    if (attempted > allowed + 2) {
      playerRef.current.seekTo(allowed, true);
    }
  }

  // Extract attached files
  const attachedFiles = (selectedModule && Array.isArray(selectedModule.files))
    ? selectedModule.files.filter(f => f.type !== "video")
    : [];

  const descriptionWithoutYouTube = selectedModule
    ? stripYoutubeEmbeds(selectedModule.description)
    : "";

  return (
    <div>
      <CourseNavbar />
      <div className="allcontent-body">
        {/* Sidebar */}
        <aside className="allcontent-sidebar">
          <div className="allcontent-sidebar-header">Course Contents</div>
          {user?.role === "student" && (
            <div className="allcontent-progress-bar-container">
              <div className="allcontent-progress-bar">
                <div
                  className="allcontent-progress-bar-fill"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
              <span className="allcontent-progress-bar-label">
                {percentComplete}% Completed
              </span>
            </div>
          )}

          <div className="allcontent-module-list">
            {modules.map((mod, idx) => {
              let duration = "--";
              if (mod.description) {
                const ytId = getYoutubeId(mod.description);
                duration = ytId ? "20m" : "--";
              }
              const prog = progress[mod._id];
              const isComplete = !!prog?.completed;
              return (
                <div
                  className={`allcontent-module-item${selectedIdx === idx ? " selected" : ""}`}
                  key={mod._id}
                  onClick={() => setSelectedIdx(idx)}
                >
                  <span className="allcontent-module-title">{mod.moduleTitle}</span>
                  {user?.role === "student" && (
                    <span className="allcontent-module-meta">
                      {duration}
                      <span className="allcontent-module-status">
                        {isComplete
                          ? (<><MdDone className="status-icon done" /> <span>Completed</span></>)
                          : prog && prog.lastWatchedTime > 0
                            ? (<><span style={{ color: "#3e8ed0" }}>Ongoing</span></>)
                            : (<span style={{ color: "#bbb" }}>Not Started</span>)
                        }
                      </span>
                    </span>
                  )}

                </div>
              );
            })}
            {/* Plus (+) button */}
            {user?.role === "instructor" && (
              <button className="allcontent-add-btn" title="Add Module" onClick={handleAddModule}>
                <FaPlusCircle size={36} />
              </button>
            )}
          </div>
        </aside>
        {/* Main content */}
        <main className="allcontent-main">
          {selectedModule && (
            <>
              {/* YouTube video player */}
              {youtubeId && (
                <div className="allcontent-video-container" style={{ width: "100%", margin: "0 auto 30px auto" }}>
                  <YouTube
                    videoId={youtubeId}
                    className="youtube-responsive-player"
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                        fs: 1,
                        disablekb: 1,
                      },
                    }}
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange}
                    onPlaybackRateChange={onPlayerPlayback}
                  />
                </div>
              )}
              {/* Module title, edit/delete */}
              <div className="allcontent-title-row">
                <span className="allcontent-module-title-main">
                  {selectedModule.moduleTitle}
                </span>
                {user?.role === "instructor" && (
                  <span className="allcontent-module-actions">
                    <FaPen
                      className="allcontent-action-icon"
                      title="Edit Module"
                      onClick={() => handleEditModule(selectedModule._id)}
                    />
                    <FaTrash
                      className="allcontent-action-icon"
                      title="Delete Module"
                      onClick={() => handleDeleteModule(selectedModule._id)}
                    />
                  </span>
                )}
              </div>
              {/* Tabs */}
              <div className="allcontent-tabs-row">
                <span className="allcontent-tab active">Contents</span>
              </div>
              {/* Description (without YouTube embed) */}
              <div className="allcontent-desc-label">Lectures Description</div>
              <div
                className="allcontent-desc-body"
                dangerouslySetInnerHTML={{ __html: descriptionWithoutYouTube }}
              />
              {/* Attachments */}
              {attachedFiles.length > 0 && (
                <div className="allcontent-files-section">
                  <div className="allcontent-files-label">
                    Attached Files ({attachedFiles.length.toString().padStart(2, "0")})
                  </div>
                  <div className="allcontent-files-list">
                    {attachedFiles.map((file, i) => (
                      <div className="allcontent-file-card" key={i}>
                        <span className="allcontent-file-icon">{fileIconSvg(file.type)}</span>
                        <span className="allcontent-file-name">{file.name}</span>
                        {/* <a
                          className="allcontent-file-download-btn"
                          href={file.url}
                          download={file.name} // force download with original filename
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download File
                        </a> */}
                        <a
                          href={
                            file.key
                              ? `${window.location.hostname === "localhost"
                                ? "http://localhost:5050"
                                : "https://ocktivwebsite-3.onrender.com"
                              }/api/download/${file.key}`
                              : file.url // fallback to public/external file URL
                          }
                          className="allcontent-file-download-btn"
                          download={file.key ? file.name : undefined} // only force download for uploaded files
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download File
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
