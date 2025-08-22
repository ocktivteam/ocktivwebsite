// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import CourseNavbar from "./courseNavbar";
// import { useSessionCheck } from "../hooks/useSessionCheck";
// import "../style/news.css";
// import { FaRegFileAlt, FaLock } from "react-icons/fa";
// import { MdClose } from "react-icons/md";

// const API_ROOT =
//   window.location.hostname === "localhost"
//     ? "http://localhost:5050"
//     : "https://ocktivwebsite-3.onrender.com";

// function getCurrentUser() {
//   try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
// }

// function prettyDate(date) {
//   if (!date) return "";
//   const d = new Date(date);
//   const day = d.getDate();
//   const month = d.toLocaleString("en-US", { month: "long" });
//   const year = d.getFullYear();
//   return `${day} ${month} ${year}`;
// }

// function stripHtml(html = "") {
//   const d = document.createElement("div");
//   d.innerHTML = html || "";
//   return d.textContent || d.innerText || "";
// }

// function truncate(s = "", n = 180) {
//   const t = (s || "").trim();
//   if (t.length <= n) return t;
//   return t.slice(0, n) + "…";
// }

// function useCourseId() {
//   const location = useLocation();
//   const params = new URLSearchParams(location.search);
//   return params.get("courseId") || localStorage.getItem("lastCourseId") || "";
// }

// export default function News() {
//   useSessionCheck();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const courseId = useCourseId();
//   const user = getCurrentUser();
//   const userId = user?._id;
//   const isInstructor = user?.role === "instructor";

//   // State
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [moduleProgress, setModuleProgress] = useState({});
//   const [quizData, setQuizData] = useState([]);
//   const [studentQuizData, setStudentQuizData] = useState({});

//   // LocalStorage keys (per user + course)
//   const dismissedKey = useMemo(
//     () => `news_dismissed_${userId || "anon"}_${courseId}`,
//     [userId, courseId]
//   );
//   const readKey = useMemo(
//     () => `news_read_${userId || "anon"}_${courseId}`,
//     [userId, courseId]
//   );

//   // Read/dismissed sets (used in render & handlers)
//   const dismissedSet = useMemo(() => {
//     try { return new Set(JSON.parse(localStorage.getItem(dismissedKey) || "[]")); }
//     catch { return new Set(); }
//   }, [dismissedKey]);

//   const readSet = useMemo(() => {
//     try { return new Set(JSON.parse(localStorage.getItem(readKey) || "[]")); }
//     catch { return new Set(); }
//   }, [readKey]);

//   // Helper function to check if quiz is passed
//   const isQuizPassed = (quiz, attempts) => {
//     if (!attempts || attempts.length === 0) return false;
//     const latest = attempts[attempts.length - 1];
//     const total = quiz.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || quiz.questions?.length || 0;
//     const passingRate = typeof quiz.passingRate === 'number' ? quiz.passingRate : 0.8;
//     const passingScore = Math.ceil(total * passingRate);
//     const score = latest?.score || 0;
//     return score >= passingScore;
//   };

//   // Helper function to determine if a news item should be clickable
//   const isItemClickable = (item, allModulesData, allQuizData, progress, quizAttempts) => {
//     // Non-students can always click
//     if (user?.role !== "student") return true;

//     const itemType = item.type;
//     const itemId = item.entityId;

//     if (itemType === "module") {
//       // Find the module and its position in the sequence
//       const moduleIndex = allModulesData.findIndex(m => m._id === itemId);
//       if (moduleIndex === -1) return false;

//       // First module is always clickable
//       if (moduleIndex === 0) return true;

//       // For other modules, check if previous module is completed
//       const previousModule = allModulesData[moduleIndex - 1];
//       if (!previousModule) return true;
      
//       const previousProgress = progress[previousModule._id];
//       return previousProgress?.completed === true;

//     } else if (itemType === "quiz") {
//       // For quizzes, check if all modules are completed first
//       const allModulesCompleted = allModulesData.every(module => 
//         progress[module._id]?.completed === true
//       );
      
//       if (!allModulesCompleted) return false;

