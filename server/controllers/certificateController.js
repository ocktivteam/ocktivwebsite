// import { Certificate } from "../models/Certificate.js";
// import { User } from "../models/User.js";
// import { Course } from "../models/Course.js";
// import AWS from "aws-sdk";
// import pdf from "html-pdf";
// import ejs from "ejs";
// import path from "path";

// // AWS setup
// const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION,
// });

// export const generateCertificate = async (req, res) => {
//     try {
//         // console.log("req.headers:", req.headers);
//         // console.log("req.body (raw):", req.body); // This must show something

//         const { userId, courseId } = req.body;
//         //console.log("Request received for user:", userId, "course:", courseId);


//         // Check if certificate already exists
//         let certificate = await Certificate.findOne({ user: userId, course: courseId });
//         if (certificate) {
//             return res.status(200).json(certificate); // Return existing one
//         }

//         const user = await User.findById(userId);
//         const course = await Course.findById(courseId);
//         if (!user || !course) {
//             console.log("User or course not found");
//             return res.status(404).json({ error: "User or course not found" });
//         }

//         const name = user.legalName || `${user.firstName} ${user.lastName}`;
//         const date = new Date().toLocaleDateString();

//         const templatePath = path.join(process.cwd(), "templates", "certificate.ejs");
//         console.log("Rendering EJS from:", templatePath);

//         const html = await ejs.renderFile(templatePath, {
//             name,
//             course: course.courseTitle,
//             date,
//         });

//         console.log("HTML rendered, generating PDF...");

//         const pdfBuffer = await new Promise((resolve, reject) => {
//             pdf.create(html).toBuffer((err, buffer) => {
//                 if (err) return reject(err);
//                 resolve(buffer);
//             });
//         });

//         console.log("PDF generated, uploading to S3...");

//         const s3Key = `certificates/${userId}-${courseId}-${Date.now()}.pdf`;
//         const uploadParams = {
//             Bucket: process.env.AWS_S3_BUCKET,
//             Key: s3Key,
//             Body: pdfBuffer,
//             ContentType: "application/pdf",
//         };

//         const data = await s3.upload(uploadParams).promise();
//         console.log("Uploaded to S3:", data.Location);

//         certificate = await Certificate.create({
//             user: userId,
//             course: courseId,
//             certificateUrl: data.Location,
//         });

//         console.log("Certificate saved to DB");
//         res.status(201).json(certificate);
//     } catch (err) {
//         console.error("Certificate generation failed:", err);
//         res.status(500).json({ error: "Failed to generate certificate" });
//     }
// };


//====July9====

// // server/controllers/certificateController.js
// import { createCanvas, loadImage } from "canvas";
// import path from "path";
// import { fileURLToPath } from "url";
// import { User } from "../models/User.js";
// import { Course } from "../models/Course.js";
// import { Certificate } from "../models/Certificate.js";
// import { v4 as uuidv4 } from "uuid";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const generateCertificate = async (req, res) => {
//   try {
//     const { userId, courseId } = req.body;
//     if (!userId || !courseId) {
//       return res.status(400).json({ message: "Missing userId or courseId" });
//     }

//     // 1. Fetch user and course info
//     const user = await User.findById(userId);
//     const course = await Course.findById(courseId).populate("instructors");
//     if (!user || !course) {
//       return res.status(404).json({ message: "User or Course not found" });
//     }

//     // 2. Prepare data for certificate
//     const studentName = `${user.firstName} ${user.lastName}`;
//     const courseName = course.courseTitle;
//     const instructor = course.instructors.map(i => `${i.firstName} ${i.lastName}`).join(", ");
//     const completionDate = new Date().toLocaleDateString("en-US");
//     const certId = uuidv4();
//     const certUrl = ""; // We will fill this after generating the image

//     // 3. Draw the certificate on canvas
//     const templatePath = path.join(__dirname, "..", "templates", "ocktiv-cert-template.png");
//     const certImage = await loadImage(templatePath);
//     const width = certImage.width;
//     const height = certImage.height;
//     const canvas = createCanvas(width, height);
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(certImage, 0, 0, width, height);

//     ctx.font = "bold 36px Arial";
//     ctx.fillStyle = "#263D5A";
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     ctx.fillText("CERTIFICATE OF COMPLETION", width / 2, 160);

//     ctx.font = "24px Arial";
//     ctx.fillStyle = "#222";
//     ctx.fillText(courseName, width / 2, 240);

//     ctx.font = "20px Arial";
//     ctx.fillStyle = "#222";
//     ctx.textAlign = "left";
//     ctx.fillText(`${instructor}`, 150, 305);

//     ctx.textAlign = "center";
//     ctx.font = "24px Arial";
//     ctx.fillStyle = "#3498db";
//     ctx.fillText("", width / 2, 350);

//     ctx.font = "bold 26px Arial";
//     ctx.fillStyle = "#263D5A";
//     ctx.fillText(studentName, width / 2, 390);

//     ctx.font = "18px Arial";
//     ctx.fillStyle = "#444";
//     ctx.textAlign = "left";
//     ctx.fillText(
//       `${completionDate}`,
//       75, 480
//     );

//     ctx.font = "16px Arial";
//     ctx.fillStyle = "#263D5A";
//     ctx.textAlign = "left";
//     ctx.fillText("Verify at:", 900, 540);
//     ctx.font = "16px Arial";
//     ctx.fillStyle = "#2980b9";
//     ctx.fillText(`Link: https://ocktiv.com/certificates/${certId}`, 900, 570);
//     ctx.font = "bold 16px Arial";
//     ctx.fillStyle = "#263D5A";
//     ctx.fillText(`Cert ID: ${certId}`, 900, 600);

