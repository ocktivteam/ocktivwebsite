import React from "react";
import Layout from "./layout";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../style/Finance.css";

const Finance = () => {
  const title = "Finance";

  const financeSections = [
    {
      title: "Fee Estimate",
      links: [
        { name: "View Fees Estimate", path: "/view-fees" },
        { name: "Pay your fees", path: "/pay-fees" },
      ],
    },
    {
      title: "Scholarship and Bursaries",
      links: [
        { name: "Scholarship 1", path: "/scholarship-1" },
        { name: "Scholarship 2", path: "/scholarship-2" },
        { name: "Scholarship 3", path: "/scholarship-3" },
        { name: "Scholarship 4", path: "/scholarship-4" },
      ],
    },
    {
      title: "Banking Information",
      links: [
        { name: "Submit Banking Information", path: "/banking-info" },
        { name: "Download your receipts", path: "/receipts" },
      ],
    },
  ];

  return (
    <div>
      <Layout title={title} />
      <div className="finance-container">
        {financeSections.map((section, index) => (
          <div className="finance-card" key={index}>
            <h3>{section.title}</h3>
            <ul>
              {section.links.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="finance-link">
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

export default Finance;
