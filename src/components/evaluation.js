import React from "react";
import { Download } from "lucide-react"; // Import the download icon from Lucid React
import Layout from "./layout";
import "../style/evaluation.css";
import Navbar from "./Navbar";

const Evaluation = () => {
  const title = "Evaluation";

  // Dummy data for evaluations
  const evaluations = [
    {
      id: 1,
      title: "Assignment 1 - Introduction to Programming",
      description: "Dummy data.",
      dueDate: "March 20th, 2025",
      feedback: "Pending.",
      submissions: 1,
      instructionsLink: "/pdf/assignment-1.pdf",
      instructionsTitle: "Assignment 1 "
    },
    {
      id: 2,
      title: "Quiz 1 - JavaScript Basics",
      description: "Dummy data.",
      dueDate: "March 25th, 2025",
      feedback: "Grading in.",
      submissions: 0,
      instructionsLink: "/path/to/instructions2.pdf",
      instructionsTitle: "Quiz 1 "
    },
    {
      id: 3,
      title: "Assignment 2 - Web Development Basics",
      description: "This assignment involves creating a simple webpage using HTML, CSS, and JavaScript.",
      dueDate: "April 5th, 2025",
      feedback: "Pending.",
      submissions: 2,
      instructionsLink: "/path/to/instructions3.pdf",
      instructionsTitle: "Assignment 2 "
    },
    {
      id: 4,
      title: "Project - Personal Portfolio",
      description: "Dummy data.",
      dueDate: "April 15th, 2025",
      feedback: "pending.",
      submissions: 1,
      instructionsLink: "/path/to/instructions4.pdf",
      instructionsTitle: "Portfolio Project "
    },
    {
      id: 5,
      title: "Midterm Exam",
      description: "Dummy data.",
      dueDate: "April 30th, 2025",
      feedback: "Grading in progress.",
      submissions: 0,
      instructionsLink: "/path/to/instructions5.pdf",
      instructionsTitle: "Midterm Exam "
    }
  ];

  return (
    <div>
      <Layout title={title} />
      <Navbar />
      <div className="evaluation-container">
        <h2 className="evaluation-title">Evaluations</h2>

        {evaluations.map((evaluation) => (
          <div key={evaluation.id} className="evaluation-item">
            <h3 className="evaluation-item-title">{evaluation.title}</h3>

            <div className="evaluation-sections">
              <div className="evaluation-section">
                <h4 className="evaluation-section-title">Description</h4>
                <p className="evaluation-section-body">{evaluation.description}</p>
                <div className="download-instructions">
                  <span>Download the assignment instructions: {evaluation.instructionsTitle}</span>
                  <a href={evaluation.instructionsLink} download className="download-icon">
                    <Download size={20} /> 
                  </a>
                </div>
              </div>

              <div className="evaluation-section due-date-section">
                <h4 className="evaluation-section-title">Due Date</h4>
                <p className="evaluation-section-body">{evaluation.dueDate}</p>
                <p className="submissions-count">
                  {evaluation.submissions === 0
                    ? "No submissions yet"
                    : evaluation.submissions === 1
                    ? "1 submission"
                    : `${evaluation.submissions} submissions`}
                </p>
              </div>

              <div className="evaluation-section feedback-section">
                <h4 className="evaluation-section-title">Feedback</h4>
                <p className="evaluation-section-body">{evaluation.feedback}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Evaluation;