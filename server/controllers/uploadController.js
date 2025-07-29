import AWS from "aws-sdk";
import multer from "multer";

// Set up multer for in-memory file storage (buffer)
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

// Configure AWS S3 with .env values
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Controller to handle file upload to S3
export const uploadFileToS3 = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Accept optional keyPrefix (for custom folder upload, e.g. "CourseImages/")
    const keyPrefix = req.body.keyPrefix || "";
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: keyPrefix + `${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      //ACL: "public-read",
    };

    // Upload to S3
    const data = await s3.upload(params).promise();

    // Respond with the file URL and S3 key
    res.json({ url: data.Location, key: data.Key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};
