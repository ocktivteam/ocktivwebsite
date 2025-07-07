import express from "express";
import {
  createQuiz,
  getQuizzesByCourse,
  getQuizById,
  submitQuizAttempt,
  saveQuizDraft,
  getQuizDraft,
  deleteQuizDraft,
} from "../controllers/quizController.js";

const router = express.Router();

router.post("/", createQuiz);

// Student routes
router.get("/course/:courseId", getQuizzesByCourse);
router.get("/:quizId", getQuizById);
router.post("/:quizId/submit", submitQuizAttempt);

// === DRAFT ROUTES ===
router.post("/:quizId/draft", saveQuizDraft);
router.get("/:quizId/draft/:studentId", getQuizDraft);
router.delete("/:quizId/draft/:studentId", deleteQuizDraft);

export default router;
