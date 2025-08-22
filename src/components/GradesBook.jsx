

// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// import { useSessionCheck } from "../hooks/useSessionCheck";
// import CourseNavbar from "./courseNavbar";
// import "../style/gradesBook.css";

// const AUTH_API_BASE =
//   window.location.hostname === "localhost"
//     ? "http://localhost:5050/auth"
//     : "https://ocktivwebsite-3.onrender.com/auth";

// const QUIZ_API_BASE =
//   window.location.hostname === "localhost"
//     ? "http://localhost:5050/api/quiz"
//     : "https://ocktivwebsite-3.onrender.com/api/quiz";

// // Compute score & pass/fail for THIS user's attempts
// function getQuizStatus(quiz, attemptsForUser) {
//   if (!attemptsForUser || attemptsForUser.length === 0) {
//     return { status: "Not started" };
//   }
//   const latest = attemptsForUser[attemptsForUser.length - 1];
//   const total =
//     (quiz.questions || []).reduce((sum, q) => sum + (q.points || 1), 0) || 0;
//   const score = typeof latest?.score === "number" ? latest.score : 0;
//   const rate = typeof quiz.passingRate === "number" ? quiz.passingRate : 0.8;
//   const pass = score >= Math.ceil(total * rate);
//   return { status: pass ? "PASSED" : "FAILED", score, total, attempted: true };
// }

// async function fetchCurrentUser() {
//   try {
//     const { data } = await axios.get(`${AUTH_API_BASE}/me`, {
//       withCredentials: true,
//     });
//     if (data && data._id) return data;
//   } catch (_) {}
//   try {
//     const raw =
//       localStorage.getItem("user") || localStorage.getItem("ocktiv_user");
//     if (raw) return JSON.parse(raw);
//   } catch (_) {}
//   return null;
// }

// export default function GradesBook() {
//   useSessionCheck();

//   const { courseId: courseIdFromParams } = useParams();
//   const [searchParams] = useSearchParams();
//   const courseId = courseIdFromParams || searchParams.get("courseId") || null;

//   const [user, setUser] = useState(null);
//   const [quizzes, setQuizzes] = useState([]);
//   const [attemptsByQuiz, setAttemptsByQuiz] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   // Load current user
//   useEffect(() => {
//     (async () => {
//       const me = await fetchCurrentUser();
//       setUser(me);
//     })();
//   }, []);

//   // Fetch quizzes (this course) + only THIS user's attempts
//   useEffect(() => {
//     if (!courseId) {
//       setError("Missing courseId in URL.");
//       setLoading(false);
//       return;
//     }
//     if (!user?._id) return;

//     const run = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         // quizzes for this course
//         const { data: quizList = [] } = await axios.get(
//           `${QUIZ_API_BASE}/course/${courseId}`
//         );
//         setQuizzes(quizList);

//         // attempts for THIS user per quiz
//         const result = {};
//         await Promise.all(
//           quizList.map(async (quiz) => {
//             try {
//               const { data } = await axios.get(`${QUIZ_API_BASE}/${quiz._id}`);
//               const all = data?.studentAttempts || quiz.studentAttempts || [];
//               const mine = all.filter((a) => {
//                 const sid = a.studentId && (a.studentId._id || a.studentId);
//                 return sid === user._id;
//               });
//               mine.sort((a, b) => {
//                 const ta = new Date(
//                   a.createdAt || a.updatedAt || 0
//                 ).getTime();
//                 const tb = new Date(
//                   b.createdAt || b.updatedAt || 0
//                 ).getTime();
//                 return ta - tb;
//               });
//               result[quiz._id] = mine;
//             } catch (_) {
//               result[quiz._id] = [];
//             }
//           })
//         );

//         setAttemptsByQuiz(result);
//       } catch (_) {
//         setError("Failed to load grades.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     run();
//   }, [courseId, user?._id]);

//   const isStaff = user && (user.role === "instructor" || user.role === "admin");

