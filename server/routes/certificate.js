import express from "express";
import { generateCertificate } from "../controllers/certificateController.js";

const router = express.Router();

router.post("/generate", generateCertificate);

export default router;
