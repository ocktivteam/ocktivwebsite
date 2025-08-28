import { Quiz } from "../models/Quiz.js";
import mongoose from "mongoose";

// === CREATE QUIZ ===
export const createQuiz = async (req, res) => {
  try {
    const {
      quizTitle,
      description,
      courseId,
      userId,
      quizType,
      questions,
      attemptsAllowed,
      dueDate,
      quizGrade,
      quizTime,
      isPublished,
      isGradedAutomatically,
      passingRate,
      backgroundTheme,
      customBackground
    } = req.body;

    // Validation
    if (!quizTitle || !description || !courseId || !userId) {
      return res.status(400).json({
        error: "Missing required fields: quizTitle, description, courseId, userId"
      });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        error: "At least one question is required"
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Invalid courseId" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.questionText || !question.questionText.trim()) {
        return res.status(400).json({
          error: `Question ${i + 1} is missing question text`
        });
      }

      if (question.type === 'Mcq') {
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({
            error: `Question ${i + 1} must have at least 2 options`
          });
        }

        if (question.options.some(opt => !opt || !opt.trim())) {
          return res.status(400).json({
            error: `Question ${i + 1} has empty options`
          });
        }

        if (question.correctAnswer === undefined || question.correctAnswer === null) {
          return res.status(400).json({
            error: `Question ${i + 1} is missing correct answer`
          });
        }

        if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          return res.status(400).json({
            error: `Question ${i + 1} has invalid correct answer index`
          });
        }
      }
    }

    const newQuiz = new Quiz({
      quizTitle: quizTitle.trim(),
      description: description.trim(),
      courseId: new mongoose.Types.ObjectId(courseId),
      userId: new mongoose.Types.ObjectId(userId),
      quizType: quizType || 'Mcq',
      questions: questions.map(q => ({
        questionText: q.questionText.trim(),
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        type: q.type || 'Mcq',
        imageUrl: q.imageUrl || '',
        points: typeof q.points === "number" ? q.points : 1
      })),
      attemptsAllowed: attemptsAllowed || 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      quizGrade: quizGrade || 1,
      quizTime: quizTime || null,
      isPublished: isPublished !== undefined ? isPublished : true,
      isGradedAutomatically: isGradedAutomatically !== undefined ? isGradedAutomatically : true,
      passingRate: passingRate || 0.8,
      backgroundTheme: backgroundTheme || 'theme1',
      customBackground: customBackground || ''
    });

    const savedQuiz = await newQuiz.save();

    res.status(201).json({
      message: "Quiz created successfully",
      quiz: savedQuiz
    });

  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};

// === UPDATE QUIZ ===
export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        quiz[key] = updateData[key];
      }
    });

    // Handle date fields
    if (updateData.dueDate) {
      quiz.dueDate = new Date(updateData.dueDate);
    }

    const updatedQuiz = await quiz.save();

    res.json({
      message: "Quiz updated successfully",
      quiz: updatedQuiz
    });

  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};

// === DELETE QUIZ ===
export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
    if (!deletedQuiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json({
      message: "Quiz deleted successfully",
      quiz: deletedQuiz
    });

  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};

