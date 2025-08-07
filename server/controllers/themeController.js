// controllers/themeController.js (or add to uploadController.js)

import AWS from "aws-sdk";

// Make sure this matches your s3 config in uploadController.js!
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const listQuizThemes = async (req, res) => {
  try {
    const Bucket = process.env.AWS_S3_BUCKET;
    const Prefix = "quiz/themes/";

    // List all objects in quiz/themes/
    const data = await s3
      .listObjectsV2({ Bucket, Prefix })
      .promise();

    // Filter only image files (ignore folders)
    const imageFiles = (data.Contents || [])
      .filter(obj => /\.(jpg|jpeg|png|webp|gif)$/i.test(obj.Key))
      .map(obj => ({
        key: obj.Key.replace(Prefix, ""),
        url: `https://${Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`
      }));

    res.json(imageFiles);
  } catch (err) {
    console.error("Error listing theme images:", err);
    res.status(500).json({ error: "Failed to list theme images" });
  }
};
