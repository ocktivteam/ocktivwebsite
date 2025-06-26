import express from "express";
import {
  getQuizzesByCourse,
  getQuizById,
  submitQuizAttempt,
} from "../controllers/quizController.js";

const router = express.Router();

// Student routes
router.get("/course/:courseId", getQuizzesByCourse);
router.get("/:quizId", getQuizById);
router.post("/:quizId/submit", submitQuizAttempt);

export default router;
