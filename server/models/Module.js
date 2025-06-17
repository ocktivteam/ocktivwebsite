import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "pdf", "doc", "text"],
    required: true,
  },
  name: { type: String, required: true },
  url: { type: String, required: true },
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  moduleTitle: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  files: {
    type: [fileSchema],
    default: [],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // should be instructor
    required: true,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
});

export const Module = mongoose.model("Module", moduleSchema);
