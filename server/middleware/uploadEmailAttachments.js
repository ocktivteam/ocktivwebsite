// middleware/uploadEmailAttachments.js
import multer from "multer";

const storage = multer.memoryStorage();
const MAX_MB = Number(process.env.EMAIL_MAX_FILE_MB || 15);

const allowed = new Set([
  "image/png","image/jpeg","image/webp","image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

function fileFilter(req, file, cb) {
  if (allowed.has(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file type"));
}

export const uploadEmailAttachments = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_MB * 1024 * 1024, files: Number(process.env.EMAIL_MAX_FILES || 5) }
}).array("attachments");