//       // If quiz is already passed, don't allow clicking (they can't retake)
//       const quiz = allQuizData.find(q => q._id === itemId);
//       if (!quiz) return false;
      
//       const attempts = quizAttempts[itemId] || [];
//       return !isQuizPassed(quiz, attempts);
//     }

//     return false;
//   };

//   // Effect: load progress data for students
//   useEffect(() => {
//     if (!courseId || !userId || user?.role !== "student") {
//       return;
//     }

//     const loadProgressData = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const headers = { Authorization: token ? `Bearer ${token}` : "" };

//         // Load module progress
//         const progressRes = await axios.get(`${API_ROOT}/api/module-progress/user/${userId}`, { headers });
//         const progressArray = Array.isArray(progressRes.data) ? progressRes.data : progressRes.data.progress || [];
//         const progressObj = {};
//         progressArray.forEach(p => {
//           progressObj[String(p.moduleId)] = p;
//         });
//         setModuleProgress(progressObj);

//         // Load quiz data
//         const quizRes = await axios.get(`${API_ROOT}/api/quiz/course/${courseId}`, { headers });
//         const quizList = quizRes.data || [];
//         setQuizData(quizList);

//         // Load quiz attempts for each quiz
//         if (quizList.length > 0) {
//           let quizAttemptsResult = {};
//           await Promise.all(
//             quizList.map(async quiz => {
//               try {
//                 const { data } = await axios.get(`${API_ROOT}/api/quiz/${quiz._id}`, { headers });
//                 let attempts = (data && data.studentAttempts
//                   ? data.studentAttempts
//                   : quiz.studentAttempts || []
//                 ).filter(attempt => (attempt.studentId === userId || (attempt.studentId && attempt.studentId._id === userId)));
//                 quizAttemptsResult[quiz._id] = attempts;
//               } catch {
//                 quizAttemptsResult[quiz._id] = [];
//               }
//             })
//           );
//           setStudentQuizData(quizAttemptsResult);
//         }

//       } catch (error) {
//         console.error("Failed to load progress data:", error);
//         setModuleProgress({});
//         setQuizData([]);
//         setStudentQuizData({});
//       }
//     };

//     loadProgressData();
//   }, [courseId, userId, user?.role]);

//   // Effect: load news (skip work for instructors but keep hooks order intact)
//   useEffect(() => {
//     if (!courseId || !userId || isInstructor) {
//       setLoading(false);
//       return;
//     }

//     let mounted = true;

//     async function load() {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem("authToken");
//         const headers = { Authorization: token ? `Bearer ${token}` : "" };

//         // 1) News (already filtered by backend)
//         const newsReq = axios.get(`${API_ROOT}/api/courses/${courseId}/news`, { headers });

//         // 2) Fallback lookups for descriptions
//         const modsReq = axios.get(`${API_ROOT}/api/modules/course/${courseId}`, { headers });
//         const quizzesReq = axios.get(`${API_ROOT}/api/quiz/course/${courseId}`, { headers });

//         const [newsRes, modsRes, quizzesRes] = await Promise.all([newsReq, modsReq, quizzesReq]);

//         const raw = Array.isArray(newsRes.data?.news) ? newsRes.data.news : [];
//         const modulesArr = modsRes.data?.modules || [];
//         const quizzesArr = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];

//         // Build lookup maps
//         const moduleMap = new Map();
//         modulesArr.forEach(m => {
//           moduleMap.set(String(m._id), {
//             title: m.moduleTitle,
//             description: stripHtml(m.description || "")
//           });
//         });

//         const quizMap = new Map();
//         quizzesArr.forEach(q => {
//           quizMap.set(String(q._id), {
//             title: q.quizTitle,
//             description: q.description || ""
//           });
//         });

//         // Read latest dismissed list locally to avoid effect deps warning
//         const dismissedNow = new Set(JSON.parse(localStorage.getItem(dismissedKey) || "[]"));

//         const mapped = raw
//           .map((it) => {
//             const eventDate = it.activity === "added" ? it.createdAt : it.updatedAt;
//             const versionId = `${it.type}:${it.id}:${new Date(it.updatedAt).toISOString()}`;

