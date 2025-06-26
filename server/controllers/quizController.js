import { Quiz } from "../models/Quiz.js";
import mongoose from "mongoose";

// GET /api/quiz/course/:courseId
export const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ courseId, isPublished: true })
      .select("quizTitle description dueDate quizGrade quizTime")
      .sort({ dueDate: 1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quizzes." });
  }
};

// GET /api/quiz/:quizId
export const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).select("quizTitle description questions quizTime quizType");
    if (!quiz) return res.status(404).json({ error: "Quiz not found." });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quiz." });
  }
};

// POST /api/quiz/:quizId/submit
export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { studentId, submittedAnswers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found." });

    // Limit attempts
    const previousAttempts = quiz.studentAttempts.filter(a =>
      a.studentId.toString() === studentId
    );
    if (previousAttempts.length >= quiz.attemptsAllowed) {
      return res.status(403).json({ error: "No more attempts allowed." });
    }

    // Auto-grading only for MCQ / T/F / simple types
    let score = 0;
    if (quiz.isGradedAutomatically) {
      quiz.questions.forEach((q, i) => {
        if (
          submittedAnswers[i] !== undefined &&
          JSON.stringify(submittedAnswers[i]) === JSON.stringify(q.correctAnswer)
        ) {
          score += 1;
        }
      });
    }

    // Store the attempt
    quiz.studentAttempts.push({
      studentId,
      submittedAnswers,
      score,
    });
    await quiz.save();

    res.json({ message: "Quiz submitted successfully.", score });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit quiz." });
  }
};
