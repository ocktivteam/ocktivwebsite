import mongoose from "mongoose";
const { Schema } = mongoose;

const QuestionSchema = new Schema({
  questionText: { type: String, required: true },
  options: [String],
  correctAnswer: Schema.Types.Mixed,
  type: { type: String, enum: ['Mcq', 'matching', 'fillInTheBlanks', 'enumeration', 'trueOrFalse', 'longAnswer'], required: true },
  imageUrl: { type: String, default: "" },
  points: { type: Number, default: 1 }
});


const StudentAttemptSchema = new Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAnswers: [Schema.Types.Mixed],
  score: Number,
  submittedAt: { type: Date, default: Date.now }
});

// === DRAFT SCHEMA ===
const QuizDraftSchema = new Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [Schema.Types.Mixed],
  updatedAt: { type: Date, default: Date.now }
});
// ====================

const QuizSchema = new Schema({
  quizTitle: { type: String, required: true },
  description: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Instructor ID
  quizType: {
    type: String,
    enum: ['Mcq', 'matching', 'fillInTheBlanks', 'enumeration', 'trueOrFalse', 'longAnswer'],
    required: true
  },
  questions: [QuestionSchema],
  attemptsAllowed: { type: Number, default: 0 },
  dueDate: Date,
  quizGrade: Number,
  quizTime: Number, // In minutes or seconds
  studentAttempts: [StudentAttemptSchema],
  // === DRAFT FIELD ===
  quizDrafts: [QuizDraftSchema],
  // ====================
  isPublished: { type: Boolean, default: true },
  isGradedAutomatically: { type: Boolean, default: true },
  passingRate: { type: Number, default: 0.8 },
  backgroundTheme: { type: String, default: "theme1" },
  customBackground: { type: String, default: "" },   
}, { timestamps: true });

export const Quiz = mongoose.model("Quiz", QuizSchema);
