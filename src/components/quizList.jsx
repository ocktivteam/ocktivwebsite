import React, { useEffect, useState } from "react";
import axios from "axios";
import "./../style/quizList.css";
import { FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Helper: Score/PASS
function getQuizStatus(quiz, studentAttempts) {
  if (!studentAttempts || studentAttempts.length === 0) return { status: "Not started" };
  const latest = studentAttempts[studentAttempts.length - 1];
  const total = quiz.questions?.length || 0;
  const score = latest?.score || 0;
  const pass = score >= Math.ceil(total * 0.5);
  return {
    status: pass ? "PASSED" : "FAILED",
    score,
    total,
    attempted: true,
  };
}

export default function QuizList({
  courseId,
  user,
  locked,
  quizTitle = "Quiz",
  onQuizSelect, // for future
}) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentQuizData, setStudentQuizData] = useState({}); // quizId => studentAttempts[]
  const navigate = useNavigate();

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    axios
      .get(
        window.location.hostname === "localhost"
          ? `http://localhost:5050/api/quiz/course/${courseId}`
          : `https://ocktivwebsite-3.onrender.com/api/quiz/course/${courseId}`
      )
      .then(res => {
        setQuizzes(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load quizzes.");
        setLoading(false);
      });
  }, [courseId]);

  // Fetch attempts for student
  useEffect(() => {
    if (!user || user.role !== "student" || !quizzes.length) return;
    const fetchAll = async () => {
      let result = {};
      await Promise.all(
        quizzes.map(async quiz => {
          try {
            const { data } = await axios.get(
              (window.location.hostname === "localhost"
                ? `http://localhost:5050/api/quiz/${quiz._id}`
                : `https://ocktivwebsite-3.onrender.com/api/quiz/${quiz._id}`)
            );
            // Find student's attempts
            let attempts =
              (data && data.studentAttempts
                ? data.studentAttempts
                : quiz.studentAttempts || []
              ).filter(attempt => (attempt.studentId === user._id || (attempt.studentId && attempt.studentId._id === user._id)));
            result[quiz._id] = attempts;
          } catch (e) {
            result[quiz._id] = [];
          }
        })
      );
      setStudentQuizData(result);
    };
    fetchAll();
  }, [user, quizzes]);

  // Progress logic: number passed
  let passedCount = 0;
  let attemptedCount = 0;
  if (user && user.role === "student" && quizzes.length > 0) {
    quizzes.forEach(q => {
      const attempts = studentQuizData[q._id] || [];
      if (attempts.length > 0) attemptedCount++;
      const latest = attempts[attempts.length - 1];
      const score = latest?.score || 0;
      const total = q.questions?.length || 0;
      if (score >= Math.ceil(total * 0.5)) passedCount++;
    });
  }

  return (
    <div className="quizlist-container">
      <div className="quizlist-heading">
        <FaFileAlt className="quizlist-heading-icon" />
        <span>List of Available Quizzes</span>
      </div>
      {locked && (
        <div className="quizlist-locked-message">
          <span style={{ marginRight: 7, fontSize: 18, verticalAlign: -3 }}>🔒</span>
          Complete all modules to unlock quizzes.
        </div>
      )}
      {loading && <div className="quizlist-loading">Loading quizzes...</div>}
      {error && <div className="quizlist-error">{error}</div>}
      {!locked && quizzes.length === 0 && !loading && (
        <div className="quizlist-empty">No quizzes available for this course.</div>
      )}
      {!locked && quizzes.length > 0 && (
        <>
          <div className="quizlist-progress-info">
            {attemptedCount === 0
              ? "No attempted quizzes yet."
              : `${passedCount}/${quizzes.length} quizzes passed`}
          </div>
          <div className="quizlist-cards-wrapper">
            {quizzes.map((quiz, idx) => {
              const attempts = studentQuizData[quiz._id] || [];
              const statusObj = getQuizStatus(quiz, attempts);
              return (
                <div
                  key={quiz._id}
                  className={`quizlist-card 
                    ${statusObj.status === "PASSED" ? "passed" : ""}
                    ${statusObj.status === "FAILED" ? "failed" : ""}
                    ${statusObj.status === "Not started" ? "notstarted" : ""}
                  `}
                  tabIndex={0}
                  role="button"
                  onClick={() => {
                    // Clickable: just log for now, can add navigation/action later
                    //console.log("Quiz card clicked:", quiz.quizTitle);
                    navigate(`/course-content/${courseId}/quiz/${quiz._id}`);
                  }}
                  onKeyPress={e => {
                    if (e.key === "Enter" || e.key === " ") {
                     // console.log("Quiz card clicked (keyboard):", quiz.quizTitle);
                     navigate(`/course-content/${courseId}/quiz/${quiz._id}`);
                    }
                  }}
                  aria-label={`Quiz card: ${quiz.quizTitle || quizTitle}`}
                >
                  <div className="quizlist-card-row">
                    <div className="quizlist-title-group">
                      <div className="quizlist-title">{quiz.quizTitle || quizTitle}</div>
                      <div className="quizlist-description">{quiz.description || "No description."}</div>
                    </div>
                    <div className="quizlist-score-group">
                      <div className="quizlist-score-label">Score:</div>
                      {statusObj.status === "Not started" ? (
                        <div className="quizlist-score-notstarted">Not started</div>
                      ) : (
                        <div>
                          <span className="quizlist-score-points">
                            {statusObj.score}/{statusObj.total}
                          </span>
                          {" "}
                          –
                          <span className={
                            statusObj.status === "PASSED"
                              ? "quizlist-status-passed"
                              : statusObj.status === "FAILED"
                              ? "quizlist-status-failed"
                              : ""
                          }>
                            {" "}{statusObj.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
