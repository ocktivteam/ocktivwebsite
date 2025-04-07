import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react"; 
import Layout from "./layout";
import "../style/messages.css";

const emails = [
  { id: 1, sender: "Professor Smith", subject: "Assignment 3 Due", time: "10:45 AM", body: "Reminder: Assignment 3 is due tomorrow at midnight." },
  { id: 2, sender: "Admin Office", subject: "Grades Released", time: "Yesterday", body: "Your midterm grades are now available on the portal." },
  { id: 3, sender: "Course Coordinator", subject: "New Announcement", time: "March 15", body: "Please check the updates regarding the final project." },
];

const Messages = () => {
  const title = "Inbox";
  const [selectedEmail, setSelectedEmail] = useState(null);

  return (
    <div className="inbox-container">
      <Layout title={title} />
      <div className="inbox-wrapper">
        
        
        <div className="inbox-header">
          <h2>Inbox</h2>
          <Link to="/new-message" className="new-message-btn">
            <Mail className="icon" /> Write Message
          </Link>
        </div>

        {/* Email List */}
        <div className="email-list">
          {emails.map((email) => (
            <div
              key={email.id}
              className={`email-item ${selectedEmail === email.id ? "selected" : ""}`}
              onClick={() => setSelectedEmail(email.id)}
            >
              <span className="sender">{email.sender}</span>
              <span className="subject">{email.subject}</span>
              <span className="time">{email.time}</span>
            </div>
          ))}
        </div>

        {/* Email Preview Panel */}
        <div className="email-preview">
          {selectedEmail ? (
            <>
              <h2>{emails.find((e) => e.id === selectedEmail)?.subject}</h2>
              <h4>From: {emails.find((e) => e.id === selectedEmail)?.sender}</h4>
              <p>{emails.find((e) => e.id === selectedEmail)?.body}</p>
            </>
          ) : (
            <p>Select a message to read</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
