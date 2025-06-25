import mongoose from "mongoose";

const moduleProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: true,
  },
  lastWatchedTime: {
    type: Number, // seconds
    default: 0,
    min: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["not_started", "ongoing", "completed"],
    default: "not_started",
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
});

moduleProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true }); // one progress record per user per module

export const ModuleProgress = mongoose.model("ModuleProgress", moduleProgressSchema);
