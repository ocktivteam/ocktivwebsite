import express from "express";
import {
  generateCertificate,
  redirectToCertificate,
  getPresignedCertificateUrl,
  getCertificateByCertId, 
} from "../controllers/certificateController.js";
import { Certificate } from "../models/Certificate.js";

const router = express.Router();

// POST: /api/certificate/generate
router.post("/generate", generateCertificate);

// GET: /api/certificate/by-user-course?userId=&courseId=   (put BEFORE :certId)
// GET: /api/certificate/by-user-course?userId=&courseId=
router.get("/by-user-course", async (req, res) => {
  try {
    const { userId, courseId } = req.query;
    if (!userId || !courseId) {
      return res.status(400).json({ exists: false, message: "Missing userId or courseId" });
    }

    const cert = await Certificate.findOne(
      { user: userId, course: courseId },  
      { _id: 1, certId: 1, user: 1, course: 1, certificateUrl: 1, issuedDate: 1 }
    ).populate("course user", "courseTitle legalName firstName lastName").lean();

    if (cert) {
      return res.json({
        exists: true,
        certificate: {
          certId: cert.certId,
          courseId: cert.course?._id || courseId,
          courseName: cert.course?.courseTitle,
          userId: cert.user?._id || userId,
          studentName: cert.user?.legalName || `${cert.user?.firstName} ${cert.user?.lastName}`,
          completionDate: cert.issuedDate?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric"
          }),
          certificateUrl: cert.certificateUrl
        }
      });
    }

    return res.json({ exists: false });
  } catch (err) {
    console.error("by-user-course error:", err);
    return res.status(500).json({ exists: false, message: "Server error" });
  }
});

// GET: /api/certificate/by-user?userId=...
router.get("/by-user", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ exists: false, message: "Missing userId" });
    }

    // Find all certificates for this user
    const certs = await Certificate.find(
      { user: userId },
      { _id: 1, certId: 1, course: 1, issuedDate: 1, certificateUrl: 1 }
    )
      .populate("course", "courseTitle")
      .lean();

    if (certs && certs.length > 0) {
      return res.json({
        exists: true,
        certificates: certs.map(c => ({
          certId: c.certId,
          courseId: c.course?._id,
          courseName: c.course?.courseTitle,
          issuedDate: c.issuedDate?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          certificateUrl: c.certificateUrl,
        })),
      });
    }

    return res.json({ exists: false, certificates: [] });
  } catch (err) {
    console.error("by-user error:", err);
    return res.status(500).json({ exists: false, message: "Server error" });
  }
});


// GET: /api/certificate/:certId (JSON, for React viewer)
router.get("/:certId", getCertificateByCertId);

// GET: /api/certificate/download/:certId
router.get("/download/:certId", getPresignedCertificateUrl);

export default router;
