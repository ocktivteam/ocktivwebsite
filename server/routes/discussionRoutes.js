// import express from "express";
// import mongoose from "mongoose";
// import { jwtMiddleware } from "../middleware/jwtMiddleware.js";
// import { requireRole } from "../middleware/checkAdmin.js";
// import DiscussionThread from "../models/DiscussionThread.js";
// import DiscussionReply from "../models/DiscussionReply.js";

// const router = express.Router();

// // Everything in this router requires a valid JWT
// router.use(jwtMiddleware);

// // Small helper: build a display name from token fields
// function displayNameFrom(user = {}) {
//   // if you put firstName/lastName in the token, prefer those:
//   if (user.firstName || user.lastName) {
//     return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
//   }
//   return user.username || user.email || "User";
// }

// // GET /api/discussions/:courseId
// router.get("/:courseId", async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     const threads = await DiscussionThread.find({ courseId })
//       .sort({ pinned: -1, latestReplyAt: -1, updatedAt: -1, createdAt: -1 })
//       .lean();

//     const normalized = threads.map(t => ({
//       _id: t._id,
//       courseId: t.courseId,
//       subject: t.subject,
//       message: t.message,
//       author: t.author,
//       createdAt: t.createdAt,
//       updatedAt: t.updatedAt,
//       replyCount: t.replyCount || 0,
//       latestReplyAt: t.latestReplyAt || t.updatedAt || t.createdAt,
//       pinned: !!t.pinned,
//     }));

//     res.json({ threads: normalized });
//   } catch (e) {
//     res.status(500).json({ error: "Failed to load discussions" });
//   }
// });

// // POST /api/discussions
// // Body: { courseId, subject, message }
// router.post("/", async (req, res) => {
//   try {
//     const { courseId, subject, message } = req.body;
//     if (!courseId || !subject?.trim() || !message?.trim()) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const thread = await DiscussionThread.create({
//       courseId,
//       subject: subject.trim(),
//       message: message.trim(),
//       author: {
//         _id: req.user._id || req.userId,
//         name: displayNameFrom(req.user),
//         role: req.user.role,
//       },
//       pinned: false,
//       replyCount: 0,
//       latestReplyAt: null,
//     });

//     res.status(201).json({ thread: thread.toObject() });
//   } catch (e) {
//     res.status(500).json({ error: "Failed to create discussion" });
//   }
// });

// // GET /api/discussions/:courseId/:threadId
// router.get("/:courseId/:threadId", async (req, res) => {
//   try {
//     const { courseId, threadId } = req.params;

//     const thread = await DiscussionThread.findOne({ _id: threadId, courseId }).lean();
//     if (!thread) return res.status(404).json({ error: "Not found" });

//     const replies = await DiscussionReply.find({ threadId })
//       .sort({ createdAt: 1 })
//       .lean();

//     res.json({ thread, replies });
//   } catch (e) {
//     res.status(500).json({ error: "Failed to load thread" });
//   }
// });

// // POST /api/discussions/:threadId/replies  Body: { message }
// router.post("/:threadId/replies", async (req, res) => {
//   try {
//     const { threadId } = req.params;
//     const { message } = req.body;
//     if (!message?.trim()) return res.status(400).json({ error: "Message required" });

//     const thread = await DiscussionThread.findById(threadId);
//     if (!thread) return res.status(404).json({ error: "Thread not found" });

//     const reply = await DiscussionReply.create({
//       threadId,
//       courseId: thread.courseId,
//       message: message.trim(),
//       author: {
//         _id: req.user._id || req.userId,
//         name: displayNameFrom(req.user),
//         role: req.user.role,
//       },
//     });

//     thread.replyCount = (thread.replyCount || 0) + 1;
//     thread.latestReplyAt = reply.createdAt;
//     await thread.save();

//     res.status(201).json({ reply: reply.toObject() });
//   } catch (e) {
//     res.status(500).json({ error: "Failed to post reply" });
//   }
// });

// // PATCH /api/discussions/:threadId/pin  Body: { pinned: boolean }
// // Only instructor/admin
// router.patch("/:threadId/pin", requireRole(["instructor", "admin"]), async (req, res) => {
//   try {
//     const { threadId } = req.params;
//     const { pinned } = req.body;

//     const updated = await DiscussionThread.findByIdAndUpdate(
//       threadId,
//       { $set: { pinned: !!pinned } },
//       { new: true }
//     ).lean();

//     if (!updated) return res.status(404).json({ error: "Not found" });

//     res.json({ thread: updated });
//   } catch (e) {
//     res.status(500).json({ error: "Failed to update pin" });
//   }
// });