//     // 4. Save certificate image to disk (for dev), or serve directly as buffer
//     // Here, we'll send a base64 PNG (could also save and serve a URL)
//     const buffer = canvas.toBuffer("image/png");
//     const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;

//     // 5. Optionally, save cert to DB for later use
//     // const newCert = await Certificate.create({
//     //   user: userId, course: courseId, certificateUrl: base64Image,
//     // });

//     // 6. Respond with image as URL
//     res.json({
//       certificateUrl: base64Image,
//       certId,
//       studentName,
//       courseName,
//       instructor,
//       completionDate
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Certificate generation failed" });
//   }
// };


// July 10

import { createCanvas, loadImage } from "canvas";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { Certificate } from "../models/Certificate.js";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";

// AWS Setup
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    // 2. Check if certificate already exists
    const existingCert = await Certificate.findOne({ user: userId, course: courseId });
    if (existingCert) {
      console.log("Returning existing certificate:", existingCert._id);
      return res.status(200).json({
        certificateUrl: existingCert.certificateUrl,
        certId: existingCert._id,
        studentName: user.legalName || `${user.firstName} ${user.lastName}`,
        courseName: course.courseTitle,
        instructor: course.instructors.map(i => `${i.firstName} ${i.lastName}`).join(", "),
        completionDate: existingCert.issuedDate.toLocaleDateString("en-US"),
      });
    }
    console.log("No existing cert found — creating new one...");
    console.log("userId:", userId);
    console.log("courseId:", courseId);
    

    // 3. Prepare certificate data
    const studentName = user.legalName || `${user.firstName} ${user.lastName}`;
    const courseName = course.courseTitle;
    const instructor = course.instructors.map(i => `${i.firstName} ${i.lastName}`).join(", ");
    const completionDate = new Date().toLocaleDateString("en-US");
    const certId = uuidv4();

    // 4. Create canvas
    const templatePath = path.join(__dirname, "..", "templates", "ocktiv-cert-template.png");
    const certImage = await loadImage(templatePath);
    const width = certImage.width;
    const height = certImage.height;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Draw template
    ctx.drawImage(certImage, 0, 0, width, height);
    console.log("Canvas width:", width);
    console.log("Canvas height:", height);
    
    // Course Name (above first line)
    ctx.font = "bold 90px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(courseName, width / 2, 1045);
    
    // Instructors (left-aligned under line)
    ctx.font = "60px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.fillText(`${instructor}`, 1630, 1235);
    
    // Student Name (on second underline)
    ctx.font = "bold 90px Arial";
    ctx.fillStyle = "#1d4f91";
    ctx.textAlign = "center";
    ctx.fillText(studentName, width / 2, 1680);
    
    ctx.font = "50px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText(completionDate, 2240, 1930);

    // ctx.fillStyle = "#1d4f91";
    // ctx.fillText(`ocktiv.com/certificates/${certId}`, 760, 540);
    
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText(`${certId}`, 2680, 2315);
    
    // // 5. Draw background + text
    // ctx.drawImage(certImage, 0, 0, width, height);

    // ctx.font = "bold 36px Arial";
    // ctx.fillStyle = "#263D5A";
    // ctx.textAlign = "center";
    // ctx.textBaseline = "middle";
    // ctx.fillText("CERTIFICATE OF COMPLETION", width / 2, 160);

    // ctx.font = "24px Arial";
    // ctx.fillStyle = "#222";
    // ctx.fillText(courseName, width / 2, 240);

    // ctx.font = "20px Arial";
    // ctx.fillStyle = "#222";
    // ctx.textAlign = "left";
    // ctx.fillText(`${instructor}`, 150, 305);

    // ctx.textAlign = "center";
    // ctx.font = "bold 26px Arial";
    // ctx.fillStyle = "#263D5A";
    // ctx.fillText(studentName, width / 2, 390);

    // ctx.font = "18px Arial";
    // ctx.fillStyle = "#444";
    // ctx.textAlign = "left";
    // ctx.fillText(completionDate, 75, 480);

    // ctx.font = "16px Arial";
    // ctx.fillStyle = "#263D5A";
    // ctx.fillText("Verify at:", 900, 540);
    // ctx.fillStyle = "#2980b9";
    // ctx.fillText(`https://ocktiv.com/certificates/${certId}`, 900, 570);
    // ctx.fillStyle = "#263D5A";
    // ctx.fillText(`Cert ID: ${certId}`, 900, 600);

    // 6. Convert to PNG buffer
    const buffer = canvas.toBuffer("image/png");
    const s3Key = `certificates/${userId}-${courseId}-${Date.now()}.png`;

    const safeFileName = `${studentName}-${courseName}`
  .replace(/\s+/g, "_")        // Replace spaces with underscores
  .replace(/[^a-zA-Z0-9_-]/g, ""); // Remove special characters


    // 7. Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: "image/png",
      //ContentDisposition: `attachment; filename="${safeFileName}.png"`, // this triggers download - but it downloads eveytime even when user just tries to visit the link
    };

    const s3Result = await s3.upload(uploadParams).promise();
    const certUrl = s3Result.Location;

    // 8. Save to DB
    const newCert = await Certificate.create({
      user: userId,
      course: courseId,
      certificateUrl: certUrl,
      issuedDate: new Date(), // will be fixed/immutable
    });

    // 9. Respond
    res.status(201).json({
      certificateUrl: certUrl,
      certId: newCert._id,
      studentName,
      courseName,
      instructor,
      completionDate,
    });
  } catch (err) {
    console.error("Certificate generation failed:", err);
    res.status(500).json({ message: "Certificate generation failed" });
  }
};

