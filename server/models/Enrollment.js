const enrollmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    videoProgress: [{ videoId: String, watched: Boolean }], // optional: track % watched
    quizScore: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }, // set true if all videos + passing quiz
    certificateIssued: { type: Boolean, default: false },
    certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate', default: null }
  }, { timestamps: true });
  
  const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
  