import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { ModuleProgress } from "../models/ModuleProgress.js";
import { Certificate } from "../models/Certificate.js";
import { Quiz } from "../models/Quiz.js";
import { Module } from "../models/Module.js";
import mongoose from "mongoose";


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

/**
 * Determine if an update should move the course to the top
 */
function shouldMoveToTop(oldCourse, newData, updateType = 'manual') {
  // Case 1: First module upload - course becomes enrollable
  const wasNotEnrollable = !oldCourse.modules || oldCourse.modules.length === 0;
  const becomesEnrollable = newData.modules && newData.modules.length > 0;
  
  if (wasNotEnrollable && becomesEnrollable) {
    return { moveToTop: true, reason: 'first_module', updateType: 'module_added' };
  }

  // Case 2: Course already has modules - adding more modules shouldn't move to top
  if (oldCourse.modules && oldCourse.modules.length > 0 && updateType === 'module') {
    return { moveToTop: false, reason: 'subsequent_module', updateType: 'module_added' };
  }

  // Case 3: Admin updates - check what fields changed
  if (updateType === 'admin' || updateType === 'admin_significant') {
    const significantFields = ['courseTitle', 'description', 'certDesc', 'price', 'duration', 'courseType'];
    const nonSignificantFields = ['instructors', 'imageUrl'];

    let hasSignificantChange = false;
    let hasOnlyNonSignificantChange = true;

    // DEBUG: Print all values compared
    console.log('=== Significant Field Comparison ===');
    significantFields.forEach(field => {
      console.log(field, 'old:', oldCourse[field], 'new:', newData[field]);
    });
    console.log('=== End Debug ===');

    // Check if any significant fields changed (robust string check)
    for (const field of significantFields) {
      if (
        typeof newData[field] !== 'undefined' && 
        newData[field] != null && 
        String(newData[field]) !== String(oldCourse[field])
      ) {
        hasSignificantChange = true;
        hasOnlyNonSignificantChange = false;
        break;
      }
    }

    // Check if only non-significant fields changed
    if (!hasSignificantChange) {
      for (const field of nonSignificantFields) {
        if (field === 'instructors') {
          const current = [...(newData[field] || [])].sort();
          const original = [...(oldCourse[field] || [])].sort();
          if (JSON.stringify(current) !== JSON.stringify(original)) {
            return { moveToTop: false, reason: 'non_significant_update', updateType: 'admin_minor' };
          }
        } else if (
          typeof newData[field] !== 'undefined' && 
          newData[field] != null && 
          String(newData[field]) !== String(oldCourse[field])
        ) {
          return { moveToTop: false, reason: 'non_significant_update', updateType: 'admin_minor' };
        }
      }
    }

    // LOG FINAL DECISION
    const result = { moveToTop: hasSignificantChange, reason: hasSignificantChange ? 'significant_admin_update' : 'no_significant_change', updateType: hasSignificantChange ? 'admin_significant' : updateType };
    console.log('Should move to top result:', result);
    return result;
  }

  // Default: don't move to top
  return { moveToTop: false, reason: 'no_significant_change', updateType: updateType };
}

// CREATE a new course (multiple instructors supported)
export const createCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      lastSignificantUpdate: new Date(), // New courses always go to top
      wasEverEnrollable: req.body.modules && req.body.modules.length > 0,
      lastUpdateType: 'created'
    };
    
    const course = new Course(courseData);
    await course.save();
    res.status(201).json({ status: true, course });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
};

// READ all courses with proper sorting for filtering logic
export const getCourses = async (req, res) => {
  try {
    const { instructorId } = req.query;
    let query = {};
    if (instructorId) {
      query.instructors = instructorId;
    }
    
    const courses = await Course.find(query)
      .populate("instructors", "firstName lastName email")
      .populate("modules", "_id")
      .sort({
        // Primary sort: courses with recent significant updates first
        lastSignificantUpdate: -1,
        // Secondary sort: by creation date for courses never updated
        createdAt: -1
      });

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

// GET /api/courses/:id/news  (auth required)
// Returns modules/quizzes added or updated AFTER the student's enrollment date.
// Optional: ?since=ISO overrides the baseline (useful if you later add "mark all seen").
export const getCourseNewsForUser = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user?.id || req.user?._id; // set by jwtMiddleware

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ status: false, message: "Invalid course id" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    // Find this user's enrollment in the course
    const enrollment = await Enrollment.findOne({ course: courseId, user: userId })
      .select("createdAt");
    if (!enrollment) {
      // Not enrolled -> no news
      return res.json({ status: true, news: [] });
    }

    // Baseline: when they enrolled (or an optional ?since override)
    const override = req.query.since ? new Date(req.query.since) : null;
    const baseline = override && !isNaN(override.getTime()) ? override : enrollment.createdAt;

    // Pull modules/quizzes, compare updatedAt to baseline
    const [modules, quizzes] = await Promise.all([
      Module.find({ courseId }).select("_id moduleTitle createdAt updatedAt").sort({ updatedAt: -1 }),
      Quiz.find({ courseId, isPublished: true }).select("_id quizTitle createdAt updatedAt").sort({ updatedAt: -1 })
    ]);

    const items = [];

    for (const m of modules) {
      if (m.updatedAt > baseline) {
        items.push({
          type: "module",
          id: String(m._id),
          title: m.moduleTitle,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          activity: m.createdAt > baseline ? "added" : "updated"
        });
      }
    }

    for (const q of quizzes) {
      if (q.updatedAt > baseline) {
        items.push({
          type: "quiz",
          id: String(q._id),
          title: q.quizTitle,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
          activity: q.createdAt > baseline ? "added" : "updated"
        });
      }
    }

    items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return res.json({ status: true, news: items });
  } catch (err) {
    console.error("getCourseNewsForUser error:", err);
    return res.status(500).json({ status: false, message: "Failed to load news" });
  }
};


