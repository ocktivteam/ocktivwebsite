// import express from "express";
// import { generateCertificate } from "../controllers/certificateController.js";

// const router = express.Router();

// router.post("/generate", generateCertificate);

// export default router;


//====july9===

import express from "express";
import {
  generateCertificate,
  redirectToCertificate,
  getPresignedCertificateUrl,
  getCertificateByCertId, // <--- Add this
} from "../controllers/certificateController.js";
const router = express.Router();

// POST: /api/certificate/generate
router.post("/generate", generateCertificate);

// GET: /api/certificate/:certId (JSON, for React viewer)
router.get("/:certId", getCertificateByCertId);

// GET: /api/certificate/download/:certId
router.get("/download/:certId", getPresignedCertificateUrl);

export default router;