//             const isUpdate = it.activity === "updated";
//             const isAdd = it.activity === "added";

//             // Title/Description: prefer backend; else fallback to lookups
//             let title = it.title || (it.type === "quiz" ? "Quiz" : "Untitled Module");
//             let description = (it.description ?? "").toString();

//             if (!description) {
//               if (it.type === "module" && moduleMap.has(it.id)) {
//                 const m = moduleMap.get(it.id);
//                 title = title || m.title || title;
//                 description = m.description || description;
//               } else if (it.type === "quiz" && quizMap.has(it.id)) {
//                 const q = quizMap.get(it.id);
//                 title = title || q.title || title;
//                 description = q.description || description;
//               }
//             }

//             description = it.type === "module"
//               ? truncate(stripHtml(description))
//               : truncate(description);

//             return {
//               id: versionId,
//               entityId: it.id,
//               type: it.type,              // "module" | "quiz"
//               activity: it.activity,      // "added" | "updated"
//               title,
//               description,
//               status: isUpdate ? "Updated" : "Newly Added",
//               postedOn: prettyDate(eventDate),
//               ts: new Date(eventDate).getTime(),
//               updatedAt: it.updatedAt,
//               // We'll determine clickability later when we have all the data
//               clickable: true, // temporary, will be updated below
//             };
//           })
//           .filter((it) => !dismissedNow.has(it.id))
//           .sort((a, b) => b.ts - a.ts);

//         // Update clickability based on current progress
//         const updatedMapped = mapped.map(item => ({
//           ...item,
//           clickable: isItemClickable(item, modulesArr, quizzesArr, moduleProgress, studentQuizData)
//         }));

//         if (mounted) setItems(updatedMapped);
//       } catch {
//         if (mounted) setItems([]);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }

//     load();
//     return () => { mounted = false; };
//   }, [courseId, userId, location.key, dismissedKey, isInstructor, moduleProgress, studentQuizData]);

//   // Helpers
//   const markRead = (versionId) => {
//     if (readSet.has(versionId)) return;
//     const next = new Set([...readSet, versionId]);
//     localStorage.setItem(readKey, JSON.stringify(Array.from(next)));
//   };

//   const handleCardClick = (item) => {
//     if (!item.clickable) return; // block navigation
//     markRead(item.id);
//     if (item.type === "module") {
//       navigate(`/course/${courseId}`, { state: { selectedModuleId: item.entityId } });
//     } else {
//       navigate(`/course-content/${courseId}/quiz/${item.entityId}/cover`);
//     }
//   };

//   const handleDismiss = (e, versionId) => {
//     e.stopPropagation();
//     const next = new Set([...dismissedSet, versionId]);
//     localStorage.setItem(dismissedKey, JSON.stringify(Array.from(next)));
//     setItems((prev) => prev.filter((x) => x.id !== versionId));
//   };

//   const blockReason = (item) => {
//     if (user?.role !== "student") return "";
    
//     if (item.type === "module") {
//       if (item.activity === "added") {
//         return "New modules are locked until you complete the previous modules in sequence.";
//       }
//       return "Complete the previous module to access this updated content.";
//     } else if (item.type === "quiz") {
//       // Check if quiz is already passed
//       const quiz = quizData.find(q => q._id === item.entityId);
//       if (quiz) {
//         const attempts = studentQuizData[item.entityId] || [];
//         if (isQuizPassed(quiz, attempts)) {
//           return "You have already passed this quiz.";
//         }
//       }
//       return "Complete all modules before accessing quizzes.";
//     }
//     return "This content is currently locked.";
//   };

//   return (
//     <div className="news-page">
//       <CourseNavbar />

//       <div className="news-container">
//         <h1 className="news-title">Course News</h1>

//         {/* Instructor placeholder */}
//         {isInstructor ? (
//           <div className="news-empty">
//             <div className="news-empty-inner">
//               <div style={{ fontSize: 18, color: "#666", textAlign: "center" }}>
//                 Posting News for Instructors Coming Soon.
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="news-card-stack">
//             {loading && (
//               <div className="news-loading">Loading updates…</div>
//             )}