// UPDATE a course with smart filtering logic
export const updateCourse = async (req, res) => {
  try {
    // Get the current course first
    const oldCourse = await Course.findById(req.params.id).populate('modules');
    if (!oldCourse) return res.status(404).json({ status: false, message: "Course not found" });

    // Determine update type based on request source or data
    let updateType = 'admin'; // Default to admin since most updates come from admin dashboard
    if (req.body.updateType) {
      updateType = req.body.updateType; // Can be passed from frontend
      delete req.body.updateType; // Remove from actual update data
    } else if (req.headers['x-update-source']) {
      updateType = req.headers['x-update-source'];
    }

    // DEBUG: Print values being compared
    const significantFields = ['courseTitle', 'description', 'certDesc', 'price', 'duration', 'courseType'];
    console.log('=== updateCourse FIELD DEBUG ===');
    significantFields.forEach(field => {
      console.log(field, 'old:', oldCourse[field], 'new:', req.body[field]);
    });
    console.log('=== END FIELD DEBUG ===');

    // Check if this update should move course to top
    const moveDecision = shouldMoveToTop(oldCourse, req.body, updateType);

    // Prepare update data
    const updateData = { ...req.body };

    if (moveDecision.moveToTop) {
      updateData.lastSignificantUpdate = new Date();
    }

    // Update wasEverEnrollable if course becomes enrollable
    if (req.body.modules && req.body.modules.length > 0) {
      updateData.wasEverEnrollable = true;
    }

    updateData.lastUpdateType = moveDecision.updateType;

    const course = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ 
      status: true, 
      course,
      moveDecision // For debugging/frontend feedback
    });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
};

