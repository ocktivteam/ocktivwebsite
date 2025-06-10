import { Course } from "../models/Course.js";

// CREATE a new course
export const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ status: true, course });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
};

// READ all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ status: true, courses });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// READ single course by id
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ status: false, message: "Course not found" });
    res.json({ status: true, course });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// UPDATE a course
export const updateCourse = async (req, res) => {
    try {
      const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!course) return res.status(404).json({ status: false, message: "Course not found" });
      res.json({ status: true, course });
    } catch (err) {
      res.status(400).json({ status: false, message: err.message });
    }
  };

// DELETE a course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ status: false, message: "Course not found" });
    res.json({ status: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
