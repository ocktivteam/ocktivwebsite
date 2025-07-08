import { Certificate } from "../models/Certificate.js";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import AWS from "aws-sdk";
import pdf from "html-pdf";
import ejs from "ejs";
import path from "path";

// AWS setup
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const generateCertificate = async (req, res) => {
    try {
        // console.log("🔵 req.headers:", req.headers);
        // console.log("🔵 req.body (raw):", req.body); // This must show something

        const { userId, courseId } = req.body;
        //console.log("📩 Request received for user:", userId, "course:", courseId);


        // Check if certificate already exists
        let certificate = await Certificate.findOne({ user: userId, course: courseId });
        if (certificate) {
            return res.status(200).json(certificate); // Return existing one
        }

        const user = await User.findById(userId);
        const course = await Course.findById(courseId);
        if (!user || !course) {
            console.log("❌ User or course not found");
            return res.status(404).json({ error: "User or course not found" });
        }

        const name = user.legalName || `${user.firstName} ${user.lastName}`;
        const date = new Date().toLocaleDateString();

        const templatePath = path.join(process.cwd(), "templates", "certificate.ejs");
        console.log("📝 Rendering EJS from:", templatePath);

        const html = await ejs.renderFile(templatePath, {
            name,
            course: course.courseTitle,
            date,
        });

        console.log("✅ HTML rendered, generating PDF...");

        const pdfBuffer = await new Promise((resolve, reject) => {
            pdf.create(html).toBuffer((err, buffer) => {
                if (err) return reject(err);
                resolve(buffer);
            });
        });

        console.log("✅ PDF generated, uploading to S3...");

        const s3Key = `certificates/${userId}-${courseId}-${Date.now()}.pdf`;
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: "application/pdf",
        };

        const data = await s3.upload(uploadParams).promise();
        console.log("✅ Uploaded to S3:", data.Location);

        certificate = await Certificate.create({
            user: userId,
            course: courseId,
            certificateUrl: data.Location,
        });

        console.log("✅ Certificate saved to DB");
        res.status(201).json(certificate);
    } catch (err) {
        console.error("❌ Certificate generation failed:", err);
        res.status(500).json({ error: "Failed to generate certificate" });
    }
};
