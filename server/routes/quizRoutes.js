import express from "express";
import {
  createQuiz,
  getQuizzesByCourse,
  getQuizById,
  submitQuizAttempt,
} from "../controllers/quizController.js";

const router = express.Router();

router.post("/", createQuiz);

// Student routes
router.get("/course/:courseId", getQuizzesByCourse);
router.get("/:quizId", getQuizById);
router.post("/:quizId/submit", submitQuizAttempt);

export default router;
