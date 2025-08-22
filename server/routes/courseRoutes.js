// import express from "express";
// import {
//   createCourse,
//   getCourses,
//   getCourseById,
//   updateCourse,
//   deleteCourse,
//   getClassListForCourse
// } from "../controllers/courseController.js";

// const router = express.Router();

// router.post("/test", (req, res) => {
//   res.json({ test: true });
// });

// router.post("/", createCourse);
// router.get("/", getCourses);
// router.get("/:id", getCourseById);
// router.get("/:id/classlist", getClassListForCourse);
// router.put("/:id", updateCourse);
// router.delete("/:id", deleteCourse);

// export { router as courseRouter };


// routes/courseRoutes.js
import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getClassListForCourse
} from "../controllers/courseController.js";


import { jwtMiddleware } from "../middleware/jwtMiddleware.js";
import { requireRole } from "../middleware/checkAdmin.js";
import { getCourseNewsForUser } from "../controllers/courseController.js";

const router = express.Router();

router.post("/test", (req, res) => {
  res.json({ test: true });
});

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.get("/:id/news", jwtMiddleware, getCourseNewsForUser);

router.get(
  "/:id/classlist",
  jwtMiddleware,
  requireRole(["instructor", "admin"]),
  getClassListForCourse
);

router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export { router as courseRouter };
