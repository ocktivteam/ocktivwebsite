// routes/emailRoutes.js
import express from "express";
import { sendStudentEmailToInstructor } from "../controllers/emailController.js";
import { uploadEmailAttachments } from "../middleware/uploadEmailAttachments.js";

const router = express.Router();

router.use((req, res, next) => {
    console.log("EMAIL ROUTER HIT:", req.method, req.originalUrl);
    next();
  });
  
console.log("emailRoutes.js file loaded");

// Health check
router.get("/health", (req, res) => {
  res.json({ ok: true, route: "email" });
});

// Main email route
router.post("/student-to-instructor", uploadEmailAttachments, sendStudentEmailToInstructor);

// Named export, same style as courseRouter
export { router as emailRouter };
