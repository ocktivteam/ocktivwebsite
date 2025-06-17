import { ModuleProgress } from "../models/ModuleProgress.js";

export const updateProgress = async (req, res) => {
  try {
    const { courseId, moduleId, lastWatchedTime, completed } = req.body;
    const userId = req.user._id;

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
    res.status(500).json({ message: "Error updating progress", error: err.message });
  }
};

export const getProgressForUser = async (req, res) => {
  try {
    const progress = await ModuleProgress.find({ userId: req.params.userId });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user progress", error: err.message });
  }
};

export const getProgressForModule = async (req, res) => {
  try {
    const progress = await ModuleProgress.find({ moduleId: req.params.moduleId });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Error fetching module progress", error: err.message });
  }
};
