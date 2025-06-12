import { Course } from "../models/Course.js";

// CREATE a new course (unchanged)
export const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ status: true, course });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
};

// READ all courses (POPULATE INSTRUCTOR)
/* UPDATED */
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructorId", "firstName lastName email"); // Only get basic info

    // Add instructorName directly to each course (for easy frontend use)
    const result = courses.map(course => {
      const c = course.toObject();
      if (c.instructorId) {
        c.instructorName = `${c.instructorId.firstName} ${c.instructorId.lastName}`.trim();
      } else {
        c.instructorName = "Ocktiv Instructor";
      }
      return c;
    });

    res.json({ status: true, courses: result });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// READ single course by id (POPULATE INSTRUCTOR)
/* UPDATED */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructorId", "firstName lastName email");
    if (!course) return res.status(404).json({ status: false, message: "Course not found" });

    // Add instructorName for frontend
    const result = course.toObject();
    if (result.instructorId) {
      result.instructorName = `${result.instructorId.firstName} ${result.instructorId.lastName}`.trim();
    } else {
      result.instructorName = "Ocktiv Instructor";
    }

    res.json({ status: true, course: result });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// UPDATE a course (unchanged)
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ status: false, message: "Course not found" });
    res.json({ status: true, course });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
};

// DELETE a course (unchanged)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ status: false, message: "Course not found" });
    res.json({ status: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
