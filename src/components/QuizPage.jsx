import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/QuizPage.css";

const QuizPage = () => {
    const { courseId, quizId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
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
            .catch((err) => {
                console.error("Failed to load quiz", err);
                setLoading(false);
            });
    }, [quizId]);

    const handleAnswer = (questionIndex, optionIndex) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionIndex]: optionIndex,
        }));
    };

    const handleSubmit = () => {
        if (!quiz || !quiz.questions) return;

        let correct = 0;

        quiz.questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctAnswer) {
                correct++;
            }
        });

        const total = quiz.questions.length;
        const score = correct;
        const passed = score >= Math.ceil(total * 0.5);

        alert(`You scored ${score}/${total}. ${passed ? "You passed!" : "You failed."}`);
        setSubmitted(true);

        // Redirect back to quiz list
        setTimeout(() => {
            navigate(`/course-content/${courseId}`);
        }, 100); // small delay for alert to finish
    };

    if (loading) return <div>Loading quiz...</div>;
    if (!quiz) return <div>Quiz not found.</div>;

    return (
        <div className="quiz-container">
            <h2 className="quiz-title">{quiz.quizTitle}</h2>
            <p className="quiz-description">{quiz.description}</p>

            {quiz.questions?.map((q, idx) => (
                <div key={idx} className="question-card">
                    <div className="question-header">
                        <div className="question-meta">
                            <div className="question-label">Question {idx + 1}</div>
                            <div className="question-points">{quiz.quizGrade || 5} points</div>
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
                                    disabled={submitted}
                                />
                                <div className="option-text">
                                    {String.fromCharCode(97 + i)}. {opt}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            {!submitted && (
                <button className="submit-btn" onClick={handleSubmit}>
                    Submit Quiz
                </button>
            )}
        </div>
    );
};

export default QuizPage;
