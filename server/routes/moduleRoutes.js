import express from "express";
import {
  createModule,
  getModulesByCourse,
  getModuleById,
  deleteModule,
} from "../controllers/moduleController.js";

const router = express.Router();

// POST /api/modules/
router.post("/", createModule);

// GET /api/modules/course/:courseId
router.get("/course/:courseId", getModulesByCourse);

// GET /api/modules/:id
router.get("/:id", getModuleById);

// DELETE /api/modules/:id
router.delete("/:id", deleteModule);

export default router;
