const courseSchema = new mongoose.Schema({
    courseTitle: { type: String, required: true },
    description: { type: String },
  
    courseType: {
      type: String,
      enum: ['Short', 'Long'],
      default: 'Short',
    },
    semester:   { type: String, default: null }, // optional: e.g., "Fall 2025"
    price:      { type: Number, default: 0 },
    duration:   { type: String }, // e.g., "6 weeks"
  
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
    modules:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    quizzes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
    discussions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' }]
  }, { timestamps: true });
  
  const Course = mongoose.model("Course", courseSchema);
  export { Course };