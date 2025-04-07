import React, { useState } from "react";
import Layout from "./layout";
import "../style/Finance.css";

const Fees = () => {
  const title = "Tuition Fee Estimator - University of Toronto";

  const [selectedSemester, setSelectedSemester] = useState("Fall");

 
  const semesterFees = {
    Fall: 9000,  
    Winter: 8500, 
    Summer: 6000, 
  };

 
  const paidAmount = {
    Fall: 3500,  
    Winter: 0,   
    Summer: 0,   
  };

  
  const semesterDueDates = {
    Fall: "September 15, 2025",
    Winter: "January 15, 2026",
    Summer: "May 15, 2026",
  };

  
  const totalFee = semesterFees[selectedSemester] || 0;
  const paidForSelectedSemester = paidAmount[selectedSemester] || 0;
  const remainingBalance = totalFee - paidForSelectedSemester;
  const dueDate = semesterDueDates[selectedSemester];

  return (
    <div className="fees-container">
      <Layout title={title} />
      <h2 className="fees-title">University of Toronto - Tuition Fees</h2>

     
      <div className="filter-section">
        <label>Select Semester:</label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="semester-dropdown"
        >
          <option value="Fall">Fall</option>
          <option value="Winter">Winter</option>
          <option value="Summer">Summer</option>
        </select>
      </div>

      
      <table className="fees-table">
        <thead>
          <tr>
            <th>Semester</th>
            <th>Total Fees (CAD)</th>
            <th>Paid Amount(CAD)</th>
            <th>Outstanding Amount (CAD)</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{selectedSemester}</td>
            <td>${totalFee}</td>
            <td>${paidForSelectedSemester}</td>
            <td className={remainingBalance > 0 ? "unpaid" : "paid"}>
              ${remainingBalance}
            </td>
            <td>{dueDate}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Fees;
