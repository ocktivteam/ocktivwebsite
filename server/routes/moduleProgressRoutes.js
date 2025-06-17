import express from "express";
import {
  updateProgress,
  getProgressForUser,
  getProgressForModule,
} from "../controllers/moduleProgressController.js";

const router = express.Router();

// PUT /api/module-progress/
router.put("/", updateProgress);

// GET /api/module-progress/user/:userId
router.get("/user/:userId", getProgressForUser);

// GET /api/module-progress/module/:moduleId
router.get("/module/:moduleId", getProgressForModule);

export default router;
