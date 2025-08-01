// import { Course } from "../models/Course.js";

// /**
//  * Join instructor names naturally (Oxford comma style):
//  * 1 instructor: "A"
//  * 2 instructors: "A & B"
//  * 3+ instructors: "A, B & C"
//  */
// function joinInstructorNames(instructors) {
//   if (!instructors || instructors.length === 0) return "";
//   const names = instructors.map(i => `${i.firstName} ${i.lastName}`.trim());
//   if (names.length === 1) return names[0];
//   if (names.length === 2) return names.join(" & ");
//   return names.slice(0, -1).join(", ") + " & " + names[names.length - 1];
// }

// // CREATE a new course (multiple instructors supported)
// export const createCourse = async (req, res) => {
//   try {
//     const course = new Course(req.body);
//     await course.save();
//     res.status(201).json({ status: true, course });
//   } catch (err) {
//     res.status(400).json({ status: false, message: err.message });
//   }
// };

// // READ all courses (optionally filter by instructor, populate instructors AND modules)
// export const getCourses = async (req, res) => {
//   try {
//     const { instructorId } = req.query;
//     let query = {};
//     if (instructorId) {
//       query.instructors = instructorId; // will match if instructorId is in the instructors array
//     }
//     const courses = await Course.find(query)
//       .populate("instructors", "firstName lastName email")
//       .populate("modules", "_id");

//     const result = courses.map(course => {
//       const c = course.toObject();
//       c.instructorNames = joinInstructorNames(c.instructors);
//       return c;
//     });

//     res.json({ status: true, courses: result });
//   } catch (err) {
//     res.status(500).json({ status: false, message: err.message });
//   }
// };
// // READ single course by id (populate instructors AND modules)
// export const getCourseById = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id)
//       .populate("instructors", "firstName lastName email")
//       .populate("modules", "_id");
//     if (!course) return res.status(404).json({ status: false, message: "Course not found" });

//     const result = course.toObject();
//     result.instructorNames = joinInstructorNames(result.instructors);

//     res.json({ status: true, course: result });
//   } catch (err) {
//     res.status(500).json({ status: false, message: err.message });
//   }
// };


// // UPDATE a course (accepts instructors as array)
// export const updateCourse = async (req, res) => {
//   try {
//     const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!course) return res.status(404).json({ status: false, message: "Course not found" });
//     res.json({ status: true, course });
//   } catch (err) {
//     res.status(400).json({ status: false, message: err.message });
//   }
// };

// // DELETE a course
// export const deleteCourse = async (req, res) => {
//   try {
//     const course = await Course.findByIdAndDelete(req.params.id);
//     if (!course) return res.status(404).json({ status: false, message: "Course not found" });
//     res.json({ status: true, message: "Course deleted" });
//   } catch (err) {
//     res.status(500).json({ status: false, message: err.message });
//   }
// };



// ==== July 31 ====


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
