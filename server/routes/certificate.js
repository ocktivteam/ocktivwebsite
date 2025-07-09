// import express from "express";
// import { generateCertificate } from "../controllers/certificateController.js";

// const router = express.Router();

// router.post("/generate", generateCertificate);

// export default router;


//====july9===

import express from "express";
import { generateCertificate } from "../controllers/certificateController.js";
const router = express.Router();

// POST: /api/certificate/generate
router.post("/generate", generateCertificate);

export default router;
