import jwt from "jsonwebtoken";
import { ModuleProgress } from "../models/ModuleProgress.js";

export const updateProgress = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    const userId = decoded._id || decoded.userId;
    const { courseId, moduleId, lastWatchedTime, completed } = req.body;
    let status = "not_started";
    if (completed) status = "completed";
    else if (lastWatchedTime > 0) status = "ongoing";
    const updated = await ModuleProgress.findOneAndUpdate(
      { userId, moduleId },
      {
        $set: { courseId, lastWatchedTime, completed, status },
      },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Progress update error:", err);
    res.status(500).json({ message: "Error updating progress", error: err.message });
  }
};

export const getProgressForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await ModuleProgress.find({ userId });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Error fetching progress", error: err.message });
  }
};