//   // Summary for students only
//   const summary = useMemo(() => {
//     if (isStaff) return { attempted: 0, passed: 0, total: 0 };
//     let attempted = 0;
//     let passed = 0;
//     quizzes.forEach((q) => {
//       const mine = attemptsByQuiz[q._id] || [];
//       const s = getQuizStatus(q, mine);
//       if (s.attempted) attempted += 1;
//       if (s.status === "PASSED") passed += 1;
//     });
//     return { attempted, passed, total: quizzes.length };
//   }, [quizzes, attemptsByQuiz, isStaff]);

//   return (
//     <div className="gradesbook-page">
//       <CourseNavbar courseId={courseId} activeTab="grades" />

//       {/* PAGE HEADER (outside the card) */}
//       <div className="gradesbook-header">
//         <h1 className="gradesbook-h1">Gradebook</h1>
//         {!isStaff && !loading && !error && user && (
//           <div className="gradesbook-summary">
//             {summary.total === 0
//               ? "No graded items yet in this course."
//               : summary.attempted === 0
//               ? "You haven't attempted any quizzes in this course yet."
//               : `${summary.passed}/${summary.total} quizzes passed`}
//           </div>
//         )}
//       </div>

//       {/* CARD */}
//       <div className="gradesbook-shell">
//         {(!user || loading || error) && (
//           <>
//             {!user && (
//               <div className="gradesbook-error">
//                 Please sign in to view your grades.
//               </div>
//             )}
//             {loading && <div className="gradesbook-loading">Loading grades...</div>}
//             {error && <div className="gradesbook-error">{error}</div>}
//           </>
//         )}

//         {/* Staff view: show coming-soon message */}
//         {!loading && !error && user && isStaff && (
//           <div className="gradesbook-empty">
//             <div className="gradesbook-empty-title">
//               Posting Grades for Instructors Coming Soon.
//             </div>
//             <div className="gradesbook-empty-note">
//               Note: Students enrolled in your course can view their own quiz results here.
//             </div>
//           </div>
//         )}

//         {/* Student view: list */}
//         {!loading && !error && user && !isStaff && (
//           <div className="gradesbook-cardlist">
//             <div className="gb-row gb-header">
//               <div className="gb-col item">Grade Item</div>
//               <div className="gb-col score">Score</div>
//               <div className="gb-col status">Status</div>
//             </div>

//             {quizzes.map((quiz) => {
//               const mine = attemptsByQuiz[quiz._id] || [];
//               const s = getQuizStatus(quiz, mine);
//               const scoreCol =
//                 s.status === "Not started" ? "-" : `${s.score}/${s.total} - ${s.status}`;
//               const statusCol =
//                 s.status === "Not started"
//                   ? "Not started"
//                   : s.status === "PASSED"
//                   ? "Completed"
//                   : "Ongoing";

//               return (
//                 <button
//                   key={quiz._id}
//                   className="gb-row gb-item"
//                   onClick={() =>
//                     navigate(`/course-content/${courseId}/quiz/${quiz._id}/cover`)
//                   }
//                 >
//                   <div className="gb-col item">
//                     <div className="gb-item-title">
//                       {quiz.quizTitle || "Quiz Title"}
//                     </div>
//                   </div>
//                   <div className="gb-col score">{scoreCol}</div>
//                   <div
//                     className={`gb-col status ${statusCol
//                       .toLowerCase()
//                       .replace(" ", "-")}`}
//                   >
//                     {statusCol}
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSessionCheck } from "../hooks/useSessionCheck";
import CourseNavbar from "./courseNavbar";
import "../style/gradesBook.css";

const AUTH_API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/auth"
    : "https://ocktivwebsite-3.onrender.com/auth";

const QUIZ_API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/quiz"
    : "https://ocktivwebsite-3.onrender.com/api/quiz";

const API_ROOT =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://ocktivwebsite-3.onrender.com";

