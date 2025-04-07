import React from "react";
import { useParams } from "react-router-dom";
import Layout from "./layout";
import Navbar from "./Navbar";

const courseNames = {
  "comp123": "COMP 123 - Introduction to Programming",
  "comp122": "COMP 125 - Web Development",
  "comp124": "COMP 228 - Java Programming",
  "comp125": "COMP 249 - Advanced Java Programming",
  "comp126": "COMP 352 - Data Structures and Algorithms",
};

const Content = () => {
  const { courseId } = useParams();

  console.log("Course ID from URL:", courseId); 

  
  const formattedCourseId = courseId ? courseId.toLowerCase() : "";
  const courseName = courseNames[formattedCourseId] || "Course Not Found";
  const title = `Content to MVP`;

  return (
    <>
      <Layout title={title}>
        <div className="content">
          
          <p>This is the content of {courseName}.</p>
        </div>
      </Layout>

      <Navbar />
    </>
  );
};

export default Content;
