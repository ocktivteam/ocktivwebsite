import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdDone } from "react-icons/md";
import { FaLock } from "react-icons/fa";

const MODULE_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/modules"
    : "https://ocktivwebsite-3.onrender.com/api/modules";
const PROGRESS_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/module-progress"
    : "https://ocktivwebsite-3.onrender.com/api/module-progress";
const QUIZ_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/quiz"
    : "https://ocktivwebsite-3.onrender.com/api/quiz";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export default function CourseContentsSidebar({ courseId }) {
  const user = getUser();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [quizList, setQuizList] = useState([]);
  const [studentQuizData, setStudentQuizData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch modules
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    axios.get(`${MODULE_API}/course/${courseId}`)
      .then(res => setModules(res.data.modules || []))
      .finally(() => setLoading(false));
  }, [courseId]);

  // Fetch progress for student
  useEffect(() => {
    if (!user?._id || user.role !== "student" || !modules.length) return;
    axios.get(`${PROGRESS_API}/user/${user._id}`)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : res.data.progress || [];
        const obj = {};
        arr.forEach(p => { obj[String(p.moduleId)] = p; });
        setProgress(obj);
      });
  }, [user?._id, modules.length]);

  // Fetch quizzes
  useEffect(() => {
    if (!courseId) return;
    axios.get(`${QUIZ_API}/course/${courseId}`)
      .then(res => setQuizList(res.data || []));
  }, [courseId]);

  // Fetch quiz attempts
  useEffect(() => {
    if (!user || user.role !== "student" || !quizList.length) return;
    const fetchAll = async () => {
      let result = {};
      await Promise.all(
        quizList.map(async quiz => {
          try {
            const { data } = await axios.get(
              `${QUIZ_API}/${quiz._id}`
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

  // Progress bar logic
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

  // --- RENDER ---
  return (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      padding: "24px 0 0 0",
      minWidth: 340,
      maxWidth: 400,
    }}>
      <div style={{
        fontWeight: 700,
        fontSize: 28,
        color: "#1976d2",
        marginBottom: 18,
        paddingLeft: 32
      }}>
        Course Contents
      </div>
      <div style={{
        color: "#1877d7",
        fontSize: 23,
        fontWeight: 700,
        marginBottom: 8,
        paddingLeft: 32
      }}>
        Progress: {percentComplete}% ({completedSteps}/{totalSteps})
      </div>
      <div style={{
        width: "83%",
        height: 16,
        background: "#e8f1e7",
        borderRadius: 14,
        margin: "0 0 28px 32px",
        boxShadow: "0 2px 9px 0 rgba(104,184,161,0.07)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          borderRadius: 14,
          background: "linear-gradient(90deg, #34d399 10%, #36c8f5 70%, #a3e635 100%)",
          width: `${percentComplete}%`,
          minWidth: 10,
          maxWidth: "100%",
          transition: "width 0.3s"
        }} />
      </div>

      {/* List modules */}
      <div style={{ width: "100%" }}>
        {modules.map((mod, idx) => {
          const prog = progress[String(mod._id)];
          const isComplete = !!prog?.completed;
          const isLocked = isModuleLocked(idx);
          return (
            <div
              key={mod._id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "22px 16px 22px 40px",
                background: idx % 2 === 1 ? "#f7fafd" : "transparent",
                borderLeft: isLocked ? "6px solid #bcbcbc" : "6px solid #6c9c30",
                opacity: isLocked ? 0.63 : 1,
                cursor: isLocked ? "not-allowed" : "pointer",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              <div style={{ flex: 1 }}>
                Module {idx + 1}
                <div style={{
                  fontWeight: 600,
                  color: isComplete ? "#37b34a" : isLocked ? "#bcbcbc" : "#888",
                  fontSize: 30,
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center"
                }}>
                  <span style={{ fontSize: 36, marginRight: 11 }}>
                    {isComplete ? <MdDone color="#37b34a" /> : isLocked ? <FaLock color="#bcbcbc" /> : <FaLock style={{ opacity: 0 }} />}
                  </span>
                  {isComplete ? "Completed" : isLocked ? "Locked" : "Not Started"}
                </div>
              </div>
            </div>
          );
        })}

        {/* Quiz */}
        {quizStepExists && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "22px 16px 22px 40px",
              borderLeft: completedModules !== totalModules ? "6px solid #bcbcbc" : "6px solid #6c9c30",
              opacity: completedModules !== totalModules ? 0.63 : 1,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <div style={{ flex: 1 }}>
              Quiz
              <div style={{
                fontWeight: 600,
                color: allQuizzesPassed ? "#37b34a" : completedModules !== totalModules ? "#bcbcbc" : "#888",
                fontSize: 30,
                marginTop: 10,
                display: "flex",
                alignItems: "center"
              }}>
                <span style={{ fontSize: 36, marginRight: 11 }}>
                  {allQuizzesPassed
                    ? <MdDone color="#37b34a" />
                    : completedModules !== totalModules
                      ? <FaLock color="#bcbcbc" />
                      : <FaLock style={{ opacity: 0 }} />}
                </span>
                {allQuizzesPassed ? "Completed" : completedModules !== totalModules ? "Locked" : "Not Started"}
              </div>
            </div>
          </div>
        )}

        {/* Certificate */}
        {user?.role === "student" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "22px 16px 22px 40px",
              borderLeft: (completedModules !== totalModules || !allQuizzesPassed) ? "6px solid #bcbcbc" : "6px solid #6c9c30",
              opacity: (completedModules !== totalModules || !allQuizzesPassed) ? 0.63 : 1,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <div style={{ flex: 1 }}>
              Certificate
              <div style={{
                fontWeight: 600,
                color: (completedModules === totalModules && allQuizzesPassed) ? "#37b34a" : "#bcbcbc",
                fontSize: 30,
                marginTop: 10,
                display: "flex",
                alignItems: "center"
              }}>
                <span style={{ fontSize: 36, marginRight: 11 }}>
                  {(completedModules === totalModules && allQuizzesPassed)
                    ? <MdDone color="#37b34a" />
                    : <FaLock color="#bcbcbc" />}
                </span>
                {(completedModules === totalModules && allQuizzesPassed) ? "Unlocked" : "Locked"}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