// === UPDATE QUIZ QUESTION ===
export const updateQuizQuestion = async (req, res) => {
  try {
    const { quizId, questionIndex } = req.params;
    const questionData = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const index = parseInt(questionIndex);
    if (isNaN(index) || index < 0 || index >= quiz.questions.length) {
      return res.status(400).json({ error: "Invalid question index" });
    }

    // Update question
    quiz.questions[index] = {
      ...quiz.questions[index],
      ...questionData
    };

    const updatedQuiz = await quiz.save();

    res.json({
      message: "Question updated successfully",
      quiz: updatedQuiz
    });

  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};

// === DELETE QUIZ QUESTION ===
export const deleteQuizQuestion = async (req, res) => {
  try {
    const { quizId, questionIndex } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const index = parseInt(questionIndex);
    if (isNaN(index) || index < 0 || index >= quiz.questions.length) {
      return res.status(400).json({ error: "Invalid question index" });
    }

    if (quiz.questions.length <= 1) {
      return res.status(400).json({ error: "Cannot delete the last question" });
    }

    // Remove question
    quiz.questions.splice(index, 1);

    const updatedQuiz = await quiz.save();

    res.json({
      message: "Question deleted successfully",
      quiz: updatedQuiz
    });

  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};

// === GET QUIZZES BY COURSE ===
export const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }

    const quizzes = await Quiz.find({
      courseId: new mongoose.Types.ObjectId(courseId),
      isPublished: true
    })
    .select('-studentAttempts -quizDrafts') // Exclude attempts for performance
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

    res.json(quizzes);

  } catch (error) {
    console.error("Get quizzes by course error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};

// === GET QUIZ BY ID ===
export const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const quiz = await Quiz.findById(quizId)
      .populate('userId', 'name email')
      .populate('courseId', 'courseTitle');

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(quiz);

  } catch (error) {
    console.error("Get quiz by ID error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};

// === SUBMIT QUIZ ATTEMPT ===
export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { studentId, submittedAnswers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Check attempts limit
    if (quiz.attemptsAllowed > 0) {
      const existingAttempts = quiz.studentAttempts.filter(
        attempt => attempt.studentId.toString() === studentId
      );
      
      if (existingAttempts.length >= quiz.attemptsAllowed) {
        return res.status(400).json({
          error: `Maximum attempts (${quiz.attemptsAllowed}) exceeded`
        });
      }
    }

    // Calculate score if auto-graded
    let score = 0;
    if (quiz.isGradedAutomatically) {
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        const userAnswer = submittedAnswers[i];
        
        if (question.type === 'Mcq') {
          if (userAnswer === question.correctAnswer) {
            score += typeof question.points === 'number' ? question.points : 1;
          }
        }        
        // Add logic for other question types here if needed
      }
    }

    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const passed = score >= Math.ceil(totalPoints * (quiz.passingRate || 0.8)); 

    // Create attempt record
    const attempt = {
      studentId: new mongoose.Types.ObjectId(studentId),
      submittedAnswers,
      score,
      submittedAt: new Date()
    };

    quiz.studentAttempts.push(attempt);
    await quiz.save();

    res.json({
      message: "Quiz submitted successfully",
      attempt: {
        score,
        totalQuestions: quiz.questions.length,
        totalPoints,                    // <--- put code here Aug 6
        percentage: ((score / totalPoints) * 100).toFixed(2), // <--- put code here Aug 6
        passed                         // <--- put code here Aug 6
      }
    });

  } catch (error) {
    console.error("Submit quiz attempt error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};

// === SAVE QUIZ DRAFT ===
export const saveQuizDraft = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { studentId, answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Find existing draft or create new one
    const existingDraftIndex = quiz.quizDrafts.findIndex(
      draft => draft.studentId.toString() === studentId
    );

    const draftData = {
      studentId: new mongoose.Types.ObjectId(studentId),
      answers,
      updatedAt: new Date()
    };

    if (existingDraftIndex > -1) {
      quiz.quizDrafts[existingDraftIndex] = draftData;
    } else {
      quiz.quizDrafts.push(draftData);
    }

    await quiz.save();

    res.json({
      message: "Draft saved successfully",
      draft: draftData
    });

  } catch (error) {
    console.error("Save quiz draft error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};

// === GET QUIZ DRAFT ===
export const getQuizDraft = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const draft = quiz.quizDrafts.find(
      draft => draft.studentId.toString() === studentId
    );

    if (!draft) {
      return res.status(404).json({ error: "Draft not found" });
    }

    res.json(draft);

  } catch (error) {
    console.error("Get quiz draft error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};

// === DELETE QUIZ DRAFT ===
export const deleteQuizDraft = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const draftIndex = quiz.quizDrafts.findIndex(
      draft => draft.studentId.toString() === studentId
    );

    if (draftIndex === -1) {
      return res.status(404).json({ error: "Draft not found" });
    }

    quiz.quizDrafts.splice(draftIndex, 1);
    await quiz.save();

    res.json({
      message: "Draft deleted successfully"
    });

  } catch (error) {
    console.error("Delete quiz draft error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};