import 'dotenv/config'; // This loads your .env automatically
import mongoose from "mongoose";
import { Course } from "../models/Course.js";
import { Module } from "../models/Module.js";

// Use the same env variable as your server!
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error("MONGO_URI is not set in .env file!");
  process.exit(1);
}

async function migrateCourses() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    const courses = await Course.find({}).populate('modules');
    console.log(`Found ${courses.length} courses to migrate`);

    for (const course of courses) {
      const updateData = {};
      if (!course.lastSignificantUpdate) updateData.lastSignificantUpdate = course.createdAt;
      if (course.wasEverEnrollable === undefined)
        updateData.wasEverEnrollable = course.modules && course.modules.length > 0;
      if (!course.lastUpdateType)
        updateData.lastUpdateType =
          course.modules && course.modules.length > 0
            ? "migrated_with_modules"
            : "migrated_no_modules";

      if (Object.keys(updateData).length > 0) {
        await Course.findByIdAndUpdate(course._id, updateData);
        console.log(`Migrated course: ${course.courseTitle}`);
      }
    }

    console.log("Course migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrateCourses();
