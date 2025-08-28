import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issuedDate: { type: Date, default: Date.now, immutable: true },
  certificateUrl: String,
  certId: { type: String, required: true, unique: true } // <-- UUID string
}, { timestamps: true });

certificateSchema.index({ user: 1, course: 1 }, { unique: true });

const Certificate = mongoose.model("Certificate", certificateSchema);
export { Certificate };

