import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/quizCover.css";

function formatTimeLimit(quizTime) {
  if (quizTime === null || quizTime === undefined) return "No time Limit";
  if (Number(quizTime) === 0) return "No time Limit";
  if (Number(quizTime) >= 60 && Number(quizTime) % 60 === 0) {
    const hours = Math.floor(Number(quizTime) / 60);
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${quizTime} minute${quizTime > 1 ? "s" : ""}`;
}

function formatAttempts(attemptsAllowed) {
  if (!attemptsAllowed || Number(attemptsAllowed) === 0) return "Unlimited";
  return attemptsAllowed;
}

function formatPassingRate(passingRate) {
  if (!passingRate) return "80%";
  return `${Math.round(Number(passingRate) * 100)}%`;
}

function calcTotalPoints(questions) {
  if (!questions) return 0;
  return questions.reduce((sum, q) => sum + (q.points || 1), 0);
}

// --- ADDED: Helper for background image
function getQuizCoverBackground() {
  if (window.innerWidth <= 900) {
    return "url('/img/quiz-cover-phone.jpg') no-repeat center center fixed";
  }
  return "url('/img/quiz-cover.jpg') no-repeat center center fixed";
}

const QuizCover = () => {
  const { courseId, quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // --- ADDED: Responsive background image state
  const [bgStyle, setBgStyle] = useState(getQuizCoverBackground());

  useEffect(() => {
    function handleResize() {
      setBgStyle(getQuizCoverBackground());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get(
        window.location.hostname === "localhost"
          ? `http://localhost:5050/api/quiz/${quizId}`
          : `https://ocktivwebsite-3.onrender.com/api/quiz/${quizId}`
      )
      .then((res) => {
        setQuiz(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [quizId]);

  const handleStart = () => {
    navigate(`/course-content/${courseId}/quiz/${quizId}`);
  };

  const handleBack = () => {
    navigate(`/course-content/${courseId}`);
  };

  if (loading) {
    return <div className="quizcover-loading">Loading...</div>;
  }

  if (!quiz) {
    return <div className="quizcover-error">Quiz not found.</div>;
  }

  // Use course title from populated or fallback
  const courseName =
    quiz.courseId && quiz.courseId.courseTitle
      ? quiz.courseId.courseTitle
      : "Course Name";

  return (
    <div
      className="quizcover-root"
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: bgStyle,
        backgroundSize: "cover",
        fontFamily: "'Inter', Arial, sans-serif"
      }}
    >
      <div className="quizcover-overlay"></div>
      <div className="quizcover-content">
        <div className="quizcover-left">
          <div className="quizcover-course">{courseName}</div>
          {/* Add this wrapper for quiz content below the course name */}
          <div className="quizcover-main">
            <div className="quizcover-title">{quiz.quizTitle || "Quiz Title"}</div>
            <div className="quizcover-description">
              {quiz.description || "Quiz Description"}
            </div>
            <div className="quizcover-info">
              <div>
                Time Limit:{" "}
                <span className="quizcover-bold">
                  {formatTimeLimit(quiz.quizTime)}
                </span>
              </div>
              <div>
                Attempts Allowed:{" "}
                <span className="quizcover-bold">
                  {formatAttempts(quiz.attemptsAllowed)}
                </span>
              </div>
              <div>
                Passing Rate:{" "}
                <span className="quizcover-bold">
                  {formatPassingRate(quiz.passingRate)}
                </span>
              </div>
              <div>
                Total Points:{" "}
                <span className="quizcover-bold">
                  {calcTotalPoints(quiz.questions)} Point(s)
                </span>
              </div>
            </div>
            <div className="quizcover-buttons">
              {user.role === "instructor" || user.role === "admin" ? (
                <button className="quizcover-take-btn" onClick={() => navigate(`/course-content/${courseId}/quiz/${quizId}?view=1`)}>
                  View Quiz
                </button>
              ) : (
                <button className="quizcover-take-btn" onClick={handleStart}>
                  Take Quiz
                </button>
              )}
              <button className="quizcover-back-btn" onClick={handleBack}>
                Go Back
              </button>
            </div>
          </div>
        </div>
        {/* No right image area, background covers page */}
      </div>
    </div>
  );
};

export default QuizCover;
