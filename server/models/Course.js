const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videos: [
      {
        title: String,
        url: String,
        duration: Number, // in seconds
      }
    ],
    quizzes: [
      {
        question: String,
        options: [String],
        correctAnswerIndex: Number,
      }
    ],
    passingScore: { type: Number, default: 70 }, // e.g. percentage threshold
  }, { timestamps: true });
  
  const Course = mongoose.model("Course", courseSchema);
  