// Compute score & pass/fail for THIS user's attempts
function getQuizStatus(quiz, attemptsForUser) {
  if (!attemptsForUser || attemptsForUser.length === 0) {
    return { status: "Not started" };
  }
  const latest = attemptsForUser[attemptsForUser.length - 1];
  const total =
    (quiz.questions || []).reduce((sum, q) => sum + (q.points || 1), 0) || 0;
  const score = typeof latest?.score === "number" ? latest.score : 0;
  const rate = typeof quiz.passingRate === "number" ? quiz.passingRate : 0.8;
  const pass = score >= Math.ceil(total * rate);
  return { status: pass ? "PASSED" : "FAILED", score, total, attempted: true };
}

async function fetchCurrentUser() {
  try {
    const { data } = await axios.get(`${AUTH_API_BASE}/me`, {
      withCredentials: true,
    });
    if (data && data._id) return data;
  } catch (_) {}
  try {
    const raw =
      localStorage.getItem("user") || localStorage.getItem("ocktiv_user");
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

export default function GradesBook() {
  useSessionCheck();

  const { courseId: courseIdFromParams } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = courseIdFromParams || searchParams.get("courseId") || null;

  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [attemptsByQuiz, setAttemptsByQuiz] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modules, setModules] = useState([]);
  const [moduleProgress, setModuleProgress] = useState({});
  const navigate = useNavigate();

  const isStaff = user && (user.role === "instructor" || user.role === "admin");
  const isStudent = user?.role === "student";

  // prevent infinite spinner for staff
useEffect(() => {
    if (isStaff) setLoading(false);
  }, [isStaff]);
  
  // Load current user
  useEffect(() => {
    (async () => {
      const me = await fetchCurrentUser();
      setUser(me);
    })();
  }, []);

  // Fetch quizzes (this course) + only THIS user's attempts
  useEffect(() => {
    if (!courseId) {
      setError("Missing courseId in URL.");
      setLoading(false);
      return;
    }
    if (!user?._id || isStaff) return; // staff won't see the list anyway

    const run = async () => {
      setLoading(true);
      setError("");

      try {
        // quizzes for this course
        const { data: quizList = [] } = await axios.get(
          `${QUIZ_API_BASE}/course/${courseId}`
        );
        setQuizzes(quizList);

        // attempts for THIS user per quiz
        const result = {};
        await Promise.all(
          quizList.map(async (quiz) => {
            try {
              const { data } = await axios.get(`${QUIZ_API_BASE}/${quiz._id}`);
              const all = data?.studentAttempts || quiz.studentAttempts || [];
              const mine = all.filter((a) => {
                const sid = a.studentId && (a.studentId._id || a.studentId);
                return sid === user._id;
              });
              mine.sort((a, b) => {
                const ta = new Date(
                  a.createdAt || a.updatedAt || 0
                ).getTime();
                const tb = new Date(
                  b.createdAt || b.updatedAt || 0
                ).getTime();
                return ta - tb;
              });
              result[quiz._id] = mine;
            } catch (_) {
              result[quiz._id] = [];
            }
          })
        );

        setAttemptsByQuiz(result);
      } catch (_) {
        setError("Failed to load grades.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [courseId, user?._id, isStaff]);

  // Load modules + this student's module progress (for unlock logic)
  useEffect(() => {
    if (!courseId || !user?._id || !isStudent) return;

    (async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: token ? `Bearer ${token}` : "" };

        // Modules in this course
        const modsRes = await axios.get(
          `${API_ROOT}/api/modules/course/${courseId}`,
          { headers }
        );
        const modulesArr = modsRes.data?.modules || [];
        setModules(modulesArr);

        // This student's progress
        const progRes = await axios.get(
          `${API_ROOT}/api/module-progress/user/${user._id}`,
          { headers }
        );
        const progressArray = Array.isArray(progRes.data)
          ? progRes.data
          : progRes.data.progress || [];
        const progressObj = {};
        progressArray.forEach((p) => {
          progressObj[String(p.moduleId)] = p;
        });
        setModuleProgress(progressObj);
      } catch (e) {
        // if anything fails, treat as not completed
        setModules((m) => m || []);
        setModuleProgress({});
      }
    })();
  }, [courseId, user?._id, isStudent]);

  // Are quizzes unlocked for this student? (all modules completed)
  const quizzesUnlocked = useMemo(() => {
    if (!isStudent) return true; // staff/non-students: treat as unlocked (they see staff view anyway)
    if (!modules.length) return true; // if course has no modules, allow
    return modules.every((m) => moduleProgress[m._id]?.completed === true);
  }, [isStudent, modules, moduleProgress]);

  // Summary (students only)
  const summary = useMemo(() => {
    if (isStaff) return { attempted: 0, passed: 0, total: 0 };
    let attempted = 0;
    let passed = 0;
    quizzes.forEach((q) => {
      const mine = attemptsByQuiz[q._id] || [];
      const s = getQuizStatus(q, mine);
      if (s.attempted) attempted += 1;
      if (s.status === "PASSED") passed += 1;
    });
    return { attempted, passed, total: quizzes.length };
  }, [quizzes, attemptsByQuiz, isStaff]);

  const handleOpenQuiz = (quizId) => {
    if (!quizzesUnlocked) return;
    navigate(`/course-content/${courseId}/quiz/${quizId}/cover`);
  };

  return (
    <div className="gradesbook-page">
      <CourseNavbar courseId={courseId} activeTab="grades" />

      {/* PAGE HEADER */}
      <div className="gradesbook-header">
        <h1 className="gradesbook-h1">Gradebook</h1>
        {!isStaff && !loading && !error && user && (
          <div className="gradesbook-summary">
            {summary.total === 0
              ? "No graded items yet in this course."
              : summary.attempted === 0
              ? "You haven't attempted any quizzes in this course yet."
              : `${summary.passed}/${summary.total} quizzes passed`}
          </div>
        )}
      </div>

      {/* CARD */}
      <div className="gradesbook-shell">
        {(!user || loading || error) && (
          <>
            {!user && (
              <div className="gradesbook-error">
                Please sign in to view your grades.
              </div>
            )}
            {loading && (
              <div className="gradesbook-loading">Loading grades...</div>
            )}
            {error && <div className="gradesbook-error">{error}</div>}
          </>
        )}

        {/* Staff view */}
        {!loading && !error && user && isStaff && (
          <div className="gradesbook-empty">
            <div className="gradesbook-empty-title">
              Posting Grades for Instructors Coming Soon.
            </div>
            <div className="gradesbook-empty-note">
              Note: Students enrolled in your course can view their quiz results here.
            </div>
          </div>
        )}

        {/* Student view */}
        {!loading && !error && user && !isStaff && (
          <div className="gradesbook-cardlist">
            <div className="gb-row gb-header">
              <div className="gb-col item">Grade Item</div>
              <div className="gb-col score">Score</div>
              <div className="gb-col status">Status</div>
            </div>

            {quizzes.map((quiz) => {
              const mine = attemptsByQuiz[quiz._id] || [];
              const s = getQuizStatus(quiz, mine);
              const scoreCol =
                s.status === "Not started" ? "-" : `${s.score}/${s.total} - ${s.status}`;

              // lock at the course level unless all modules completed
              const isLocked = !quizzesUnlocked;
              const statusCol = isLocked
                ? "Locked"
                : s.status === "Not started"
                ? "Not started"
                : s.status === "PASSED"
                ? "Completed"
                : "Ongoing";

              const rowClasses = `gb-row gb-item ${isLocked ? "locked" : ""}`;

              return (
                <div
                  key={quiz._id}
                  className={rowClasses}
                  role="button"
                  tabIndex={isLocked ? -1 : 0}
                  aria-disabled={isLocked}
                  title={isLocked ? "Complete all modules to unlock quizzes." : undefined}
                  onClick={() => !isLocked && handleOpenQuiz(quiz._id)}
                  onKeyDown={(e) => {
                    if (isLocked) return;
                    if (e.key === "Enter" || e.key === " ") {
                      handleOpenQuiz(quiz._id);
                    }
                  }}
                >
                  <div className="gb-col item">
                    <div className="gb-item-title">
                      {quiz.quizTitle || "Quiz Title"}
                    </div>
                  </div>
                  <div className="gb-col score">{scoreCol}</div>
                  <div
                    className={`gb-col status ${statusCol
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {statusCol}
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
