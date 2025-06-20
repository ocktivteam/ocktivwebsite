import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import CourseNavbar from "./courseNavbar";
import "../style/allContent.css";
import {
  FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileExcel, FaFileImage, FaFileVideo,
  FaFileArchive, FaFileAlt, FaLink, FaFile, FaPlusCircle, FaPen, FaTrash, FaChevronDown, FaChevronUp
} from "react-icons/fa";
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

// FILE ICON / IMAGE THUMBNAIL
function fileIconComponent(file) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const url = file.url || "";
  const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const ext = name.split('.').pop();

  // Show thumbnail for images with a valid url
  if (imageExts.includes(ext) && url) {
    return (
      <img
        src={url}
        alt={file.name}
        style={{
          width: 40, height: 40, borderRadius: 7,
          objectFit: "cover", background: "#eee", border: "1px solid #ddd"
        }}
      />
    );
  }

  // Otherwise, use real file icons
  switch (type) {
    case "pdf":
      return <FaFilePdf color="#e53935" size={38} />;
    case "doc":
    case "docx":
      return <FaFileWord color="#1e88e5" size={38} />;
    case "ppt":
    case "pptx":
      return <FaFilePowerpoint color="#fbc02d" size={38} />;
    case "xls":
    case "xlsx":
      return <FaFileExcel color="#388e3c" size={38} />;
    case "image":
      return <FaFileImage color="#26c6da" size={38} />;
    case "video":
      return <FaFileVideo color="#8e24aa" size={38} />;
    case "zip":
    case "rar":
      return <FaFileArchive color="#ff7043" size={38} />;
    case "text":
    case "txt":
      return <FaFileAlt color="#616161" size={38} />;
    case "external":
      return <FaLink color="#6d4c41" size={38} />;
    default:
      // fallback by extension if possible
      if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
        return <FaFileImage color="#26c6da" size={38} />;
      }
      if (["pdf"].includes(ext)) return <FaFilePdf color="#e53935" size={38} />;
      if (["doc", "docx"].includes(ext)) return <FaFileWord color="#1e88e5" size={38} />;
      if (["ppt", "pptx"].includes(ext)) return <FaFilePowerpoint color="#fbc02d" size={38} />;
      if (["xls", "xlsx"].includes(ext)) return <FaFileExcel color="#388e3c" size={38} />;
      if (["zip", "rar"].includes(ext)) return <FaFileArchive color="#ff7043" size={38} />;
      if (["txt"].includes(ext)) return <FaFileAlt color="#616161" size={38} />;
      return <FaFile color="#888" size={38} />;
  }
}

