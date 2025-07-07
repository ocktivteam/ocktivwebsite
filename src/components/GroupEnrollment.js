import React, { useState } from "react";
import Layout from "./layout";
import "../style/Groups.css";

const Groups = () => {
  const title = "Groups";
  const [groups, setGroups] = useState([
    { name: "Group - 1", enrolled: 2, total: 5, members: ["Doe, Alex", "Abdul, Hala"], full: false },
    { name: "Group - 5", enrolled: 3, total: 5, members: ["Person 1", "Person 2", "Person 3"], full: false },
    { name: "Group - 2", enrolled: 5, total: 5, members: ["Person 4", "Person 5", "Person 6", "Person 7", "Person 8"], full: true },
    { name: "Group - 3", enrolled: 5, total: 5, members: ["Person 9", "Person 10", "Person 11", "Person 12", "Person 13"], full: true },
    { name: "Group - 4", enrolled: 5, total: 5, members: ["Person 14", "Person 15", "Person 16", "Person 17", "Person 18"], full: true }
  ]);
  const [user, setUser] = useState("Current User");

  const handleJoinGroup = (index) => {
    setGroups((prevGroups) => {
      return prevGroups.map((group, i) => {
        if (i === index && !group.full) {
          const updatedEnrolled = group.enrolled + 1;
          const updatedMembers = [...group.members, user];
          const isFull = updatedEnrolled === group.total;
          return { ...group, enrolled: updatedEnrolled, members: updatedMembers, full: isFull };
        }
        return group;
      });
    });
  };

  return (
    <div className="groups-container">
      <Layout title={title} />
      <h2 className="group-heading">Final Project Group Enrollment</h2>
      <table className="group-table">
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Enrolled Students</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, index) => (
            <tr key={index}>
              <td>{group.name}</td>
              <td>{`${group.enrolled}/${group.total}`}</td>
              <td>
                {group.full ? (
                  <span className="full">Full</span>
                ) : (
                  <button className="join-button" onClick={() => handleJoinGroup(index)}>
                    Join Group
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>See My Group</h3>
      <div className="my-group">
        {groups.map((group, index) =>
          group.members.includes(user) ? (
            <div key={index}>
              <h4>{group.name}</h4>
              <ul>
                {group.members.map((member, i) => (
                  <li key={i}>{member}</li>
                ))}
              </ul>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default Groups;
