// routes/download.js
import express from "express";
import AWS from "aws-sdk";
const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// NOTE: the route is "/api/download/:key"
router.get("/:key", async (req, res) => {
  const key = req.params.key;
  if (!key) return res.status(400).json({ error: "No file key" });

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  };

  try {
    // CORS headers added below
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    const fileStream = s3.getObject(params).createReadStream();

    // Always prompt download (Content-Disposition: attachment)
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${key.split('-').slice(1).join('-') || key}"`
    );

    // Let browser infer type
    fileStream.on("error", err => {
      res.status(404).json({ error: "File not found" });
    });

    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Download failed" });
  }
});

export default router;