// // DELETE /api/discussions/:threadId
// // Only instructor/admin
// router.delete("/:threadId", requireRole(["instructor", "admin"]), async (req, res) => {
//   try {
//     const { threadId } = req.params;

//     const thread = await DiscussionThread.findById(threadId);
//     if (!thread) return res.status(404).json({ error: "Not found" });

//     await Promise.all([
//       DiscussionReply.deleteMany({ threadId }),
//       DiscussionThread.deleteOne({ _id: threadId }),
//     ]);

//     res.json({ ok: true });
//   } catch (e) {
//     res.status(500).json({ error: "Failed to delete thread" });
//   }
// });

// // DELETE /api/discussions/:threadId/replies/:replyId
// // Owner OR instructor/admin can delete
// router.delete("/:threadId/replies/:replyId", async (req, res) => {
//   try {
//     const { threadId, replyId } = req.params;

//     const reply = await DiscussionReply.findOne({ _id: replyId, threadId });
//     if (!reply) return res.status(404).json({ error: "Not found" });

//     const isOwner =
//       String(reply.author._id) === String(req.user._id || req.userId);
//     const isMod = ["instructor", "admin"].includes(String(req.user.role).toLowerCase());
//     if (!isOwner && !isMod) return res.status(403).json({ error: "Not authorized" });

//     await DiscussionReply.deleteOne({ _id: replyId });

//     const thread = await DiscussionThread.findById(threadId);
//     if (thread) {
//       thread.replyCount = Math.max(0, (thread.replyCount || 0) - 1);
//       const last = await DiscussionReply.find({ threadId })
//         .sort({ createdAt: -1 })
//         .limit(1);
//       thread.latestReplyAt = last[0]?.createdAt || null;
//       await thread.save();
//     }

//     res.json({ ok: true });
//   } catch (e) {
//     res.status(500).json({ error: "Failed to delete reply" });
//   }
// });

// export default router;


// === new

import express from "express";
import mongoose from "mongoose";
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";
import { requireRole } from "../middleware/checkAdmin.js";
import DiscussionThread from "../models/DiscussionThread.js";
import DiscussionReply from "../models/DiscussionReply.js";

const router = express.Router();

// Everything in this router requires a valid JWT
router.use(jwtMiddleware);

// Small helper: build a display name from token fields
function displayNameFrom(user = {}) {
  // if you put firstName/lastName in the token, prefer those:
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  }
  return user.username || user.email || "User";
}

// GET /api/discussions/:courseId
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const threads = await DiscussionThread.find({ courseId })
      .sort({ pinned: -1, latestReplyAt: -1, updatedAt: -1, createdAt: -1 })
      .lean();

    const normalized = threads.map(t => ({
      _id: t._id,
      courseId: t.courseId,
      subject: t.subject,
      message: t.message,
      author: t.author,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      replyCount: t.replyCount || 0,
      latestReplyAt: t.latestReplyAt || t.updatedAt || t.createdAt,
      pinned: !!t.pinned,
    }));

    res.json({ threads: normalized });
  } catch (e) {
    res.status(500).json({ error: "Failed to load discussions" });
  }
});

// POST /api/discussions
// Body: { courseId, subject, message }
router.post("/", async (req, res) => {
  try {
    const { courseId, subject, message } = req.body;
    if (!courseId || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const thread = await DiscussionThread.create({
      courseId,
      subject: subject.trim(),
      message: message.trim(),
      author: {
        _id: req.user._id || req.userId,
        name: displayNameFrom(req.user),
        role: req.user.role,
      },
      pinned: false,
      replyCount: 0,
      latestReplyAt: null,
    });

    res.status(201).json({ thread: thread.toObject() });
  } catch (e) {
    res.status(500).json({ error: "Failed to create discussion" });
  }
});

// GET /api/discussions/:courseId/:threadId
router.get("/:courseId/:threadId", async (req, res) => {
  try {
    const { courseId, threadId } = req.params;

    const thread = await DiscussionThread.findOne({ _id: threadId, courseId }).lean();
    if (!thread) return res.status(404).json({ error: "Not found" });

    const replies = await DiscussionReply.find({ threadId })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ thread, replies });
  } catch (e) {
    res.status(500).json({ error: "Failed to load thread" });
  }
});