export default function AllContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const location = useLocation();

  // State
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [playerReady, setPlayerReady] = useState(false);

  // For collapsible sidebar on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Refs for YouTube player
  const playerRef = useRef();
  const watchTimer = useRef();
  const seekingRef = useRef(false);

  // Helper: check if we're in mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setSidebarOpen(true);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch modules
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    axios.get(`${MODULE_API}/course/${courseId}`)
      .then(res => {
        const loadedModules = res.data.modules || [];
        setModules(loadedModules);

        const selectedId = location.state?.selectedModuleId;
        const indexToSelect = selectedId
          ? loadedModules.findIndex(m => m._id === selectedId)
          : 0;
        setSelectedIdx(indexToSelect >= 0 ? indexToSelect : 0);
        setLoading(false);
      })
      .catch(() => {
        setModules([]);
        setLoading(false);
      });
  }, [courseId]);

  // Clear state after redirect
  useEffect(() => {
    if (location.state?.selectedModuleId) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Progress fetching
  useEffect(() => {
    if (!user?._id || user.role !== "student" || !modules.length) return;
    axios.get(`${PROGRESS_API}/user/${user._id}`)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : res.data.progress || [];
        const obj = {};
        arr.forEach(p => {
          obj[String(p.moduleId)] = p;
        });
        setProgress(obj);
      })
      .catch(() => setProgress({}));
  }, [user?._id, modules.length]);

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

  // Save progress, but never revert to incomplete once completed
  const saveProgress = (currentTime, ended = false) => {
    if (!selectedModule || !user || user.role !== "student") return;

    const previous = progress[selectedModule._id] || {};
    const alreadyCompleted = previous.completed === true;
    const willComplete = ended || alreadyCompleted;
    const token = localStorage.getItem("authToken");
    if (!token) return;

    axios.put(`${PROGRESS_API}`, {
      courseId,
      moduleId: selectedModule._id,
      lastWatchedTime: currentTime,
      completed: willComplete,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(() => { });

    setProgress(prev => ({
      ...prev,
      [selectedModule._id]: {
        ...previous,
        lastWatchedTime: currentTime,
        completed: willComplete,
      }
    }));
  };

  // YOUTUBE PLAYER LOGIC (seekTo on ready)
  function onPlayerReady(event) {
    if (user?.role !== "student") return;
    playerRef.current = event.target;
    setPlayerReady(true);

    const selectedModule = modules[selectedIdx] || modules[0];
    const prog = progress[selectedModule?._id];

    // Prevent double-seeking
    if (seekingRef.current) return;
    seekingRef.current = true;

    if (prog) {
      // Completed: seek to end
      if (prog.completed && playerRef.current.getDuration) {
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          playerRef.current.seekTo(duration - 0.2, true);
        }
      }
      // Ongoing: seek to last watched time
      else if (typeof prog.lastWatchedTime === "number" && prog.lastWatchedTime > 0) {
        playerRef.current.seekTo(prog.lastWatchedTime, true);
      }
    }
    setTimeout(() => seekingRef.current = false, 1500);
  }

  function onPlayerStateChange(event) {
    // 1 = playing, 2 = paused, 0 = ended
    if (event.data === 1) { // playing
      if (watchTimer.current) clearInterval(watchTimer.current);
      watchTimer.current = setInterval(() => {
        if (playerRef.current) {
          const t = playerRef.current.getCurrentTime();
          if (t && t.then) {
            t.then(time => saveProgress(time, false));
          } else {
            saveProgress(t, false);
          }
        }
      }, 5000);
    }
    if (event.data === 2) { // paused
      if (watchTimer.current) clearInterval(watchTimer.current);
      if (playerRef.current) {
        const t = playerRef.current.getCurrentTime();
        if (t && t.then) {
          t.then(time => saveProgress(t, false));
        } else {
          saveProgress(t, false);
        }
      }
    }
    if (event.data === 0) { // ended
      if (watchTimer.current) clearInterval(watchTimer.current);
      if (playerRef.current) {
        const t = playerRef.current.getCurrentTime();
        if (t && t.then) {
          t.then(time => saveProgress(time, true));
        } else {
          saveProgress(t, true);
        }
      }
    }
  }
  function onPlayerPlayback(event) {
    if (user?.role !== "student") return;
    const allowed = progress[selectedModule._id]?.lastWatchedTime || 0;
    const attempted = playerRef.current.getCurrentTime();
    if (attempted && attempted.then) {
      attempted.then(current => {
        if (current > allowed + 2) {
          playerRef.current.seekTo(allowed, true);
        }
      });
    } else {
      if (attempted > allowed + 2) {
        playerRef.current.seekTo(allowed, true);
      }
    }
  }

  // Extract attached files
  const attachedFiles = (selectedModule && Array.isArray(selectedModule.files))
    ? selectedModule.files.filter(f => f.type !== "video")
    : [];

  const descriptionWithoutYouTube = selectedModule
    ? stripYoutubeEmbeds(selectedModule.description)
    : "";

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
              <div className="allcontent-add-btn-wrapper">
                <button className="allcontent-add-btn" title="Add Module" onClick={handleAddModule}>
                  <FaPlusCircle size={36} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CourseNavbar />
      <div className="allcontent-body">
        {/* Sidebar */}
        <aside className="allcontent-sidebar">
          {/* Collapsible header on mobile */}
          <div
            className={`allcontent-sidebar-header${isMobile ? " centered" : ""}`}
            onClick={() => isMobile && setSidebarOpen((v) => !v)}
            style={{
              cursor: isMobile ? "pointer" : "default",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isMobile ? "center" : "flex-start",
              gap: "8px",
              userSelect: "none"
            }}
          >
            Course Contents
            {isMobile && (
              sidebarOpen
                ? <FaChevronUp style={{ marginLeft: 8, fontSize: 16 }} />
                : <FaChevronDown style={{ marginLeft: 8, fontSize: 16 }} />
            )}
          </div>

          {/* Collapse modules/cards on mobile */}
          {(!isMobile || sidebarOpen) && (
            <div className="allcontent-module-list">
              {modules.map((mod, idx) => {
                let duration = "--";
                if (mod.description) {
                  const ytId = getYoutubeId(mod.description);
                  duration = ytId ? "20m" : "--";
                }
                const prog = progress[String(mod._id)];
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
              {/* Center the add button */}
              {user?.role === "instructor" && (
                <div className="allcontent-add-btn-wrapper">
                  <button className="allcontent-add-btn" title="Add Module" onClick={handleAddModule}>
                    <FaPlusCircle size={36} />
                  </button>
                </div>
              )}
            </div>
          )}
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
                <div className="allcontent-title-column">
                  <span className="allcontent-module-title-main">
                    {selectedModule.moduleTitle}
                  </span>
                  {user?.role === "instructor" && (
                    <div className="allcontent-module-actions">
                      <FaPen
                        className="allcontent-edit-icon"
                        title="Edit Module"
                        onClick={() => handleEditModule(selectedModule._id)}
                      />
                      <FaTrash
                        className="allcontent-delete-icon"
                        title="Delete Module"
                        onClick={() => handleDeleteModule(selectedModule._id)}
                      />
                    </div>
                  )}
                </div>
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
                        <span className="allcontent-file-icon">{fileIconComponent(file)}</span>
                        <span className="allcontent-file-name">{file.name}</span>
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
                          download={file.key ? file.name : undefined}
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
