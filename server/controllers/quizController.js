// import { Quiz } from "../models/Quiz.js";
// import mongoose from "mongoose";

// // === CREATE QUIZ ===
// export const createQuiz = async (req, res) => {
//   try {
//     const quiz = new Quiz(req.body);
//     await quiz.save();
//     res.status(201).json({ message: "Quiz created", quiz });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // GET /api/quiz/course/:courseId
// export const getQuizzesByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const quizzes = await Quiz.find({ courseId, isPublished: true })
//       .select("quizTitle description dueDate quizGrade quizTime questions passingRate") // add passingRate here!
//       .sort({ dueDate: 1 });
//     res.json(quizzes);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch quizzes." });
//   }
// };

// // GET /api/quiz/:quizId
// export const getQuizById = async (req, res) => {
//   try {
//     const { quizId } = req.params;
//     const quiz = await Quiz.findById(quizId).select(
//       "quizTitle description questions quizTime quizType quizDrafts studentAttempts attemptsAllowed isGradedAutomatically isPublished passingRate"
//     );
//     if (!quiz) return res.status(404).json({ error: "Quiz not found." });
//     res.json(quiz);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch quiz." });
//   }
// };

// // POST /api/quiz/:quizId/submit
// export const submitQuizAttempt = async (req, res) => {
//   try {
//     const { quizId } = req.params;
//     const { studentId, submittedAnswers } = req.body;

//     const quiz = await Quiz.findById(quizId);
//     if (!quiz) return res.status(404).json({ error: "Quiz not found." });

//     const previousAttempts = quiz.studentAttempts.filter(a =>
//       a.studentId.toString() === studentId
//     );

//     // -------- PASSING RATE LOGIC --------
//     const passingRate = typeof quiz.passingRate === "number" ? quiz.passingRate : 0.8;
//     const numQuestions = quiz.questions?.length || 1;
//     const passingScore = Math.ceil(numQuestions * passingRate);
//     const alreadyPassed = previousAttempts.some(a => a.score >= passingScore);
//     // ------------------------------------

//     if (alreadyPassed) {
//       return res.status(403).json({ error: "Quiz already passed." });
//     }
//     if (
//       quiz.attemptsAllowed &&
//       quiz.attemptsAllowed > 0 &&
//       previousAttempts.length >= quiz.attemptsAllowed
//     ) {
//       return res.status(403).json({ error: "No more attempts allowed." });
//     }

//     // Auto-grading only for MCQ / T/F / simple types
//     let score = 0;
//     if (quiz.isGradedAutomatically) {
//       quiz.questions.forEach((q, i) => {
//         if (
//           submittedAnswers[i] !== undefined &&
//           JSON.stringify(submittedAnswers[i]) === JSON.stringify(q.correctAnswer)
//         ) {
//           score += 1;
//         }
//       });
//     }

//     // Store the attempt
//     quiz.studentAttempts.push({
//       studentId,
//       submittedAnswers,
//       score,
//     });

//     // === REMOVE DRAFT ON SUBMISSION ===
//     quiz.quizDrafts = quiz.quizDrafts.filter(d => d.studentId.toString() !== studentId);

//     await quiz.save();

//     res.json({ message: "Quiz submitted successfully.", score });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to submit quiz." });
//   }
// };

// // === DRAFT ENDPOINTS ===

// // POST /api/quiz/:quizId/draft
// export const saveQuizDraft = async (req, res) => {
//   const { quizId } = req.params;
//   const { studentId, answers } = req.body;
//   try {
//     const quiz = await Quiz.findById(quizId);
//     if (!quiz) return res.status(404).json({ error: "Quiz not found." });

//     // Remove previous draft for this student
//     quiz.quizDrafts = quiz.quizDrafts.filter(d => d.studentId.toString() !== studentId);
//     // Add new draft
//     quiz.quizDrafts.push({ studentId, answers, updatedAt: new Date() });
//     await quiz.save();

//     res.json({ message: "Draft saved." });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to save draft." });
//   }
// };

// // GET /api/quiz/:quizId/draft/:studentId
// export const getQuizDraft = async (req, res) => {
//   const { quizId, studentId } = req.params;
//   try {
//     const quiz = await Quiz.findById(quizId);
//     if (!quiz) return res.status(404).json({ error: "Quiz not found." });
//     const draft = quiz.quizDrafts.find(d => d.studentId.toString() === studentId);
//     if (!draft) return res.json({ draft: null });
//     res.json({ draft });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to get draft." });
//   }
// };

// // DELETE /api/quiz/:quizId/draft/:studentId
// export const deleteQuizDraft = async (req, res) => {
//   const { quizId, studentId } = req.params;
//   try {
//     const quiz = await Quiz.findById(quizId);
//     if (!quiz) return res.status(404).json({ error: "Quiz not found." });
//     quiz.quizDrafts = quiz.quizDrafts.filter(d => d.studentId.toString() !== studentId);
//     await quiz.save();
//     res.json({ message: "Draft deleted." });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to delete draft." });
//   }
// };


