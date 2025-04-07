import React, { useState } from "react";
import Layout from "./layout";
import "../style/Grades.css";
import Navbar from "./Navbar";  

const Grades = () => {
  const title = "Gradesbook"; //Page title

  //Initial state with some sample grades
  const [grades, setGrades] = useState([
    { description: "Assignment 1", weightage: "10%", grade: "A+" },
    { description: "Assignment 2", weightage: "10%", grade: "Pending" },
    { description: "Midterm", weightage: "25%", grade: "Pending" },
    { description: "Quiz 1", weightage: "5%", grade: "Pending" },
    { description: "Quiz 2", weightage: "5%", grade: "Pending" },
    { description: "Assignment 3", weightage: "15%", grade: "Pending" }
  ]);

  return (
    <div>
      <Layout title={title} />
      <Navbar />
      <div className="grades-container">
        <table className="grades-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Weightage</th>
              <th>Grades</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>{item.weightage}</td>
                <td>{item.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Grades;

/*const addNewGrade = (newGrade) => {
  setGrades((prevGrades) => [...prevGrades, newGrade]); for admin page
};
*/ 