// PATCH /api/discussions/:threadId - Edit thread (owner or moderator only)
// Body: { subject, message }
router.patch("/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;
    const { subject, message } = req.body;

    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Subject and message are required" });
    }

    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    // Check permissions: owner or moderator
    const isOwner = String(thread.author._id) === String(req.user._id || req.userId);
    const isMod = ["instructor", "admin"].includes(String(req.user.role).toLowerCase());
    
    if (!isOwner && !isMod) {
      return res.status(403).json({ error: "Not authorized to edit this thread" });
    }

    // Update the thread
    thread.subject = subject.trim();
    thread.message = message.trim();
    thread.updatedAt = new Date();
    
    const updated = await thread.save();
    res.json({ thread: updated.toObject() });
  } catch (e) {
    res.status(500).json({ error: "Failed to update thread" });
  }
});

// POST /api/discussions/:threadId/replies  Body: { message }
router.post("/:threadId/replies", async (req, res) => {
  try {
    const { threadId } = req.params;
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message required" });

    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    const reply = await DiscussionReply.create({
      threadId,
      courseId: thread.courseId,
      message: message.trim(),
      author: {
        _id: req.user._id || req.userId,
        name: displayNameFrom(req.user),
        role: req.user.role,
      },
    });

    thread.replyCount = (thread.replyCount || 0) + 1;
    thread.latestReplyAt = reply.createdAt;
    await thread.save();

    res.status(201).json({ reply: reply.toObject() });
  } catch (e) {
    res.status(500).json({ error: "Failed to post reply" });
  }
});

// PATCH /api/discussions/:threadId/replies/:replyId - Edit reply (owner or moderator only)
// Body: { message }
router.patch("/:threadId/replies/:replyId", async (req, res) => {
  try {
    const { threadId, replyId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await DiscussionReply.findOne({ _id: replyId, threadId });
    if (!reply) return res.status(404).json({ error: "Reply not found" });

    // Check permissions: owner or moderator
    const isOwner = String(reply.author._id) === String(req.user._id || req.userId);
    const isMod = ["instructor", "admin"].includes(String(req.user.role).toLowerCase());
    
    if (!isOwner && !isMod) {
      return res.status(403).json({ error: "Not authorized to edit this reply" });
    }

    // Update the reply
    reply.message = message.trim();
    reply.updatedAt = new Date();
    
    const updated = await reply.save();
    res.json({ reply: updated.toObject() });
  } catch (e) {
    res.status(500).json({ error: "Failed to update reply" });
  }
});

// PATCH /api/discussions/:threadId/pin  Body: { pinned: boolean }
// Only instructor/admin
router.patch("/:threadId/pin", requireRole(["instructor", "admin"]), async (req, res) => {
  try {
    const { threadId } = req.params;
    const { pinned } = req.body;

    const updated = await DiscussionThread.findByIdAndUpdate(
      threadId,
      { $set: { pinned: !!pinned } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Not found" });

    res.json({ thread: updated });
  } catch (e) {
    res.status(500).json({ error: "Failed to update pin" });
  }
});

// DELETE /api/discussions/:threadId
// Owner OR instructor/admin can delete
router.delete("/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return res.status(404).json({ error: "Not found" });

    // Check permissions: owner or moderator
    const isOwner = String(thread.author._id) === String(req.user._id || req.userId);
    const isMod = ["instructor", "admin"].includes(String(req.user.role).toLowerCase());
    
    if (!isOwner && !isMod) {
      return res.status(403).json({ error: "Not authorized to delete this thread" });
    }

    await Promise.all([
      DiscussionReply.deleteMany({ threadId }),
      DiscussionThread.deleteOne({ _id: threadId }),
    ]);

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

// DELETE /api/discussions/:threadId/replies/:replyId
// Owner OR instructor/admin can delete
router.delete("/:threadId/replies/:replyId", async (req, res) => {
  try {
    const { threadId, replyId } = req.params;

    const reply = await DiscussionReply.findOne({ _id: replyId, threadId });
    if (!reply) return res.status(404).json({ error: "Not found" });

    const isOwner =
      String(reply.author._id) === String(req.user._id || req.userId);
    const isMod = ["instructor", "admin"].includes(String(req.user.role).toLowerCase());
    if (!isOwner && !isMod) return res.status(403).json({ error: "Not authorized" });

    await DiscussionReply.deleteOne({ _id: replyId });

    const thread = await DiscussionThread.findById(threadId);
    if (thread) {
      thread.replyCount = Math.max(0, (thread.replyCount || 0) - 1);
      const last = await DiscussionReply.find({ threadId })
        .sort({ createdAt: -1 })
        .limit(1);
      thread.latestReplyAt = last[0]?.createdAt || null;
      await thread.save();
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete reply" });
  }
});

export default router;