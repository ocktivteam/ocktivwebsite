import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completed: { type: Boolean, default: false },
    certificateIssued: { type: Boolean, default: false },
    certificateId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate', default: null }
  }, { timestamps: true });
  
  const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
  export { Enrollment };