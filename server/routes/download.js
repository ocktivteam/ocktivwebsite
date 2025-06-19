import express from "express";
const router = express.Router();

router.get("/download/:filename", async (req, res) => {
    const key = req.params.filename;
    const s3 = new AWS.S3();

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
    };

    try {
        s3.getObject(params, (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Download failed" });
            }

            res.setHeader("Content-Type", data.ContentType || "application/octet-stream");
            res.setHeader("Content-Disposition", `attachment; filename="${key}"`);
            res.send(data.Body);
        });
    } catch (err) {
        console.error("Download failed:", err);
        res.status(500).json({ error: "Download failed" });
    }
});

export default router;
