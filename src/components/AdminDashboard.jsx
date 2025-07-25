// src/components/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import AdminDashboardNavbar from "./adminDashboardNavbar";
import InstructorList from "./InstructorList";
import CoursesGrid from "./CoursesGrid";
import axios from "axios";
import "../style/adminDashboard.css";
import { useSessionCheck } from '../hooks/useSessionCheck';

const INSTRUCTOR_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/auth/instructors"
    : "https://ocktivwebsite-3.onrender.com/auth/instructors";

const COURSES_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/courses"
    : "https://ocktivwebsite-3.onrender.com/api/courses";

export default function AdminDashboard() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [allInstructors, setAllInstructors] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  useSessionCheck();

  // Fetch all instructors & courses on mount
  useEffect(() => {
    axios.get(INSTRUCTOR_API)
      .then(res => {
        setAllInstructors(res.data.instructors || []);
        console.log("RAW INSTRUCTORS:", res.data.instructors || []);
      });
    axios.get(COURSES_API)
      .then(res => {
        setAllCourses(res.data.courses || []);
        console.log("RAW COURSES:", res.data.courses || []);
      });
  }, []);

  // ADD THIS: Instructor delete logic
  function handleDeleteInstructor(instructorId) {
    setAllInstructors(list => list.filter(i => i._id !== instructorId));
    axios.delete(`${INSTRUCTOR_API}/${instructorId}`).catch(() => {
      // Optionally: refetch instructors or show an error
    });
    if (selected === instructorId) setSelected(null);
  }

  // Filtering logic with debug
  let filteredInstructors = allInstructors;
  let filteredCourses = allCourses;
  const q = search.trim().toLowerCase();

  console.log("SEARCH QUERY:", q);

  if (q) {
    // Search by course title (case insensitive)
    const coursesByTitle = allCourses.filter(course =>
      (course.courseTitle || "").toLowerCase().includes(q)
    );
    console.log("COURSES BY TITLE:", coursesByTitle);

    if (coursesByTitle.length > 0) {
      // Show only instructors who teach those courses
      const instructorIds = new Set();
      coursesByTitle.forEach(course => {
        (course.instructors || []).forEach(idOrObj => {
          // Accept both ObjectId object and string
          if (typeof idOrObj === "string") {
            instructorIds.add(idOrObj);
          } else if (idOrObj && idOrObj._id) {
            instructorIds.add(idOrObj._id.toString());
          }
        });
      });
      filteredCourses = coursesByTitle;
      filteredInstructors = allInstructors.filter(instr =>
        instructorIds.has(instr._id.toString())
      );
      console.log("INSTRUCTORS FOR MATCHING COURSES:", filteredInstructors);
    } else {
      // Search by instructor name or email
      const instructorsByText = allInstructors.filter(instr =>
        (`${instr.firstName || ""} ${instr.lastName || ""}`.toLowerCase().includes(q) ||
          (instr.fullName || "").toLowerCase().includes(q) ||
          (instr.name || "").toLowerCase().includes(q) ||
          (instr.email || "").toLowerCase().includes(q))
      );
      console.log("INSTRUCTORS BY NAME/EMAIL:", instructorsByText);

      if (instructorsByText.length > 0) {
        // Show all courses those instructors teach
        const instrIds = instructorsByText.map(i => i._id.toString());
        filteredInstructors = instructorsByText;
        filteredCourses = allCourses.filter(course =>
          (course.instructors || []).some(idOrObj =>
            instrIds.includes(
              typeof idOrObj === "string"
                ? idOrObj
                : idOrObj && idOrObj._id
                  ? idOrObj._id.toString()
                  : ""
            )
          )
        );
        console.log("COURSES FOR MATCHING INSTRUCTOR:", filteredCourses);
      } else {
        // No matches at all
        filteredInstructors = [];
        filteredCourses = [];
        console.log("NO MATCHES FOUND");
      }
    }
  }

  // Debug: Print filtered results
  console.log("FINAL FILTERED INSTRUCTORS:", filteredInstructors);
  console.log("FINAL FILTERED COURSES:", filteredCourses);

  // Auto-clear selection if current selected is not in filtered list
  useEffect(() => {
    if (selected && !filteredInstructors.some(i => i._id === selected)) {
      setSelected(null);
    }
    // eslint-disable-next-line
  }, [search, filteredInstructors]);

  return (
    <div>
      <AdminDashboardNavbar />
      <div className="dashboard-content-wrapper">
        <InstructorList
          selected={selected}
          setSelected={setSelected}
          instructors={filteredInstructors}
          search={search}
          setSearch={setSearch}
          onDelete={handleDeleteInstructor}
        />
        <main className="main-content">
          <CoursesGrid
            selectedInstructor={selected}
            instructors={allInstructors}
            courses={filteredCourses}
            onDeleteCourse={courseId => {
              setAllCourses(allCourses => allCourses.filter(c => c._id !== courseId));
            }}
          />
        </main>
      </div>
    </div>
  );
}
