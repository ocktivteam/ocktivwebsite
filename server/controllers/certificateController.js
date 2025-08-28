import { createCanvas, loadImage } from "canvas";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { Certificate } from "../models/Certificate.js";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";

console.log("Loaded AWS_REGION:", process.env.AWS_REGION);

// AWS S3 v4 Setup
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "ca-central-1",
  signatureVersion: "v4",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================
// CERTIFICATE GENERATION
// =============================
export const generateCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
      return res.status(400).json({ message: "Missing userId or courseId" });
    }

    // 1. Fetch user and course
    const user = await User.findById(userId);
    const course = await Course.findById(courseId).populate("instructors");
    if (!user || !course) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    // 2. If certificate already exists, return it
    const existingCert = await Certificate.findOne({ user: userId, course: courseId });
    if (existingCert) {
      return res.status(200).json({
        certificateUrl: existingCert.certificateUrl,
        certId: existingCert.certId,
        studentName: user.legalName || `${user.firstName} ${user.lastName}`,
        courseName: course.courseTitle,
        instructor: course.instructors.map(i => `${i.firstName} ${i.lastName}`).join(", "),
        completionDate: existingCert.issuedDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      });
    }

    // 3. Prepare certificate data
    const studentName = user.legalName || `${user.firstName} ${user.lastName}`;
    const courseName = course.courseTitle;
    const instructor = course.instructors.map(i => `${i.firstName} ${i.lastName}`).join(", ");
    const completionDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const certId = uuidv4();

    // 4. Draw certificate
    let buffer;
    try {
      const templatePath = path.join(__dirname, "..", "templates", "ocktiv-cert-template.png");
      const certImage = await loadImage(templatePath);
      const width = certImage.width;
      const height = certImage.height;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(certImage, 0, 0, width, height);

      ctx.font = "bold 110px Arial";
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.fillText(courseName, width / 2, 1045);

      ctx.font = "85px Arial";
      ctx.fillStyle = "#000";
      ctx.textAlign = "left";
      ctx.fillText(`${instructor}`, 1630, 1235);

      ctx.font = "bold 110px Arial";
      ctx.fillStyle = "#1d4f91";
      ctx.textAlign = "center";
      ctx.fillText(studentName, width / 2, 1700);

      ctx.font = "54px Arial";
      ctx.fillStyle = "#000";
      ctx.fillText(completionDate, 2320, 1941);

      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#000";
      ctx.textAlign = "left";
      ctx.fillText(`${certId}`, 2340, 2300);

      ctx.font = "36px Arial";
      ctx.fillStyle = "#1d4f91";
      ctx.textAlign = "left";
      const viewerLink = process.env.FRONTEND_DOMAIN || "ocktiv.com";
      ctx.fillText(`${viewerLink}/certificates/${certId}`, 200, 2295);

      buffer = canvas.toBuffer("image/png");
    } catch (err) {
      console.error("Canvas generation error:", err);
      return res.status(202).json({ pending: true, message: "Certificate generation in progress" });
    }

    // 5. Upload to S3
    let certUrl;
    try {
      const s3Key = `certificates/${userId}-${courseId}-${Date.now()}.png`;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        Body: buffer,
        ContentType: "image/png",
      };
      const s3Result = await s3.upload(uploadParams).promise();
      certUrl = s3Result.Location;
    } catch (err) {
      console.error("S3 upload error:", err);
      return res.status(202).json({ pending: true, message: "Certificate upload in progress" });
    }

    // 6. Save to DB (only after S3 success)
    try {
      await Certificate.create({
        user: userId,
        course: courseId,
        certificateUrl: certUrl,
        issuedDate: new Date(),
        certId,
      });
    } catch (err) {
      console.error("DB save error:", err);
      return res.status(202).json({ pending: true, message: "Certificate will be available soon" });
    }

    // 7. Return success
    res.status(201).json({
      certificateUrl: certUrl,
      certId,
      studentName,
      courseName,
      instructor,
      completionDate,
    });
  } catch (err) {
    console.error("Unexpected certificate generation error:", err);
    // Instead of 500, send pending so frontend can retry
    res.status(202).json({ pending: true, message: "Certificate generation still processing" });
  }
};

// =============================
// REDIRECT CONTROLLER (for sharing)
// =============================
export const redirectToCertificate = async (req, res) => {
  try {
    const { certId } = req.params;
    const cert = await Certificate.findOne({ certId });
    if (!cert) {
      return res.status(404).send("Certificate not found.");
    }
    res.redirect(cert.certificateUrl);
  } catch (err) {
    console.error("Redirect failed:", err);
    res.status(500).send("Error redirecting to certificate.");
  }
};

// =============================
// FETCH CERTIFICATE BY ID
// =============================
export const getCertificateByCertId = async (req, res) => {
  try {
    const { certId } = req.params;
    const cert = await Certificate.findOne({ certId }).populate("course");
    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    res.json({
      certificateUrl: cert.certificateUrl,
      course: cert.course._id || cert.course,
      courseTitle: cert.course.courseTitle || undefined,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch certificate" });
  }
};

// =============================
// PRESIGNED URL CONTROLLER (download)
// =============================
export const getPresignedCertificateUrl = async (req, res) => {
  try {
    const { certId } = req.params;
    const cert = await Certificate.findOne({ certId });
    if (!cert) return res.status(404).json({ message: "Certificate not found." });

    const url = new URL(cert.certificateUrl);
    const key = decodeURIComponent(url.pathname.substring(1));
    const filename = `${certId}.png`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: 60,
      ResponseContentType: "image/png",
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    };
    const signedUrl = s3.getSignedUrl("getObject", params);
    return res.json({ url: signedUrl });
  } catch (err) {
    console.error("Failed to get presigned URL", err);
    res.status(500).json({ message: "Failed to get download link" });
  }
};
