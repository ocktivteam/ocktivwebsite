// import mongoose from "mongoose";

// const certificateSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
//     issuedDate: { type: Date, default: Date.now, immutable: true },
//     certificateUrl: String // e.g. a PDF or image link
//   }, { timestamps: true });
  
//   const Certificate = mongoose.model("Certificate", certificateSchema);
//   export { Certificate };
    

  // =====Jul9====

  // import mongoose from "mongoose";

  // const certificateSchema = new mongoose.Schema({
  //     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  //     course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  //     issuedDate: { type: Date, default: Date.now, immutable: true },
  //     certificateUrl: String // e.g. a PDF or image link
  //   }, { timestamps: true });
    
  // const Certificate = mongoose.model("Certificate", certificateSchema);
  // export { Certificate };
  

  // July 10

  import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issuedDate: { type: Date, default: Date.now, immutable: true },
  certificateUrl: String
}, { timestamps: true });

certificateSchema.index({ user: 1, course: 1 }, { unique: true }); // <-- Ensures one cert per user-course

const Certificate = mongoose.model("Certificate", certificateSchema);
export { Certificate };
