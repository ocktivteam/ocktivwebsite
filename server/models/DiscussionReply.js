import mongoose from "mongoose";

const DiscussionReplySchema = new mongoose.Schema(
  {
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: "DiscussionThread", index: true, required: true },
    courseId:  { type: mongoose.Schema.Types.ObjectId, ref: "Course", index: true, required: true },

    message: { type: String, required: true, trim: true, maxlength: 2000 },

    author: {
      _id:  { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
      name: { type: String, required: true },
      role: { type: String, enum: ["student", "instructor", "admin"], required: true }
    }
  },
  { timestamps: true }
);

DiscussionReplySchema.index({ threadId: 1, createdAt: 1 });

const DiscussionReply = mongoose.model("DiscussionReply", DiscussionReplySchema);
export default DiscussionReply;
