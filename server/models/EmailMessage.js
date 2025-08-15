// models/EmailMessage.js
import mongoose from "mongoose";

const attachmentLiteSchema = new mongoose.Schema({
  filename: String,
  mimeType: String,
  size: Number
}, { _id: false });

const emailMessageSchema = new mongoose.Schema({
  senderId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  instructorId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId:      { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  subject:       { type: String, required: true },
  message:       { type: String, required: true },
  attachments:   [attachmentLiteSchema],
  sentAt:        { type: Date, default: Date.now },
}, { timestamps: true });

export const EmailMessage = mongoose.model("EmailMessage", emailMessageSchema);