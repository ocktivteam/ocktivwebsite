// import express from "express";
// import {
//   createQuiz,
//   getQuizzesByCourse,
//   getQuizById,
//   submitQuizAttempt,
//   saveQuizDraft,
//   getQuizDraft,
//   deleteQuizDraft,
// } from "../controllers/quizController.js";

// const router = express.Router();

// router.post("/", createQuiz);

// // Student routes
// router.get("/course/:courseId", getQuizzesByCourse);
// router.get("/:quizId", getQuizById);
// router.post("/:quizId/submit", submitQuizAttempt);

// // === DRAFT ROUTES ===
// router.post("/:quizId/draft", saveQuizDraft);
// router.get("/:quizId/draft/:studentId", getQuizDraft);
// router.delete("/:quizId/draft/:studentId", deleteQuizDraft);

// export default router;



// ==== new ====

import express from "express";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  updateQuizQuestion,
  deleteQuizQuestion,
  getQuizzesByCourse,
  getQuizById,
  submitQuizAttempt,
  saveQuizDraft,
  getQuizDraft,
  deleteQuizDraft,
} from "../controllers/quizController.js";

const router = express.Router();

// Quiz CRUD operations
router.post("/", createQuiz);                    // Create quiz
router.put("/:quizId", updateQuiz);             // Update entire quiz
router.delete("/:quizId", deleteQuiz);          // Delete quiz

// Question-specific operations
router.put("/:quizId/question/:questionIndex", updateQuizQuestion);     // Update specific question
router.delete("/:quizId/question/:questionIndex", deleteQuizQuestion);  // Delete specific question

// Student routes
router.get("/course/:courseId", getQuizzesByCourse);
router.get("/:quizId", getQuizById);
router.post("/:quizId/submit", submitQuizAttempt);

// === DRAFT ROUTES ===
router.post("/:quizId/draft", saveQuizDraft);
router.get("/:quizId/draft/:studentId", getQuizDraft);
router.delete("/:quizId/draft/:studentId", deleteQuizDraft);

export default router;