//             {!loading && items.length === 0 && (
//               <div className="news-empty">
//                 <div className="news-empty-inner">
//                   <img src="/img/empty-news.svg" alt="" onError={(e)=>{e.target.style.display="none"}} />
//                   <div>No news for now.</div>
//                   <div className="news-empty-sub">
//                     New items will appear here when your instructor adds or updates modules and quizzes.
//                   </div>
//                 </div>
//               </div>
//             )}

//             {!loading && items.map((item) => {
//               const unread = !readSet.has(item.id);
//               const cardClasses = `news-card ${item.type} ${unread ? "unread" : ""} ${item.clickable ? "" : "blocked"}`;
//               const reason = blockReason(item);
              
//               return (
//                 <div
//                   key={item.id}
//                   className={cardClasses}
//                   role="button"
//                   tabIndex={0}
//                   aria-disabled={!item.clickable}
//                   title={item.clickable ? undefined : reason}
//                   onClick={() => handleCardClick(item)}
//                   onKeyDown={(e) => {
//                     if (!item.clickable) return;
//                     if (e.key === "Enter" || e.key === " ") handleCardClick(item);
//                   }}
//                   aria-label={`${item.type === "quiz" ? "Quiz" : "Module"}: ${item.title}`}
//                 >
//                   <span className="news-accent" aria-hidden="true" />

//                   <div className="news-meta-right">
//                     <span className="news-posted">Posted on {item.postedOn}</span>
//                     <button
//                       className="news-dismiss"
//                       aria-label="Dismiss this update"
//                       title="Dismiss"
//                       onClick={(e) => handleDismiss(e, item.id)}
//                     >
//                       <MdClose size={18} />
//                     </button>
//                   </div>

//                   <div className="news-row">
//                     <div className="news-type-icon">
//                       <FaRegFileAlt />
//                     </div>
//                     <span className="news-type-chip">
//                       {item.type === "quiz" ? "Quiz" : "Module"}
//                     </span>
//                   </div>

//                   <div className="news-title-row">
//                     <div className="news-card-title">
//                       {item.title}
//                       {unread && <span className="news-unread-dot" aria-label="Unread" />}
//                     </div>
//                   </div>

//                   <div className="news-desc">
//                     {item.description || (item.type === "quiz" ? "Quiz" : "Module") + " description…"}
//                   </div>

//                   <div className={`news-status-pill ${item.status === "Updated" ? "updated" : "new"}`}>
//                     {item.status}
//                   </div>

//                   {!item.clickable && (
//                     <div className="news-locked-note" aria-live="polite">
//                       <FaLock style={{ marginRight: 8 }} />
//                       {reason}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


//=== new

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CourseNavbar from "./courseNavbar";
import { useSessionCheck } from "../hooks/useSessionCheck";
import "../style/news.css";
import { FaRegFileAlt, FaLock } from "react-icons/fa";
import { MdClose } from "react-icons/md";

const API_ROOT =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://ocktivwebsite-3.onrender.com";

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}

function prettyDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "long" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function stripHtml(html = "") {
  const d = document.createElement("div");
  d.innerHTML = html || "";
  return d.textContent || d.innerText || "";
}

function truncate(s = "", n = 180) {
  const t = (s || "").trim();
  if (t.length <= n) return t;
  return t.slice(0, n) + "…";
}

function useCourseId() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get("courseId") || localStorage.getItem("lastCourseId") || "";
}

