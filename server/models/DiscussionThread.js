import mongoose from "mongoose";

const DiscussionThreadSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", index: true, required: true },

    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },

    author: {
      _id:  { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
      name: { type: String, required: true },
      role: { type: String, enum: ["student", "instructor", "admin"], required: true }
    },

    pinned: { type: Boolean, default: false, index: true },

    replyCount: { type: Number, default: 0 },
    latestReplyAt: { type: Date }
  },
  { timestamps: true }
);

DiscussionThreadSchema.index({ courseId: 1, pinned: -1, latestReplyAt: -1, updatedAt: -1 });

const DiscussionThread = mongoose.model("DiscussionThread", DiscussionThreadSchema);
export default DiscussionThread;