// ==== new ====

import { Quiz } from "../models/Quiz.js";
import mongoose from "mongoose";

// === CREATE QUIZ ===
export const createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json({ message: "Quiz created", quiz });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// === UPDATE QUIZ (PUT) ===
export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const updateData = req.body;
    
    // Find and update the quiz
    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }
    
    res.json({ message: "Quiz updated successfully", quiz });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// === DELETE QUIZ ===
export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findByIdAndDelete(quizId);
    
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }
    
    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete quiz." });
  }
};

// === UPDATE SPECIFIC QUESTION IN QUIZ ===
export const updateQuizQuestion = async (req, res) => {
  try {
    const { quizId, questionIndex } = req.params;
    const questionData = req.body;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }
    
    const qIndex = parseInt(questionIndex);
    if (qIndex < 0 || qIndex >= quiz.questions.length) {
      return res.status(400).json({ error: "Invalid question index." });
    }
    
    // Update the specific question properties
    Object.keys(questionData).forEach(key => {
      quiz.questions[qIndex][key] = questionData[key];
    });
    
    // Mark the questions array as modified for Mongoose
    quiz.markModified('questions');
    await quiz.save();
    
    res.json({ message: "Question updated successfully", quiz });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// === DELETE SPECIFIC QUESTION FROM QUIZ ===
export const deleteQuizQuestion = async (req, res) => {
  try {
    const { quizId, questionIndex } = req.params;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }
    
    const qIndex = parseInt(questionIndex);
    if (qIndex < 0 || qIndex >= quiz.questions.length) {
      return res.status(400).json({ error: "Invalid question index." });
    }
    
    // Remove the question at the specified index
    quiz.questions.splice(qIndex, 1);
    await quiz.save();
    
    res.json({ message: "Question deleted successfully", quiz });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete question." });
  }
};

// GET /api/quiz/course/:courseId
export const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ courseId, isPublished: true })
      .select("quizTitle description dueDate quizGrade quizTime questions passingRate")
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
    const quiz = await Quiz.findById(quizId).select(
      "quizTitle description questions quizTime quizType quizDrafts studentAttempts attemptsAllowed isGradedAutomatically isPublished passingRate"
    );
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

    const previousAttempts = quiz.studentAttempts.filter(a =>
      a.studentId.toString() === studentId
    );

    // -------- PASSING RATE LOGIC --------
    const passingRate = typeof quiz.passingRate === "number" ? quiz.passingRate : 0.8;
    const numQuestions = quiz.questions?.length || 1;
    const passingScore = Math.ceil(numQuestions * passingRate);
    const alreadyPassed = previousAttempts.some(a => a.score >= passingScore);
    // ------------------------------------

    if (alreadyPassed) {
      return res.status(403).json({ error: "Quiz already passed." });
    }
    if (
      quiz.attemptsAllowed &&
      quiz.attemptsAllowed > 0 &&
      previousAttempts.length >= quiz.attemptsAllowed
    ) {
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

    // === REMOVE DRAFT ON SUBMISSION ===
    quiz.quizDrafts = quiz.quizDrafts.filter(d => d.studentId.toString() !== studentId);

    await quiz.save();

    res.json({ message: "Quiz submitted successfully.", score });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit quiz." });
  }
};

// === DRAFT ENDPOINTS ===

// POST /api/quiz/:quizId/draft
export const saveQuizDraft = async (req, res) => {
  const { quizId } = req.params;
  const { studentId, answers } = req.body;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found." });

    // Remove previous draft for this student
    quiz.quizDrafts = quiz.quizDrafts.filter(d => d.studentId.toString() !== studentId);
    // Add new draft
    quiz.quizDrafts.push({ studentId, answers, updatedAt: new Date() });
    await quiz.save();

    res.json({ message: "Draft saved." });
  } catch (err) {
    res.status(500).json({ error: "Failed to save draft." });
  }
};

// GET /api/quiz/:quizId/draft/:studentId
export const getQuizDraft = async (req, res) => {
  const { quizId, studentId } = req.params;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found." });
    const draft = quiz.quizDrafts.find(d => d.studentId.toString() === studentId);
    if (!draft) return res.json({ draft: null });
    res.json({ draft });
  } catch (err) {
    res.status(500).json({ error: "Failed to get draft." });
  }
};

// DELETE /api/quiz/:quizId/draft/:studentId
export const deleteQuizDraft = async (req, res) => {
  const { quizId, studentId } = req.params;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found." });
    quiz.quizDrafts = quiz.quizDrafts.filter(d => d.studentId.toString() !== studentId);
    await quiz.save();
    res.json({ message: "Draft deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete draft." });
  }
};