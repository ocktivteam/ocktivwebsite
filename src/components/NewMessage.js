import React, { useState } from 'react';
import Layout from "./layout";
import "../style/messages.css";

const NewMessage = () => {
    const title = "New Message";
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Function to toggle bold text
  const toggleBold = () => {
    setIsBold(!isBold);
  };

  // Function to toggle italic text
  const toggleItalic = () => {
    setIsItalic(!isItalic);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const fileName = e.target.files[0]?.name;
    alert(`File selected: ${fileName}`);
  };

  //insert image 
  const insertImage = () => {
    const imageUrl = prompt("Enter image URL:");
    setBody(body + `![Image](${imageUrl})`);
  };

  //send message
  const sendMessage = () => {
    if (!to || !from || !subject || !body) {
      alert("Please fill in all the required fields.");
      return;
    }
    alert(`Message sent to: ${to}\nSubject: ${subject}\nBody: ${body}`);
  };

  return (
    <div className="new-message-container">
      <Layout title={title} />

      {/* To, From, CC Fields */}
      <div className="email-fields">
        <div className="field">
          <label htmlFor="to">To:</label>
          <input
            type="email"
            id="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Recipient's email"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="from">From:</label>
          <input
            type="email"
            id="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Your email"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="cc">CC:</label>
          <input
            type="email"
            id="cc"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="CC email"
          />
        </div>
      </div>

      {/* Subject Field */}
      <div className="field">
        <label htmlFor="subject">Subject:</label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject"
          required
        />
      </div>

      {/* Rich Text Area (Body of the Email) */}
      <div className="email-body">
        <div className="toolbar">
          <button onClick={toggleBold} style={{ fontWeight: isBold ? 'bold' : 'normal' }}>B</button>
          <button onClick={toggleItalic} style={{ fontStyle: isItalic ? 'italic' : 'normal' }}>I</button>
          <input type="file" id="file-input" onChange={handleFileUpload} />
          <button onClick={insertImage}>📷</button>
        </div>
        <textarea
          id="email-text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message..."
          rows="10"
          style={{
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
          }}
        />
      </div>

      {/* Send Button */}
      <button id="send-btn" onClick={sendMessage}>Send</button>
    </div>
  );
};

export default NewMessage;
