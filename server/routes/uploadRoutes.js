import express from "express";
import { upload, uploadFileToS3 } from "../controllers/uploadController.js";
import { listQuizThemes } from "../controllers/themeController.js";

const router = express.Router();

// POST /api/upload - upload a single file (form field name must be 'file')
router.post("/", upload.single("file"), uploadFileToS3);

router.get("/themes", listQuizThemes);

export default router;
