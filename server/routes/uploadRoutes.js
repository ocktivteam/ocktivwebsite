import express from "express";
import { upload, uploadFileToS3 } from "../controllers/uploadController.js";

const router = express.Router();

// POST /api/upload - upload a single file (form field name must be 'file')
router.post("/", upload.single("file"), uploadFileToS3);

export default router;
