// import { Module } from "../models/Module.js";
// import { Course } from "../models/Course.js"; // ADD THIS IMPORT
// import AWS from "aws-sdk";
// import multer from "multer";

// // Helper function to patch file.key if missing
// function ensureFileKey(file) {
//   if (file.key) return file;
//   if (file.url && file.url.startsWith("https://ocktiv-content.s3.ca-central-1.amazonaws.com/")) {
//     const key = file.url.split("/").pop();
//     return { ...file, key };
//   }
//   return file;
// }

// // CREATE module (with .key patch)
// export const createModule = async (req, res) => {
//   try {
//     const { moduleTitle, description, files, courseId, createdBy } = req.body;

//     // PATCH ALL FILES BEFORE SAVE
//     const filesWithKeys = Array.isArray(files) ? files.map(ensureFileKey) : [];

//     const newModule = await Module.create({
//       moduleTitle,
//       description,
//       files: filesWithKeys,
//       courseId,
//       createdBy,
//     });

//     // PATCH: Add the new module _id to the course's modules array
//     await Course.findByIdAndUpdate(
//       courseId,
//       { $addToSet: { modules: newModule._id } }, // $addToSet prevents duplicates
//       { new: true }
//     );

//     res.status(201).json(newModule);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating module", error: err.message });
//   }
// };

// // GET all modules by course ID
// export const getModulesByCourse = async (req, res) => {
//   try {
//     const modules = await Module.find({ courseId: req.params.courseId }).sort({ createdAt: 1 });
//     res.json({ status: true, modules });
//   } catch (err) {
//     res.status(500).json({ status: false, message: "Error fetching modules", error: err.message });
//   }
// };

// // GET single module by ID
// export const getModuleById = async (req, res) => {
//   try {
//     const module = await Module.findById(req.params.id);
//     if (!module) {
//       return res.status(404).json({ status: false, message: "Module not found" });
//     }
//     res.json({ status: true, module });
//   } catch (err) {
//     res.status(500).json({ status: false, message: "Error fetching module", error: err.message });
//   }
// };

// // UPDATE module by ID (with .key patch)
// export const updateModule = async (req, res) => {
//   try {
//     // PATCH ALL FILES BEFORE UPDATE (if files is present)
//     if (req.body.files) {
//       req.body.files = req.body.files.map(ensureFileKey);
//     }
//     const module = await Module.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!module) {
//       return res.status(404).json({ status: false, message: "Module not found" });
//     }

//     res.json({ status: true, message: "Module updated", module });
//   } catch (err) {
//     res.status(400).json({ status: false, message: "Error updating module", error: err.message });
//   }
// };

// // DELETE module by ID
// export const deleteModule = async (req, res) => {
//   try {
//     const deleted = await Module.findByIdAndDelete(req.params.id);
//     if (!deleted) {
//       return res.status(404).json({ status: false, message: "Module not found" });
//     }
//     // PATCH: Optionally, remove the module from the course's modules array
//     await Course.updateMany(
//       { modules: deleted._id },
//       { $pull: { modules: deleted._id } }
//     );
//     res.json({ status: true, message: "Module deleted" });
//   } catch (err) {
//     res.status(500).json({ status: false, message: "Error deleting module", error: err.message });
//   }
// };

// //Upload controller

// // Set up multer for in-memory file storage (buffer)
// const storage = multer.memoryStorage();
// export const upload = multer({ storage: storage });

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// // Controller to handle file upload to S3
// export const uploadFileToS3 = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded." });
//     }

//     const params = {
//       Bucket: process.env.AWS_S3_BUCKET,
//       Key: `${Date.now()}-${req.file.originalname}`,
//       Body: req.file.buffer,
//       ContentType: req.file.mimetype,
//       //ACL: "public-read",
//     };

//     // Upload to S3
//     const data = await s3.upload(params).promise();

//     // Respond with the file URL and S3 key
//     res.json({ url: data.Location, key: data.Key });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Upload failed" });
//   }
// };

// === July 31 ===


import { Module } from "../models/Module.js";
import { Course } from "../models/Course.js";

// Helper function to patch file.key if missing
function ensureFileKey(file) {
  if (file.key) return file;
  if (file.url && file.url.startsWith("https://ocktiv-content.s3.ca-central-1.amazonaws.com/")) {
    const key = file.url.split("/").pop();
    return { ...file, key };
  }
  return file;
}

// Helper function to check if course should move to top for first module
async function checkAndUpdateCourseForFirstModule(courseId) {
  try {
    const course = await Course.findById(courseId).populate('modules');
    if (!course) return;

    // Check if this is the first module being added to a course that was never enrollable
    const wasNeverEnrollable = !course.wasEverEnrollable;
    const hasModulesNow = course.modules && course.modules.length === 1; 

    if (wasNeverEnrollable && hasModulesNow) {
      // This is the first module - move course to top
      await Course.findByIdAndUpdate(courseId, {
        lastSignificantUpdate: new Date(),
        wasEverEnrollable: true,
        lastUpdateType: 'first_module_added'
      });
      console.log(`Course ${courseId} moved to top - first module added`);
    } else if (course.modules && course.modules.length > 0 && !course.wasEverEnrollable) {
      // Mark as enrollable but don't move to top (edge case)
      await Course.findByIdAndUpdate(courseId, {
        wasEverEnrollable: true
      });
    }
  } catch (error) {
    console.error('Error updating course for first module:', error);
  }
}


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

// GET all modules by course ID
export const getModulesByCourse = async (req, res) => {
  try {
    const modules = await Module.find({ courseId: req.params.courseId }).sort({ createdAt: 1 });
    res.json({ status: true, modules });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error fetching modules", error: err.message });
  }
};

// CREATE module (with course filtering logic)
export const createModule = async (req, res) => {
  try {
    const { moduleTitle, description, files, courseId, createdBy } = req.body;

    // Check course state before adding module
    const courseBeforeUpdate = await Course.findById(courseId).populate('modules');
    const wasNotEnrollable = !courseBeforeUpdate || courseBeforeUpdate.modules.length === 0;

    // PATCH ALL FILES BEFORE SAVE
    const filesWithKeys = Array.isArray(files) ? files.map(ensureFileKey) : [];

    const newModule = await Module.create({
      moduleTitle,
      description,
      files: filesWithKeys,
      courseId,
      createdBy,
    });

    // Add the new module _id to the course's modules array
    await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { modules: newModule._id } },
      { new: true }
    );

    // Check if this was the first module and update course accordingly
    if (wasNotEnrollable) {
      await checkAndUpdateCourseForFirstModule(courseId);
    }

    res.status(201).json(newModule);
  } catch (err) {
    res.status(500).json({ message: "Error creating module", error: err.message });
  }
};

// DELETE module by ID
export const deleteModule = async (req, res) => {
  try {
    const moduleToDelete = await Module.findById(req.params.id);
    if (!moduleToDelete) {
      return res.status(404).json({ status: false, message: "Module not found" });
    }

    const courseId = moduleToDelete.courseId;
    
    // Delete the module
    const deleted = await Module.findByIdAndDelete(req.params.id);
    
    // Remove the module from the course's modules array
    await Course.findByIdAndUpdate(
      courseId,
      { $pull: { modules: deleted._id } }
    );

    // Check if course has no modules left - mark as not enrollable
    const updatedCourse = await Course.findById(courseId).populate('modules');
    if (updatedCourse && updatedCourse.modules.length === 0) {
      await Course.findByIdAndUpdate(courseId, {
        wasEverEnrollable: false // Reset enrollable status
      });
    }

    res.json({ status: true, message: "Module deleted" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error deleting module", error: err.message });
  }
};