// NEW: Helper function to update course when modules change
export const updateCourseForModuleChange = async (courseId, isFirstModule = false) => {
  try {
    const course = await Course.findById(courseId).populate('modules');
    if (!course) return;

    const wasNotEnrollable = !course.wasEverEnrollable;
    const becomesEnrollable = course.modules && course.modules.length > 0;

    // Only move to top if this is the first module making course enrollable
    if (wasNotEnrollable && becomesEnrollable && isFirstModule) {
      await Course.findByIdAndUpdate(courseId, {
        lastSignificantUpdate: new Date(),
        wasEverEnrollable: true,
        lastUpdateType: 'first_module_added'
      });
    } else if (becomesEnrollable && !course.wasEverEnrollable) {
      // Backup check - mark as enrollable even if not first module
      await Course.findByIdAndUpdate(courseId, {
        wasEverEnrollable: true
      });
    }
  } catch (error) {
    console.error('Error updating course for module change:', error);
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

// GET: /api/courses/:id/classlist
export const getClassListForCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ status: false, message: "Invalid course id" });
    }

    // 1) Get course to know total modules
    const course = await Course.findById(courseId).populate("modules", "_id");
    if (!course) return res.status(404).json({ status: false, message: "Course not found" });
    const totalModules = Array.isArray(course.modules) ? course.modules.length : 0;

    // 2) Enrollments (students only)
    const enrollments = await Enrollment.find({ course: courseId })
      .populate({ path: "user", select: "firstName lastName email country role" });

    const students = enrollments
      .filter(e => e.user && (e.user.role === "student" || !e.user.role))
      .map(e => ({
        userId: String(e.user._id),
        fullName: `${e.user.firstName} ${e.user.lastName}`.trim(),
        email: e.user.email || "",
        country: e.user.country || "",
      }));

    if (students.length === 0) {
      return res.json({ status: true, students: [], meta: { totalModules, quizCount: 0 } });
    }
    const studentIds = students.map(s => new mongoose.Types.ObjectId(s.userId));

    // 3) Module progress for these students in this course
    const progressDocs = await ModuleProgress.find({
      courseId: courseId,
      userId: { $in: studentIds }
    }).select("userId status completed updatedAt");

    const perUserProgress = new Map(); // userId -> { started, completedCount, lastActive }
    for (const p of progressDocs) {
      const uid = String(p.userId);
      const cur = perUserProgress.get(uid) || { started: false, completedCount: 0, lastActive: null };
      if (p.status && p.status !== "not_started") cur.started = true;
      if (p.completed) cur.completedCount += 1;
      const ts = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
      if (!cur.lastActive || ts > cur.lastActive) cur.lastActive = ts;
      perUserProgress.set(uid, cur);
    }

    // 4) Quizzes + attempts (to detect "quiz started" AND pass state)
    const quizzes = await Quiz.find({ courseId })
      .select("_id questions passingRate studentAttempts");
    const quizCount = quizzes.length;

    // Prepare helpers for quiz status
    const quizStartedByUser = new Map(); // userId -> { started: true, latest: ts }
    const allQuizzesPassedByUser = new Map(); // userId -> boolean

    // Initialize map for all users as true (will AND over quizzes)
    for (const s of students) allQuizzesPassedByUser.set(s.userId, quizCount > 0 ? true : false);

    for (const q of quizzes) {
      const totalPoints = (q.questions || []).reduce((sum, qq) => sum + (qq.points || 1), 0);
      const passRate = typeof q.passingRate === "number" ? q.passingRate : 0.8;
      const passPoints = Math.ceil(totalPoints * passRate);

      // Build latest attempt per user for this quiz
      const latestByUser = new Map();
      for (const att of (q.studentAttempts || [])) {
        const uid = String(att.studentId);
        if (!studentIds.some(id => String(id) === uid)) continue;
        const existing = latestByUser.get(uid);
        if (!existing || new Date(att.submittedAt) > new Date(existing.submittedAt)) {
          latestByUser.set(uid, att);
        }
      }

      // Update per-user quiz started + pass state
      for (const s of students) {
        const uid = s.userId;
        const att = latestByUser.get(uid);
        const entry = quizStartedByUser.get(uid) || { started: false, latest: null };
        if (att) {
          entry.started = true;
          const ts = att.submittedAt ? new Date(att.submittedAt).getTime() : 0;
          if (!entry.latest || ts > entry.latest) entry.latest = ts;
          quizStartedByUser.set(uid, entry);

          const passed = typeof att.score === "number" ? (att.score >= passPoints) : false;
          const prevAll = allQuizzesPassedByUser.get(uid);
          allQuizzesPassedByUser.set(uid, prevAll && passed);
        } else {
          // No attempt => mark not started and not passed
          const prevAll = allQuizzesPassedByUser.get(uid);
          allQuizzesPassedByUser.set(uid, quizCount > 0 ? false : prevAll);
        }
      }
    }

    // 5) Certificates per user
    const certs = await Certificate.find({
      course: courseId,
      user: { $in: studentIds }
    }).select("user issuedDate");

    const certUsers = new Map(); // userId -> issuedAt ts
    for (const c of certs) {
      certUsers.set(String(c.user), c.issuedDate ? new Date(c.issuedDate).getTime() : null);
    }

    // 6) Merge -> output rows
    const out = students.map(s => {
      const prog = perUserProgress.get(s.userId) || { started: false, completedCount: 0, lastActive: null };
      const quiz = quizStartedByUser.get(s.userId) || { started: false, latest: null };
      const certTs = certUsers.get(s.userId) || null;

      const moduleProgressPct = totalModules > 0
        ? Math.round((prog.completedCount / totalModules) * 100)
        : 0;

      // Match AllContent.jsx logic: add a single "quiz step" if all quizzes are passed
      const quizStepExists = quizCount > 0;
      const allQuizzesPassed = allQuizzesPassedByUser.get(s.userId) || false;
      const totalSteps = totalModules + (quizStepExists ? 1 : 0);
      const completedSteps = prog.completedCount + (quizStepExists && allQuizzesPassed ? 1 : 0);
      const courseProgressPct = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

      const lastActive = Math.max(
        prog.lastActive || 0,
        quiz.latest || 0,
        certTs || 0
      ) || null;

      return {
        userId: s.userId,
        fullName: s.fullName,
        email: s.email,
        country: s.country,
        moduleProgressPct,
        courseProgressPct, // <- overall progress (modules + quiz step) like AllContent.jsx
        status: {
          moduleStarted: !!prog.started,
          quizStarted: !!quiz.started,
          certReceived: certUsers.has(s.userId),
        },
        lastActive: lastActive ? new Date(lastActive).toISOString() : null
      };
    });

    out.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return res.json({
      status: true,
      students: out,
      meta: { totalModules, quizCount }
    });
  } catch (err) {
    console.error("getClassListForCourse error:", err);
    return res.status(500).json({ status: false, message: "Failed to load class list" });
  }
};

