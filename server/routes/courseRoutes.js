// import express from "express";
// import {
//   createCourse,
//   getCourses,
//   getCourseById,
//   updateCourse,
//   deleteCourse
// } from "../controllers/courseController.js";

// const router = express.Router();

// router.post("/test", (req, res) => {
//   res.json({ test: true });
// });

// // Create
// router.post("/", createCourse);

// // Read all
// router.get("/", getCourses);

// // Read one
// router.get("/:id", getCourseById);

// // Update
// router.put("/:id", updateCourse);

// // Delete
// router.delete("/:id", deleteCourse);

// export { router as courseRouter };


//========Jun25==========

import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} from "../controllers/courseController.js";

const router = express.Router();

router.post("/test", (req, res) => {
  res.json({ test: true });
});

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export { router as courseRouter };
