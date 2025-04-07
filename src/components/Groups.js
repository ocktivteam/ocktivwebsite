import React, { useState } from "react";
import Layout from "./layout";
import "../style/Groups.css";
import Navbar from "./Navbar";

const Groups = () => {
  const title = "Groups";
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleClick = (groupName) => {
    setSelectedGroup(groupName);
  };

  return (
    <div className="groups-container">
      <Layout title={title} />
      <Navbar />
      <h2 className="group-heading">See available groups</h2>
      <div className="group-list">
        <div className="group-item" onClick={() => handleClick("Assignment #2")}>
          See available group for Assignment #2
        </div>
        <div className="group-item" onClick={() => handleClick("Final Project")}>
          See available group for Final Project
        </div>
      </div>
      {selectedGroup && (
        <div className="group-enrollment">
          <h3>Final Project Group Enrollment</h3>
          <table>
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Enrolled Students</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Group - 1</td>
                <td>2/5</td>
                <td><button>Join Group</button></td>
              </tr>
              <tr>
                <td>Group - 5</td>
                <td>3/5</td>
                <td><button>Join Group</button></td>
              </tr>
              <tr>
                <td>Group - 2</td>
                <td>5/5</td>
                <td>Full</td>
              </tr>
              <tr>
                <td>Group - 3</td>
                <td>5/5</td>
                <td>Full</td>
              </tr>
              <tr>
                <td>Group - 4</td>
                <td>5/5</td>
                <td>Full</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Groups;