export default function News() {
  useSessionCheck();
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = useCourseId();
  const user = getCurrentUser();
  const userId = user?._id;
  const isInstructor = user?.role === "instructor";

  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleProgress, setModuleProgress] = useState({});
  const [quizData, setQuizData] = useState([]);
  const [studentQuizData, setStudentQuizData] = useState({});

  // LocalStorage keys (per user + course)
  const dismissedKey = useMemo(
    () => `news_dismissed_${userId || "anon"}_${courseId}`,
    [userId, courseId]
  );
  const readKey = useMemo(
    () => `news_read_${userId || "anon"}_${courseId}`,
    [userId, courseId]
  );

  // Read/dismissed sets (used in render & handlers)
  const dismissedSet = useMemo(() => {
    try { return new Set(JSON.parse(localStorage.getItem(dismissedKey) || "[]")); }
    catch { return new Set(); }
  }, [dismissedKey]);

  const readSet = useMemo(() => {
    try { return new Set(JSON.parse(localStorage.getItem(readKey) || "[]")); }
    catch { return new Set(); }
  }, [readKey]);

  // Helper function to check if quiz is passed
  const isQuizPassed = (quiz, attempts) => {
    if (!attempts || attempts.length === 0) return false;
    const latest = attempts[attempts.length - 1];
    const total = quiz.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || quiz.questions?.length || 0;
    const passingRate = typeof quiz.passingRate === 'number' ? quiz.passingRate : 0.8;
    const passingScore = Math.ceil(total * passingRate);
    const score = latest?.score || 0;
    return score >= passingScore;
  };

  // Helper function to determine if a news item should be clickable
  const isItemClickable = (item, allModulesData, allQuizData, progress, quizAttempts) => {
    // Non-students can always click
    if (user?.role !== "student") return true;

    const itemType = item.type;
    const itemId = item.entityId;

    if (itemType === "module") {
      // Find the module and its position in the sequence
      const moduleIndex = allModulesData.findIndex(m => m._id === itemId);
      if (moduleIndex === -1) return false;

      // First module is always clickable
      if (moduleIndex === 0) return true;

      // For other modules, check if previous module is completed
      const previousModule = allModulesData[moduleIndex - 1];
      if (!previousModule) return true;
      
      const previousProgress = progress[previousModule._id];
      return previousProgress?.completed === true;

    } else if (itemType === "quiz") {
      // For quizzes, check if all modules are completed first
      const allModulesCompleted = allModulesData.every(module => 
        progress[module._id]?.completed === true
      );
      
      if (!allModulesCompleted) return false;

      // If quiz is already passed, don't allow clicking (they can't retake)
      const quiz = allQuizData.find(q => q._id === itemId);
      if (!quiz) return false;
      
      const attempts = quizAttempts[itemId] || [];
      return !isQuizPassed(quiz, attempts);
    }

    return false;
  };

  // Effect: load progress data for students
  useEffect(() => {
    if (!courseId || !userId || user?.role !== "student") {
      return;
    }

    const loadProgressData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: token ? `Bearer ${token}` : "" };

        // Load module progress
        const progressRes = await axios.get(`${API_ROOT}/api/module-progress/user/${userId}`, { headers });
        const progressArray = Array.isArray(progressRes.data) ? progressRes.data : progressRes.data.progress || [];
        const progressObj = {};
        progressArray.forEach(p => {
          progressObj[String(p.moduleId)] = p;
        });
        setModuleProgress(progressObj);

        // Load quiz data
        const quizRes = await axios.get(`${API_ROOT}/api/quiz/course/${courseId}`, { headers });
        const quizList = quizRes.data || [];
        setQuizData(quizList);

        // Load quiz attempts for each quiz
        if (quizList.length > 0) {
          let quizAttemptsResult = {};
          await Promise.all(
            quizList.map(async quiz => {
              try {
                const { data } = await axios.get(`${API_ROOT}/api/quiz/${quiz._id}`, { headers });
                let attempts = (data && data.studentAttempts
                  ? data.studentAttempts
                  : quiz.studentAttempts || []
                ).filter(attempt => (attempt.studentId === userId || (attempt.studentId && attempt.studentId._id === userId)));
                quizAttemptsResult[quiz._id] = attempts;
              } catch {
                quizAttemptsResult[quiz._id] = [];
              }
            })
          );
          setStudentQuizData(quizAttemptsResult);
        }

      } catch (error) {
        console.error("Failed to load progress data:", error);
        setModuleProgress({});
        setQuizData([]);
        setStudentQuizData({});
      }
    };

    loadProgressData();
  }, [courseId, userId, user?.role]);

  // Effect: load news (skip work for instructors but keep hooks order intact)
  useEffect(() => {
    if (!courseId || !userId || isInstructor) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: token ? `Bearer ${token}` : "" };

        // 1) News (already filtered by backend)
        const newsReq = axios.get(`${API_ROOT}/api/courses/${courseId}/news`, { headers });

        // 2) Fallback lookups for descriptions
        const modsReq = axios.get(`${API_ROOT}/api/modules/course/${courseId}`, { headers });
        const quizzesReq = axios.get(`${API_ROOT}/api/quiz/course/${courseId}`, { headers });

        const [newsRes, modsRes, quizzesRes] = await Promise.all([newsReq, modsReq, quizzesReq]);

        const raw = Array.isArray(newsRes.data?.news) ? newsRes.data.news : [];
        const modulesArr = modsRes.data?.modules || [];
        const quizzesArr = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];

        // Build lookup maps
        const moduleMap = new Map();
        modulesArr.forEach(m => {
          moduleMap.set(String(m._id), {
            title: m.moduleTitle,
            description: stripHtml(m.description || "")
          });
        });

        const quizMap = new Map();
        quizzesArr.forEach(q => {
          quizMap.set(String(q._id), {
            title: q.quizTitle,
            description: q.description || ""
          });
        });

        // Read latest dismissed list locally to avoid effect deps warning
        const dismissedNow = new Set(JSON.parse(localStorage.getItem(dismissedKey) || "[]"));

        const mapped = raw
          .map((it) => {
            const eventDate = it.activity === "added" ? it.createdAt : it.updatedAt;
            const versionId = `${it.type}:${it.id}:${new Date(it.updatedAt).toISOString()}`;

            const isUpdate = it.activity === "updated";
            const isAdd = it.activity === "added";

            // Title/Description: prefer backend; else fallback to lookups
            let title = it.title || (it.type === "quiz" ? "Quiz" : "Untitled Module");
            let description = (it.description ?? "").toString();

            if (!description) {
              if (it.type === "module" && moduleMap.has(it.id)) {
                const m = moduleMap.get(it.id);
                title = title || m.title || title;
                description = m.description || description;
              } else if (it.type === "quiz" && quizMap.has(it.id)) {
                const q = quizMap.get(it.id);
                title = title || q.title || title;
                description = q.description || description;
              }
            }

            description = it.type === "module"
              ? truncate(stripHtml(description))
              : truncate(description);

            return {
              id: versionId,
              entityId: it.id,
              type: it.type,              // "module" | "quiz"
              activity: it.activity,      // "added" | "updated"
              title,
              description,
              status: isUpdate ? "Updated" : "Newly Added",
              postedOn: prettyDate(eventDate),
              ts: new Date(eventDate).getTime(),
              updatedAt: it.updatedAt,
              // We'll determine clickability later when we have all the data
              clickable: true, // temporary, will be updated below
            };
          })
          .filter((it) => !dismissedNow.has(it.id))
          .sort((a, b) => b.ts - a.ts);

        // Update clickability based on current progress
        const updatedMapped = mapped.map(item => ({
          ...item,
          clickable: isItemClickable(item, modulesArr, quizzesArr, moduleProgress, studentQuizData)
        }));

        if (mounted) setItems(updatedMapped);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [courseId, userId, location.key, dismissedKey, isInstructor, moduleProgress, studentQuizData]);

  // Helpers
  const markRead = (versionId) => {
    if (readSet.has(versionId)) return;
    const next = new Set([...readSet, versionId]);
    localStorage.setItem(readKey, JSON.stringify(Array.from(next)));
  };

  const handleCardClick = (item) => {
    if (!item.clickable) return; // block navigation
    markRead(item.id);
    if (item.type === "module") {
      // Navigate to AllContent with the specific module selected
      navigate(`/course-content/${courseId}`, { 
        state: { 
          selectedModuleId: item.entityId,
          selectedSidebar: "module"
        } 
      });
    } else {
      navigate(`/course-content/${courseId}/quiz/${item.entityId}/cover`);
    }
  };

  const handleDismiss = (e, versionId) => {
    e.stopPropagation();
    const next = new Set([...dismissedSet, versionId]);
    localStorage.setItem(dismissedKey, JSON.stringify(Array.from(next)));
    setItems((prev) => prev.filter((x) => x.id !== versionId));
  };

  const blockReason = (item) => {
    if (user?.role !== "student") return "";
    
    if (item.type === "module") {
      if (item.activity === "added") {
        return "New modules are locked until you complete the previous modules in sequence.";
      }
      return "Complete the previous module to access this updated content.";
    } else if (item.type === "quiz") {
      // Check if quiz is already passed
      const quiz = quizData.find(q => q._id === item.entityId);
      if (quiz) {
        const attempts = studentQuizData[item.entityId] || [];
        if (isQuizPassed(quiz, attempts)) {
          return "You have already passed this quiz.";
        }
      }
      return "Complete all modules before accessing quizzes.";
    }
    return "This content is currently locked.";
  };

  return (
    <div className="news-page">
      <CourseNavbar />

      <div className="news-container">
        <h1 className="news-title">Course News</h1>

        {/* Instructor placeholder */}
        {isInstructor ? (
          <div className="news-empty">
            <div className="news-empty-inner">
            <div style={{ fontSize: 18, color: "#666", textAlign: "center" }}>
  <div>Posting News for Instructors Coming Soon.</div>
  <div style={{ marginTop: 6, fontSize: 14, color: "#8c93a1" }}>
    Note: Students who are enrolled in your course can see your newly added/updated modules and quizzes
  </div>
</div>
            </div>
          </div>
        ) : (
          <div className="news-card-stack">
            {loading && (
              <div className="news-loading">Loading updates…</div>
            )}

            {!loading && items.length === 0 && (
              <div className="news-empty">
                <div className="news-empty-inner">
                  <img src="/img/empty-news.svg" alt="" onError={(e)=>{e.target.style.display="none"}} />
                  <div>No news for now.</div>
                  <div className="news-empty-sub">
                    New items will appear here when your instructor adds or updates modules and quizzes.
                  </div>
                </div>
              </div>
            )}

            {!loading && items.map((item) => {
              const unread = !readSet.has(item.id);
              const cardClasses = `news-card ${item.type} ${unread ? "unread" : ""} ${item.clickable ? "" : "blocked"}`;
              const reason = blockReason(item);
              
              return (
                <div
                  key={item.id}
                  className={cardClasses}
                  role="button"
                  tabIndex={0}
                  aria-disabled={!item.clickable}
                  title={item.clickable ? undefined : reason}
                  onClick={() => handleCardClick(item)}
                  onKeyDown={(e) => {
                    if (!item.clickable) return;
                    if (e.key === "Enter" || e.key === " ") handleCardClick(item);
                  }}
                  aria-label={`${item.type === "quiz" ? "Quiz" : "Module"}: ${item.title}`}
                >
                  <span className="news-accent" aria-hidden="true" />

                  <div className="news-meta-right">
                    <span className="news-posted">Posted on {item.postedOn}</span>
                    <button
                      className="news-dismiss"
                      aria-label="Dismiss this update"
                      title="Dismiss"
                      onClick={(e) => handleDismiss(e, item.id)}
                    >
                      <MdClose size={18} />
                    </button>
                  </div>

                  <div className="news-row">
                    <div className="news-type-icon">
                      <FaRegFileAlt />
                    </div>
                    <span className="news-type-chip">
                      {item.type === "quiz" ? "Quiz" : "Module"}
                    </span>
                  </div>

                  <div className="news-title-row">
                    <div className="news-card-title">
                      {item.title}
                      {unread && <span className="news-unread-dot" aria-label="Unread" />}
                    </div>
                  </div>

                  <div className="news-desc">
                    {item.description || (item.type === "quiz" ? "Quiz" : "Module") + " description…"}
                  </div>

                  <div className={`news-status-pill ${item.status === "Updated" ? "updated" : "new"}`}>
                    {item.status}
                  </div>

                  {!item.clickable && (
                    <div className="news-locked-note" aria-live="polite">
                      <FaLock style={{ marginRight: 8 }} />
                      {reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}