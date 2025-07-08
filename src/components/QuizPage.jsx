import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/QuizPage.css";

// --- UTILITY: Get current logged-in user ---
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

  // Store as array, not object: e.g. [0, 2, 1]
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [passed, setPassed] = useState(false);
  const [canAttempt, setCanAttempt] = useState(true); // Block if passed
  const [draftLoading, setDraftLoading] = useState(true);

  const navigate = useNavigate();

  // --- Get current user/studentId
  const user = getCurrentUser();
  const isInstructor = user?.role !== "student";
  const studentId = user?._id;

  // --- Load quiz and attempts info
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_ROOT}/api/quiz/${quizId}`)
      .then((res) => {
        setQuiz(res.data);
        setLoading(false);

        // Find if already passed for this user
        let alreadyPassed = false;
        let studentAttempts = [];
        // Use per-quiz passing rate, or default to 0.8 (80%)
        const rate = typeof res.data.passingRate === "number" ? res.data.passingRate : 0.8;
        if (res.data.studentAttempts && studentId) {
          studentAttempts = res.data.studentAttempts.filter(
            (a) =>
              (a.studentId === studentId ||
                (a.studentId && a.studentId._id === studentId)) &&
              typeof a.score === "number"
          );
          const questionsCount = res.data.questions?.length || 1;
          const minToPass = Math.ceil(questionsCount * rate);
          alreadyPassed = studentAttempts.some(
            (att) => att.score >= minToPass
          );
          setPassed(alreadyPassed);
          setCanAttempt(!alreadyPassed);
        }
        // If can't attempt, clear draft
        if (alreadyPassed) {
          setSubmitted(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load quiz", err);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [quizId, studentId]);

  // --- Fetch quiz draft (on mount, after quiz loaded)
  useEffect(() => {
    if (!quiz || !studentId) return;
    setDraftLoading(true);
    axios
      .get(`${API_ROOT}/api/quiz/${quizId}/draft/${studentId}`)
      .then((res) => {
        if (res.data.draft && Array.isArray(res.data.draft.answers)) {
          setSelectedAnswers(res.data.draft.answers);
        } else {
          setSelectedAnswers([]);
        }
        setDraftLoading(false);
      })
      .catch((err) => {
        setSelectedAnswers([]);
        setDraftLoading(false);
      });
    // eslint-disable-next-line
  }, [quiz, studentId]);

  // --- Auto-save draft on answer change ---
  useEffect(() => {
    if (!quiz || !studentId || draftLoading || submitted || !canAttempt) return;
    axios
      .post(`${API_ROOT}/api/quiz/${quizId}/draft`, {
        studentId,
        answers: selectedAnswers,
      })
      .catch((err) => {
        // Silent fail
      });
    // eslint-disable-next-line
  }, [selectedAnswers, quizId, studentId, quiz, draftLoading, submitted, canAttempt]);

  // --- Handle answer select ---
  const handleAnswer = useCallback(
    (questionIndex, optionIndex) => {
      if (submitted || !canAttempt) return;
      setSelectedAnswers((prev) => {
        const next = [...prev];
        next[questionIndex] = optionIndex;
        return next;
      });
    },
    [submitted, canAttempt]
  );

  // --- Submit quiz ---
  const handleSubmit = async () => {
    if (!quiz || !quiz.questions || !studentId) return;

    try {
      const res = await axios.post(
        `${API_ROOT}/api/quiz/${quizId}/submit`,
        {
          studentId,
          submittedAnswers: selectedAnswers,
        }
      );

      // Remove draft after submission
      await axios.delete(
        `${API_ROOT}/api/quiz/${quizId}/draft/${studentId}`
      );

      // Grading logic
      const rate = typeof quiz.passingRate === "number" ? quiz.passingRate : 0.8;
      const questionsCount = quiz.questions.length;
      const minToPass = Math.ceil(questionsCount * rate);
      const gotScore =
        typeof res.data.score === "number"
          ? res.data.score
          : null;
      const didPass = gotScore !== null && gotScore >= minToPass;

      setScore(gotScore);
      setPassed(didPass);
      setSubmitted(true);

      // If passed, block future attempts.
      if (didPass) {
        setCanAttempt(false);
      }

      alert(
        gotScore !== null
          ? `You scored ${gotScore}/${questionsCount}. ${didPass ? "You passed!" : "You failed."}`
          : "Quiz submitted."
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

  if (loading || draftLoading) return <div>Loading quiz...</div>;
  if (!quiz) return <div>Quiz not found.</div>;

  // Disable form if passed or can't attempt
  //const isDisabled = submitted || !canAttempt;
  const isDisabled = submitted || !canAttempt || isInstructor;

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">{quiz.quizTitle}</h2>
      <p className="quiz-description">{quiz.description}</p>

      {isDisabled && !isInstructor && (
        <div
          style={{
            background: "#f3f3f3",
            border: "1px solid #ccc",
            color: "#888",
            padding: 16,
            borderRadius: 8,
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          {passed
            ? "You have already passed this quiz! You cannot attempt again."
            : "You cannot attempt this quiz right now."}
        </div>
      )}

      {quiz.questions?.map((q, idx) => (
        <div key={idx} className="question-card">
          <div className="question-header">
            <div className="question-meta">
              <div className="question-label">Question {idx + 1}</div>
              <div className="question-points">{quiz.quizGrade || 1} point</div>
            </div>
            <div className="question-text">{q.questionText}</div>
          </div>

          <div className="options">
            <div className="options-label">Answer options:</div>
            {q.options.map((opt, i) => (
              <label key={i} className="option" htmlFor={`q${idx}-opt${i}`}>
                <input
                  type="radio"
                  id={`q${idx}-opt${i}`}
                  name={`question-${idx}`}
                  value={i}
                  onChange={() => handleAnswer(idx, i)}
                  checked={selectedAnswers[idx] === i}
                  disabled={isDisabled}
                />
                <div className="option-text">
                  {String.fromCharCode(97 + i)}. {opt}
                </div>
              </label>
            ))}
          </div>
          {isInstructor && (
            <div style={{ padding: "10px 20px", fontStyle: "italic", color: "#444" }}>
              <strong>Correct answer:</strong> {q.options[q.correctAnswer]}
            </div>
          )}
        </div>
      ))}
      {!isInstructor ? (
        !isDisabled && (
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={selectedAnswers.length !== quiz.questions.length || selectedAnswers.includes(undefined)}
          >
            Submit Quiz
          </button>
        )
      ) : (
        <button
          className="submit-btn"
          onClick={() => navigate(`/course-content/${courseId}`)}
        >
          Go Back to Quiz List
        </button>
      )}
    </div>
  );
};

export default QuizPage;
