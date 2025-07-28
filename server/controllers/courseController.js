import { Course } from "../models/Course.js";

/**
 * Join instructor names naturally (Oxford comma style):
 * 1 instructor: "A"
 * 2 instructors: "A & B"
 * 3+ instructors: "A, B & C"
 */
function joinInstructorNames(instructors) {
  if (!instructors || instructors.length === 0) return "";
  const names = instructors.map(i => `${i.firstName} ${i.lastName}`.trim());
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(" & ");
  return names.slice(0, -1).join(", ") + " & " + names[names.length - 1];
}

// CREATE a new course (multiple instructors supported)
export const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ status: true, course });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
};

// READ all courses (optionally filter by instructor, populate instructors AND modules)
export const getCourses = async (req, res) => {
  try {
    const { instructorId } = req.query;
    let query = {};
    if (instructorId) {
      query.instructors = instructorId; // will match if instructorId is in the instructors array
    }
    const courses = await Course.find(query)
      .populate("instructors", "firstName lastName email")
      .populate("modules", "_id");

    const result = courses.map(course => {
      const c = course.toObject();
      c.instructorNames = joinInstructorNames(c.instructors);
      return c;
    });

    res.json({ status: true, courses: result });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
// READ single course by id (populate instructors AND modules)
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructors", "firstName lastName email")
      .populate("modules", "_id");
    if (!course) return res.status(404).json({ status: false, message: "Course not found" });

    const result = course.toObject();
    result.instructorNames = joinInstructorNames(result.instructors);

    res.json({ status: true, course: result });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


// UPDATE a course (accepts instructors as array)
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
