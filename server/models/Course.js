import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  courseTitle: { type: String, required: true },
  description: { type: String },
  courseType: {
    type: String,
    enum: ['Short', 'Long'],
    default: 'Short',
  },
  semester: { type: String, default: null },
  price: { type: Number, default: 0 },
  duration: { type: String },
  syllabus: [{
    title: { type: String, required: true },
    lessons: { type: Number, required: true },
    duration: { type: String, required: true }
  }],
  certDesc: { type: String },
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // MULTIPLE INSTRUCTORS
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
  discussions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' }],
  imageUrl: { type: String, default: "/img/ocktivLogo.png" },
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);
export { Course };
