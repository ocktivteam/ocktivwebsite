import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "pdf", "doc", "docx", "zip", "rar", "7zip",
      "text", "image", "video", "pptx", "xlsx", "external"
    ],
    required: true,
  },
  name: { type: String, required: true },
  url: { type: String, required: true },
  key: { type: String }, //NEW field (optional)
  source: {
    type: String,
    enum: ["upload", "youtube", "external"],
    default: "upload",
  }
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
