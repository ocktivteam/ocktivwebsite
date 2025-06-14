import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";

// POST: Enroll user in a course
export const enrollUser = async (req, res) => {
  const { userId, courseId } = req.body;

  console.log("Enrollment request:", { userId, courseId });

  try {
    // Validate user
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
      return res.status(400).json({ message: "Only students can enroll." });
    }

    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
      return res.status(409).json({ message: "User already enrolled in this course." });
    }

    // Create enrollment
    const newEnrollment = new Enrollment({
      user: userId,
      course: courseId,
    });

    await newEnrollment.save();

    console.log("New Enrollment:", newEnrollment);

    return res.status(201).json({
      status: true,
      message: "Enrollment successful!",
      enrollment: newEnrollment,
    });

  } catch (error) {
    console.error("Enrollment error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};


export const getUserEnrollments = async (req, res) => {
  try {
    // Nested populate: course → instructorId
    const enrollments = await Enrollment.find({ user: req.params.userId })
      .populate({
        path: "course",
        populate: {
          path: "instructorId",
          select: "firstName lastName email"
        }
      });

    // Add instructorName to each course object for frontend
    const result = enrollments.map(enr => {
      const enrollmentObj = enr.toObject();
      if (enrollmentObj.course && enrollmentObj.course.instructorId) {
        enrollmentObj.course.instructorName = `${enrollmentObj.course.instructorId.firstName} ${enrollmentObj.course.instructorId.lastName}`.trim();
      } else {
        enrollmentObj.course.instructorName = "Ocktiv Instructor";
      }
      return enrollmentObj;
    });

    res.json({ status: true, enrollments: result });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
