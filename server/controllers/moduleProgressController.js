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
  
      const userId = decoded._id;
      const { courseId, moduleId, lastWatchedTime, completed } = req.body;
  
      const updated = await ModuleProgress.findOneAndUpdate(
        { userId, moduleId },
        {
          $set: {
            courseId,
            lastWatchedTime,
            completed,
          },
        },
        { upsert: true, new: true }
      );
  
      res.json(updated);
    } catch (err) {
      console.error("Progress update error:", err);
      res.status(500).json({ message: "Error updating progress", error: err.message });
    }
  };