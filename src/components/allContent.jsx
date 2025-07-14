
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import CourseNavbar from "./courseNavbar";
import "../style/allContent.css";
import {
  FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileExcel, FaFileImage, FaFileVideo,
  FaFileArchive, FaFileAlt, FaLink, FaFile, FaPlusCircle, FaPen, FaTrash, FaChevronDown, FaChevronUp, FaLock
} from "react-icons/fa";
import { MdDone } from "react-icons/md";
import YouTube from "react-youtube";
import QuizList from "./quizList";
import CertificateTab from "./CertificateTab";


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

function getYoutubeId(html = "") {
  const doc = document.createElement("div");
  doc.innerHTML = html;
  const iframe = doc.querySelector("iframe");
  if (iframe && iframe.src) {
    const match = iframe.src.match(/embed\/([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
  }
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
function hasYoutubeVideo(module) {
  return !!getYoutubeId(module?.description || "");
}
function stripYoutubeEmbeds(html = "") {
  if (!html) return "";
  const doc = document.createElement("div");
  doc.innerHTML = html;
  doc.querySelectorAll("iframe").forEach(iframe => {
    if (iframe.src && (iframe.src.includes("youtube.com") || iframe.src.includes("youtu.be"))) {
      iframe.remove();
    }
  });
  doc.querySelectorAll("a[href*='youtu']").forEach(a => a.remove());
  return doc.innerHTML;
}
function fileIconComponent(file) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const url = file.url || "";
  const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const ext = name.split('.').pop();

  if (imageExts.includes(ext) && url) {
    return (
      <img
        src={url}
        alt={file.name}
        style={{
          width: 28, height: 28, borderRadius: 6,
          objectFit: "cover", background: "#eee", border: "1px solid #ddd"
        }}
      />
    );
  }

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
async function forceImageDownload(url, filename) {
  try {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch");
    const blob = await response.blob();
    const objUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = objUrl;
    a.download = filename || "image";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objUrl);
    }, 100);
  } catch {
    alert("Image download failed. Try right-clicking and choosing 'Save As' instead.");
  }
}

export default function AllContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const location = useLocation();

  // [QUIZ-LOGIC-FIX] State logic for module idx & sidebar
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Sidebar fix: load last selected tab from localStorage (default "module")
  const [selectedSidebar, setSelectedSidebar] = useState(() => {
    if (!user) return "module";
    return localStorage.getItem(`lastSelectedSidebar_${user._id}_${courseId}`) || "module";
  });

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [quizList, setQuizList] = useState([]);
  const [studentQuizData, setStudentQuizData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastIdx, setToastIdx] = useState(null);
  const playerRef = useRef();
  const watchTimer = useRef();
  const seekingRef = useRef(false);
  const [readyToSeek, setReadyToSeek] = useState(false);
  const hasSeekedRef = useRef(false);
  const autoAdvanceRef = useRef(false);
  const manualClickRef = useRef(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Save sidebar selection on change
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`lastSelectedSidebar_${user._id}_${courseId}`, selectedSidebar);
  }, [selectedSidebar, user, courseId]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setSidebarOpen(true);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleAddModule() {
    navigate(`/course/${courseId}/content`);
  }
  function handleEditModule(moduleId) {
    navigate(`/course/${courseId}/content/${moduleId}`);
  }
  async function handleDeleteModule(moduleId) {
    if (!window.confirm("Are you sure you want to delete this module?")) return;
    setDeleting(true);
    setError("");
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

  // [QUIZ-LOGIC] Only set selectedIdx if on "module" tab
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    axios.get(`${MODULE_API}/course/${courseId}`)
      .then(res => {
        const loadedModules = res.data.modules || [];
        setModules(loadedModules);
        if (selectedSidebar === "module") {
          const lastModuleId = user?._id
            ? localStorage.getItem(`lastSelectedModule_${user._id}_${courseId}`)
            : null;
          let indexToSelect = 0;
          if (lastModuleId) {
            const idx = loadedModules.findIndex(m => m._id === lastModuleId);
            if (idx !== -1) indexToSelect = idx;
          } else if (location.state?.selectedModuleId) {
            const idx = loadedModules.findIndex(m => m._id === location.state.selectedModuleId);
            if (idx !== -1) indexToSelect = idx;
          }
          setSelectedIdx(indexToSelect);
        }
        setLoading(false);
      })
      .catch(() => {
        setModules([]);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [courseId, user?._id, selectedSidebar]);

  useEffect(() => {
    if (!courseId) return;
    axios.get(
      window.location.hostname === "localhost"
        ? `http://localhost:5050/api/quiz/course/${courseId}`
        : `https://ocktivwebsite-3.onrender.com/api/quiz/course/${courseId}`
    ).then(res => setQuizList(res.data || []));
  }, [courseId]);

  useEffect(() => {
    if (!user || user.role !== "student" || !quizList.length) return;
    
      // Prevent refetching if already fetched
  const alreadyFetchedAll = quizList.every(q => studentQuizData[q._id]);
  if (alreadyFetchedAll) return;


    const fetchAll = async () => {
      let result = {};
      await Promise.all(
        quizList.map(async quiz => {
          try {
            const { data } = await axios.get(
              window.location.hostname === "localhost"
                ? `http://localhost:5050/api/quiz/${quiz._id}`
                : `https://ocktivwebsite-3.onrender.com/api/quiz/${quiz._id}`
            );
            let attempts = (data && data.studentAttempts
              ? data.studentAttempts
              : quiz.studentAttempts || []
            ).filter(attempt => (attempt.studentId === user._id || (attempt.studentId && attempt.studentId._id === user._id)));
            result[quiz._id] = attempts;
          } catch {
            result[quiz._id] = [];
          }
        })
      );
      setStudentQuizData(result);
    };
    fetchAll();
  }, [user, quizList]);
  function isQuizPassed(quiz, attempts) {
    if (!attempts || attempts.length === 0) return false;
    const latest = attempts[attempts.length - 1];
    const total = quiz.questions?.length || 0;
    const passingRate = typeof quiz.passingRate === 'number' ? quiz.passingRate : 0.5;
    const passingScore = Math.ceil(total * passingRate);
    const score = latest?.score || 0;
    return score >= passingScore;
  }

  useEffect(() => {
    if (location.state?.selectedModuleId) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
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

  // PATCH: steps (modules + 1 for Quiz IF there are any quizzes)
  const quizStepExists = quizList.length > 0;
  const allQuizzesPassed = quizStepExists && quizList.every(
    quiz => isQuizPassed(quiz, studentQuizData[quiz._id])
  );
  const totalModules = modules.length;
  const completedModules = modules.filter(
    m => progress[m._id]?.completed
  ).length;
  const totalSteps = totalModules + (quizStepExists ? 1 : 0);
  const completedSteps =
    completedModules + (quizStepExists && allQuizzesPassed ? 1 : 0);
  const percentComplete =
    totalSteps === 0
      ? 0
      : Math.round((completedSteps / totalSteps) * 100);

  function isModuleLocked(idx) {
    if (user?.role !== "student") return false;
    if (idx === 0) return false;
    const prevModule = modules[idx - 1];
    return !progress[prevModule?._id]?.completed;
  }
  const selectedModule = modules[selectedIdx] || modules[0];
  const youtubeId = selectedModule ? getYoutubeId(selectedModule.description) : null;
  function handleManualCompleteAndNext() {
    if (!selectedModule || user?.role !== "student") return;
    saveProgress(0, true);
    if (selectedIdx < modules.length - 1) {
      setTimeout(() => {
        setSelectedIdx(selectedIdx + 1);
        if (user?._id) {
          localStorage.setItem(`lastSelectedModule_${user._id}_${courseId}`, modules[selectedIdx + 1]._id);
        }
      }, 400);
    }
  }
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

  useEffect(() => {
    if (
      readyToSeek &&
      playerRef.current &&
      selectedModule
    ) { }
  }, [readyToSeek, selectedModule, progress]);

  function onPlayerReady(event) {
    try {
      if (user?.role !== "student") return;
      playerRef.current = event.target;
    } catch (err) {
      console.error("onPlayerReady error:", err);
    }
  }
  function onPlayerStateChange(event) {
    const player = playerRef.current;
    const isStudent = user?.role === "student";
    if (event.data === 1 && isStudent && !hasSeekedRef.current) {
      const prog = progress[selectedModule._id] || {};
      let seekTime = 0;
      if (autoAdvanceRef.current || (!manualClickRef.current && !hasSeekedRef.current)) {
        if (prog.completed) {
          seekTime = autoAdvanceRef.current
            ? Math.max(player.getDuration() - 0.2, 0)
            : 0;
        } else {
          seekTime = prog.lastWatchedTime || 0;
        }
      } else if (!prog.completed) {
        seekTime = prog.lastWatchedTime || 0;
      }
      player.seekTo(seekTime, true);
      hasSeekedRef.current = true;
    }
    if (event.data === 1 && isStudent) {
      if (watchTimer.current) clearInterval(watchTimer.current);
      watchTimer.current = setInterval(() => {
        const t = player.getCurrentTime();
        if (t && t.then) {
          t.then(time => saveProgress(time, false));
        } else {
          saveProgress(t, false);
        }
      }, 5000);
    }
    if (event.data === 2 && isStudent) {
      if (watchTimer.current) clearInterval(watchTimer.current);
      const t = player.getCurrentTime();
      if (t && t.then) {
        t.then(time => saveProgress(time, false));
      } else {
        saveProgress(t, false);
      }
    }
    if (event.data === 0 && isStudent) {
      if (watchTimer.current) clearInterval(watchTimer.current);
      const t = player.getCurrentTime();
      if (t && t.then) {
        t.then(time => saveProgress(time, true));
      } else {
        saveProgress(t, true);
      }
      if (selectedIdx < modules.length - 1) {
        setTimeout(() => {
          autoAdvanceRef.current = true;
          setSelectedIdx(idx => idx + 1);
          hasSeekedRef.current = false;
        }, 700);
      }
    }
  }
  useEffect(() => {
    hasSeekedRef.current = false;
    autoAdvanceRef.current = false;
    manualClickRef.current = false;
  }, [selectedModule]);
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
  const attachedFiles = (selectedModule && Array.isArray(selectedModule.files))
    ? selectedModule.files.filter(f => f.type !== "video")
    : [];
  const descriptionWithoutYouTube = selectedModule
    ? stripYoutubeEmbeds(selectedModule.description)
    : "";

  if (!loading && modules.length === 0) {
    return (
      <div>
        <CourseNavbar />
        <div className="allcontent-body">
          <div className="allcontent-sidebar">
            <div className="allcontent-sidebar-header">Course Contents</div>
            <div className="allcontent-empty">
              {user?.role === "instructor" || user?.role === "professor" ? (
                <>You have not created any modules yet.</>
              ) : (
                <>
                  No modules yet.<br />
                  (Ask your instructor to add content.)
                </>
              )}
            </div>
            {user?.role === "instructor" || user?.role === "professor" ? (
              <div className="allcontent-add-btn-wrapper">
                <button className="allcontent-add-btn" title="Add Module" onClick={handleAddModule}>
                  <FaPlusCircle size={36} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
  function handleModuleSelect(idx) {
    setSelectedIdx(idx);
    setSelectedSidebar("module");
    if (modules[idx]?._id && courseId && user?._id) {
      localStorage.setItem(`lastSelectedModule_${user._id}_${courseId}`, modules[idx]._id);
      localStorage.setItem(`lastSelectedSidebar_${user._id}_${courseId}`, "module");
    }
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

          {/*Progress Bar - only for students */}
          {user?.role === "student" && (
            <div className="allcontent-progress-row">
              <div className="allcontent-progress-label">
                Progress: <span>{percentComplete}% ({completedSteps}/{totalSteps})</span>
              </div>
              <div className="allcontent-progress-bar-modern">
                <div
                  className="allcontent-progress-bar-gradient"
                  style={{
                    width: `${percentComplete}%`
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Module List */}
          {(!isMobile || sidebarOpen) && (
            <div className="allcontent-module-list">
              {modules.map((mod, idx) => {
                const prog = progress[String(mod._id)];
                const isComplete = !!prog?.completed;
                const isOngoing = !isComplete && prog && prog.lastWatchedTime > 0;
                const isLocked = isModuleLocked(idx);

                return (
                  <div
                    className={
                      "allcontent-module-item" +
                      (selectedIdx === idx && selectedSidebar === "module" && (!isLocked || user?.role !== "student") ? " selected" : "") +
                      (isLocked && user?.role === "student" ? " locked" : "")
                    }
                    key={mod._id}
                    tabIndex={isLocked && user?.role === "student" ? -1 : 0}
                    onClick={() => {
                      if (!isLocked || user?.role !== "student") {
                        manualClickRef.current = true;
                        handleModuleSelect(idx);
                      }
                    }}
                    onMouseEnter={() => isLocked && user?.role === "student" && setToastIdx(idx)}
                    onMouseLeave={() => isLocked && user?.role === "student" && setToastIdx(null)}
                  >
                    <span className="allcontent-module-title">{mod.moduleTitle}</span>
                    <span className="allcontent-module-meta">
                      {user?.role === "student" && (
                        isComplete ? (
                          <>
                            <MdDone className="status-icon done" />
                            <span className="allcontent-module-status done">Completed</span>
                          </>
                        ) : isOngoing ? (
                          <span className="allcontent-module-status ongoing">Ongoing</span>
                        ) : isLocked ? (
                          <>
                            <span className="allcontent-module-status locked">Not Started</span>
                            <FaLock className="lock-icon" />
                            {toastIdx === idx && (
                              <span className="locked-toast">Complete previous <br />module to unlock</span>
                            )}
                          </>
                        ) : (
                          <span className="allcontent-module-status notstarted">Not Started</span>
                        )
                      )}
                    </span>
                  </div>
                );
              })}

              {user?.role === "instructor" && (
                <div className="allcontent-add-btn-wrapper">
                  <button className="allcontent-add-btn" title="Add Module" onClick={handleAddModule}>
                    <FaPlusCircle size={36} />
                  </button>
                </div>
              )}

              {/* === QUIZ SIDEBAR ITEM ONLY IF QUIZZES EXIST === */}
              {quizStepExists && (
                <div
                  className={
                    "allcontent-module-item" +
                    (selectedSidebar === "quiz" ? " selected" : "") +
                    ((user?.role === "student" && completedModules !== totalModules) ? " locked" : "")
                  }
                  tabIndex={(user?.role === "student" && completedModules !== totalModules) ? -1 : 0}
                  onClick={() => {
                    if (user?.role !== "student" || (completedModules === totalModules && totalModules > 0)) {
                      setSelectedSidebar("quiz");
                      if (user?._id) {
                        localStorage.setItem(`lastSelectedSidebar_${user._id}_${courseId}`, "quiz");
                      }
                    }
                  }}
                >
                  <span className="allcontent-module-title">Quiz</span>
                  <span className="allcontent-module-meta">
                    {user?.role === "student" && (
                      allQuizzesPassed ? (
                        <>
                          <MdDone className="status-icon done" />
                          <span className="allcontent-module-status done">Completed</span>
                        </>
                      ) : (
                        (() => {
                          // Find if at least one quiz is attempted
                          const anyAttempted = quizList.some(q => (studentQuizData[q._id] || []).length > 0);
                          return anyAttempted ? (
                            <span className="allcontent-module-status ongoing">Ongoing</span>
                          ) : (
                            <>
                              <span className="allcontent-module-status locked">Not Started</span>
                              {(completedModules !== totalModules) && <FaLock className="lock-icon" />}
                            </>
                          );
                        })()
                      )
                    )}
                  </span>
                </div>
              )}
              {/* === END QUIZ SIDEBAR ITEM === */}
              {user?.role === "student" && (
                <div
                  className={
                    "allcontent-module-item" +
                    (selectedSidebar === "certificate" ? " selected" : "") +
                    ((completedModules !== totalModules || !allQuizzesPassed) ? " locked" : "")
                  }
                  tabIndex={(completedModules !== totalModules || !allQuizzesPassed) ? -1 : 0}
                  onClick={() => {
                    if (completedModules === totalModules && allQuizzesPassed) {
                      setSelectedSidebar("certificate");
                      if (user?._id) {
                        localStorage.setItem(`lastSelectedSidebar_${user._id}_${courseId}`, "certificate");
                      }
                    }
                  }}
                >
                  <span className="allcontent-module-title">Certificate</span>
                  <span className="allcontent-module-meta">
                    {(completedModules === totalModules && allQuizzesPassed) ? (
                      <>
                        <MdDone className="status-icon done" />
                        <span className="allcontent-module-status done">Unlocked</span>
                      </>
                    ) : (
                      <>
                        <span className="allcontent-module-status locked">Locked</span>
                        <FaLock className="lock-icon" />
                      </>
                    )}
                  </span>
                </div>
              )}

            </div>
          )}
          <div className="allcontent-sidebar-footer">
  Customer Support: <a href="mailto:support@ocktiv.com">support@ocktiv.com</a>
</div>
        </aside>
        {/* Main content */}
        <main className="allcontent-main">
          {selectedSidebar === "quiz" ? (
            <QuizList
              courseId={courseId}
              user={user}
              locked={user?.role === "student" && completedModules !== totalModules}
              quizTitle="Quiz"
            />
          ) : selectedSidebar === "certificate" ? (
            <CertificateTab user={user} courseId={courseId} />
          ) : (
            selectedModule && (
              <>
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
                          style={{ marginLeft: 12, cursor: "pointer" }}
                          onClick={() => handleEditModule(selectedModule._id)}
                        />
                        <FaTrash
                          className="allcontent-delete-icon"
                          title="Delete Module"
                          style={{ marginLeft: 10, cursor: "pointer" }}
                          onClick={() => handleDeleteModule(selectedModule._id)}
                          disabled={deleting}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {error && (
                  <div style={{ color: "#c00", fontSize: 15, margin: "7px 0 2px 3px" }}>
                    {error}
                  </div>
                )}

                <div className="allcontent-tabs-row">
                  <span className="allcontent-tab active">Contents</span>
                </div>
                <div className="allcontent-desc-label">Lectures Description</div>
                <div
                  className="allcontent-desc-body"
                  dangerouslySetInnerHTML={{ __html: descriptionWithoutYouTube }}
                />
                {attachedFiles.length > 0 && (
                  <div className="allcontent-files-section">
                    <div className="allcontent-files-label">
                      Attached Files ({attachedFiles.length.toString().padStart(2, "0")})
                    </div>
                    <div className="allcontent-files-list">
                      {attachedFiles.map((file, i) => {
                        const isImage = /\.(jpe?g|png|gif|bmp|webp)$/i.test(file.name);
                        const hasKey = !!file.key;
                        const downloadUrl = hasKey
                          ? `${window.location.hostname === "localhost"
                            ? "http://localhost:5050"
                            : "https://ocktivwebsite-3.onrender.com"
                          }/api/download/${file.key}`
                          : file.url;
                        return (
                          <div className="allcontent-file-card" key={i}>
                            <span className="allcontent-file-icon">{fileIconComponent(file)}</span>
                            <span className="allcontent-file-name">{file.name}</span>
                            {isImage ? (
                              hasKey ? (
                                <button
                                  className="allcontent-file-download-btn"
                                  type="button"
                                  onClick={() => forceImageDownload(downloadUrl, file.name)}
                                >
                                  Download File
                                </button>
                              ) : (
                                <span style={{ color: "#a22", fontSize: 13 }}>
                                  No download available
                                </span>
                              )
                            ) : (
                              hasKey ? (
                                <a
                                  href={downloadUrl}
                                  className="allcontent-file-download-btn"
                                  download={file.name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Download File
                                </a>
                              ) : (
                                <span style={{ color: "#a22", fontSize: 13 }}>
                                  No download available
                                </span>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {user?.role === "student" &&
                  !hasYoutubeVideo(selectedModule) &&
                  selectedIdx < modules.length - 1 &&
                  !progress[selectedModule._id]?.completed && (
                    <div
                      style={{
                        margin: "42px 0 0 0",
                        display: "flex",
                        justifyContent: "flex-end",
                        minHeight: 80,
                      }}
                    >
                      <button
                        className="allcontent-next-btn"
                        style={{
                          padding: "12px 30px",
                          fontSize: "1.07rem",
                          borderRadius: "7px",
                          fontWeight: 600,
                          color: "#fff",
                          background: "#1664b6",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 2px 10px 0 rgba(60, 105, 190, 0.13)",
                          marginBottom: 30,
                        }}
                        onClick={handleManualCompleteAndNext}
                      >
                        Mark as Complete & Next Module
                      </button>
                    </div>
                  )}

              </>
            )
          )}
        </main>
      </div>
    </div>
  );
}
