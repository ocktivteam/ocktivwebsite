import React from "react";
import Layout from "./layout";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../style/Academics.css";

const Academics = () => {
  const title = "Academics Home";

  const academicSections = [
    {
      title: "View Transcripts",
      links: [
        { name: "Apply for official transcript", path: "/official-transcript" },
        { name: "Unofficial transcript", path: "/unofficial-transcript" },
      ],
    },
    {
      title: "Time Table and Registration",
      links: [
        { name: "Step-1", path: "/registration-step-1" },
        { name: "Step-2", path: "/registration-step-2" },
        { name: "Step-3", path: "/registration-step-3" },
        { name: "Step-4", path: "/registration-step-4" },
      ],
    },
    {
      title: "Student Services",
      links: [
        { name: "Service - 1", path: "/student-service-1" },
        { name: "Service - 2", path: "/student-service-2" },
        { name: "Service - 3", path: "/student-service-3" },
        { name: "Service - 4", path: "/student-service-4" },
      ],
    },
    {
      title: "Advising Services",
      links: [
        { name: "Book appointment with an advisor", path: "/book-advisor" },
        { name: "Talk to IT support", path: "/it-support" },
      ],
    },
  ];

  return (
    <div>
      <Layout title={title} />
      <div className="academics-container">
        {academicSections.map((section, index) => (
          <div className="academics-card" key={index}>
            <h3>{section.title}</h3>
            <ul>
              {section.links.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="academics-link">
                    {link.name} <ArrowRight size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Academics;
