import { Module } from "../models/Module.js";
import AWS from "aws-sdk";
import multer from "multer";

// Helper function to patch file.key if missing
function ensureFileKey(file) {
  if (file.key) return file;
  if (file.url && file.url.startsWith("https://ocktiv-content.s3.ca-central-1.amazonaws.com/")) {
    const key = file.url.split("/").pop();
    return { ...file, key };
  }
  return file;
}

// CREATE module (with .key patch)
export const createModule = async (req, res) => {
  try {
    const { moduleTitle, description, files, courseId, createdBy } = req.body;

    // PATCH ALL FILES BEFORE SAVE
    const filesWithKeys = Array.isArray(files) ? files.map(ensureFileKey) : [];

    const newModule = await Module.create({
      moduleTitle,
      description,
      files: filesWithKeys,
      courseId,
      createdBy,
    });

    res.status(201).json(newModule);
  } catch (err) {
    res.status(500).json({ message: "Error creating module", error: err.message });
  }
};

// GET all modules by course ID
export const getModulesByCourse = async (req, res) => {
  try {
    const modules = await Module.find({ courseId: req.params.courseId }).sort({ createdAt: 1 });
    res.json({ status: true, modules });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error fetching modules", error: err.message });
  }
};

// GET single module by ID
export const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ status: false, message: "Module not found" });
    }
    res.json({ status: true, module });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error fetching module", error: err.message });
  }
};

// UPDATE module by ID (with .key patch)
export const updateModule = async (req, res) => {
  try {
    // PATCH ALL FILES BEFORE UPDATE (if files is present)
    if (req.body.files) {
      req.body.files = req.body.files.map(ensureFileKey);
    }
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!module) {
      return res.status(404).json({ status: false, message: "Module not found" });
    }

    res.json({ status: true, message: "Module updated", module });
  } catch (err) {
    res.status(400).json({ status: false, message: "Error updating module", error: err.message });
  }
};

// DELETE module by ID
export const deleteModule = async (req, res) => {
  try {
    const deleted = await Module.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: false, message: "Module not found" });
    }
    res.json({ status: true, message: "Module deleted" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error deleting module", error: err.message });
  }
};

//Upload controller

// Set up multer for in-memory file storage (buffer)
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

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

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${Date.now()}-${req.file.originalname}`,
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
