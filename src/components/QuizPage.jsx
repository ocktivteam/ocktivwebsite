import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/QuizPage.css";


function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

const API_ROOT =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://ocktivwebsite-3.onrender.com";

const QuizPage = () => {
  const { courseId, quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate(); 

  const user = getCurrentUser();
  const isStudent = user?.role === "student";
  const [score, setScore] = useState(null);
  const [popupImg, setPopupImg] = useState(null);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome
      }
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [submitted]);
  
  
  useEffect(() => {
    axios
      .get(`${API_ROOT}/api/quiz/${quizId}`)
      .then((res) => {
        setQuiz(res.data);
        setLoading(false);
        if (res.data.quizTime && !isNaN(res.data.quizTime)) {
          setTimeLeft(Number(res.data.quizTime) * 60);
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft === 0) return;
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitted]);

  const handleAnswer = useCallback((questionIndex, optionIndex) => {
    if (submitted) return;
    setSelectedAnswers(prev => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  }, [submitted]);

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    const element = document.getElementById(`quiz-q-card-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // === AUTO GRADE and SUBMIT logic ===
  // === AUTO GRADE and SUBMIT logic ===
  const handleSubmit = async () => {
    if (!quiz || !quiz.questions || !user?._id || !isStudent) return;

    try {
      // Submit answers to backend
      const res = await axios.post(
        `${API_ROOT}/api/quiz/${quizId}/submit`,
        {
          studentId: user._id,
          submittedAnswers: selectedAnswers,
        }
      );

// Remove draft after submission, but ignore errors like "not found"
try {
  await axios.delete(
    `${API_ROOT}/api/quiz/${quizId}/draft/${user._id}`
  );
} catch (e) {
  // Ignore draft not found error
}


      // Grading logic
// -- Calculate max possible points & passing points --
const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
const passingPoints = Math.ceil(totalPoints * (typeof quiz.passingRate === "number" ? quiz.passingRate : 0.8));

// -- Calculate student's score based on correct answers --
const gotScore = quiz.questions.reduce((sum, q, i) => {
  const answeredCorrectly = selectedAnswers[i] === q.correctAnswer;
  return sum + (answeredCorrectly ? (q.points || 1) : 0);
}, 0);

const didPass = gotScore >= passingPoints;

setScore(gotScore);
setSubmitted(true);

alert(
  `You scored ${gotScore}/${totalPoints}. ${didPass ? "You passed!" : "You failed."}`
);


      setTimeout(() => {
        navigate(`/course-content/${courseId}`);
      }, 500);

    } catch (err) {
      alert(
        err?.response?.data?.error ||
        "There was an error submitting your quiz. Please try again."
      );
    }
  };

  

  if (loading) return <div className="loading-overlay"><div className="loading-spinner"></div></div>;
  if (!quiz) return <div className="error-message">Quiz not found.</div>;

  const getBackgroundStyle = () => {
    if (quiz.customBackground) {
      return {
        '--custom-bg-url': `url(${quiz.customBackground})`
      };
    }
    return {};
  };

  const getThemeAttribute = () => {
    if (quiz.customBackground) {
      return "custom";
    }
    return quiz.backgroundTheme || "theme1";
  };

  return (
    <div className="quiz-game-layout">
      <div className="quiz-left-panel">
      <div className="quiz-left-panel-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <h3 style={{ margin: 0 }}>Questions</h3>
  {user?.role === "student" ? (
  <button
    style={{
      marginLeft: 10,
      background: "#fff",
      border: "1px solid #ef4444",
      color: "#ef4444",
      borderRadius: 6,
      padding: "6px 14px",
      fontWeight: 600,
      cursor: "pointer",
      fontSize: 15,
      boxShadow: "0 1px 3px 0 #ef44442a"
    }}
    onClick={() => {
      if (window.confirm("Exiting the quiz may result in a re-do. Are you sure you want to exit?")) {
        navigate(`/course/${courseId}`);
      }
    }}
  >
    Exit Quiz
  </button>
) : (
  <button
    style={{
      marginLeft: 10,
      background: "#fff",
      border: "1px solid #d1d5db",
      color: "#059669",
      borderRadius: 6,
      padding: "6px 14px",
      fontWeight: 600,
      cursor: "pointer",
      fontSize: 15,
      boxShadow: "0 1px 3px 0 #05966916"
    }}
    onClick={() => {
      navigate(`/course/${courseId}`);
    }}
  >
    Go Back
  </button>
)}
</div>

        <div className="quiz-left-panel-content">
          <div className="quiz-left-panel-list">
            {quiz.questions?.map((question, idx) => (
              <div
                className={`quiz-nav-q ${
                  selectedAnswers[idx] !== undefined ? "answered" : ""
                } ${currentQuestion === idx ? "active" : ""}`}
                key={idx}
                onClick={() => goToQuestion(idx)}
                tabIndex={0}
                role="button"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    goToQuestion(idx);
                  }
                }}
              >
                <div className="question-nav-number">{idx + 1}</div>
                <div className="question-nav-content">
                  <div className="question-nav-text">
                    {question.questionText?.substring(0, 40)}
                    {question.questionText?.length > 40 ? "..." : ""}
                  </div>
                  <div className="question-nav-meta">
                    {selectedAnswers[idx] !== undefined ? "Answered" : "Not answered"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="quiz-mid-panel"
        data-theme={getThemeAttribute()}
        style={getBackgroundStyle()}
      >
        <div className="quiz-gamified-main">
          <div className="quiz-title">{quiz.quizTitle}</div>
          <div className="quiz-description">{quiz.description}</div>
          
          {timeLeft !== null && (
            <div className="quiz-timer-bar-wrap">
              <div className="quiz-timer-bar-bg">
                <div
                  className="quiz-timer-bar"
                  style={{
                    width: quiz.quizTime
                      ? `${Math.max(0, (timeLeft / (quiz.quizTime * 60)) * 100)}%`
                      : "100%",
                  }}
                ></div>
              </div>
              <div className={`quiz-timer-label${timeLeft < 30 ? " urgent" : ""}`}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </div>
            </div>
          )}

          {quiz.questions?.map((question, idx) => (
            <div
              key={idx}
              className="quiz-q-card"
              id={`quiz-q-card-${idx}`}
              onMouseEnter={() => setCurrentQuestion(idx)}
            >
              <div className="quiz-q-meta">
                <span className="quiz-q-index">Question {idx + 1}</span>
                <span className="quiz-q-points">{question.points || 1} pt</span>
              </div>
              
              <div className="quiz-q-text">{question.questionText}</div>
              
              {question.imageUrl && (
  <div className="quiz-q-image">
    <img
      src={question.imageUrl}
      alt="Quiz question visual"
      style={{ cursor: "pointer" }}
      onClick={() => setPopupImg(question.imageUrl)}
      onError={(e) => { e.target.style.display = 'none'; }}
      tabIndex={0}
      onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') setPopupImg(question.imageUrl); }}
      aria-label="Click to view larger"
    />
  </div>
)}


              <div className="quiz-q-options">
                {question.options?.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`quiz-q-option${
                      selectedAnswers[idx] === optionIndex ? " selected" : ""
                    }${submitted ? " disabled" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={optionIndex}
                      checked={selectedAnswers[idx] === optionIndex}
                      disabled={submitted}
                      onChange={() => handleAnswer(idx, optionIndex)}
                    />
                    <span className="quiz-q-option-label">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="quiz-q-option-text">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* --- Submit Button --- */}
          {!submitted && isStudent && quiz.questions?.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button 
                className="quiz-submit-btn" 
                onClick={handleSubmit}
                style={{
                  padding: '16px 32px',
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                Submit Quiz
              </button>
            </div>
          )}

          {/* --- Block for non-students --- */}
          {!isStudent && (
            <div
              style={{
                marginTop: 32,
                textAlign: 'center',
                color: "#b91c1c",
                fontWeight: 700,
                background: "#ffe6e6",
                borderRadius: 10,
                padding: 16,
                border: "1.5px solid #ffb3b3"
              }}>
              Only students can submit quizzes. (You are logged in as <b>{user?.role}</b>)
            </div>
          )}

          {/* --- Result Feedback after submit --- */}
          {submitted && isStudent && (
           <div 
           className="quiz-submit-message"
           style={{
             textAlign: 'center',
             padding: '24px',
             marginTop: 30,
             background: "#ecfdf5",
             color: score >= Math.ceil(quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0) * (quiz.passingRate || 0.8))
               ? "#059669"
               : "#b45309",
             borderRadius: 12,
             fontWeight: 700,
             fontSize: 20,
             border: "1.5px solid #d1fae5"
           }}
         >
           You got {score} out of {quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0)} points.<br />
           {score >= Math.ceil(quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0) * (quiz.passingRate || 0.8))
             ? <><b>You passed!</b></>
             : <><b>Try again next time!</b></>}
         </div>
         
          )}
        </div>
      </div>

      <div className="quiz-right-panel"></div>
      
{/* --- IMAGE POPUP MODAL --- */}
{popupImg && (
  <div
    className="quiz-image-popup-overlay"
    onClick={() => setPopupImg(null)}
    tabIndex={0}
    aria-label="Close image preview"
    style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <img
      src={popupImg}
      alt="Full screen quiz question"
      className="quiz-image-popup"
      style={{
        maxWidth: "90vw",
        maxHeight: "85vh",
        borderRadius: 16,
        boxShadow: "0 8px 40px #0008",
        background: "#fff"
      }}
      onClick={e => e.stopPropagation()}
    />
    <button
      style={{
        position: "fixed",
        top: 32,
        right: 44,
        background: "rgba(0,0,0,0.6)",
        color: "white",
        border: "none",
        fontSize: 32,
        cursor: "pointer",
        borderRadius: 8,
        padding: "6px 18px"
      }}
      onClick={() => setPopupImg(null)}
      aria-label="Close"
    >×</button>
  </div>
)}

</div>
);
};

export default QuizPage;
