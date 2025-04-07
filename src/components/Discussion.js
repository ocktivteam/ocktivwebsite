import React, { useState } from "react";
import Layout from "./layout";
import "../style/Discussion.css";
import Navbar from "./Navbar";

const Discussion = () => {
  const title = "Discussion";
  const [posts, setPosts] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const username = "Guest"; // Placeholder for user authentication

  const handlePost = () => {
    if (subject.trim() && message.trim()) {
      const newPost = {
        id: Date.now(),
        username,
        subject,
        message,
        timestamp: new Date().toLocaleString(),
      };
      setPosts([newPost, ...posts]);
      setSubject("");
      setMessage("");
    }
  };

  return (
    <div className="discussion-container">
      <Layout title={title} />
      <Navbar />
      
      {/* Post Thread Section */}
      <div className="post-thread">
        <h2>Start a Discussion</h2>
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          placeholder="Write your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <button onClick={handlePost}>Post</button>
      </div>
      
      {/* Posted Threads Section */}
      <div className="posted-threads">
        <h2>Discussion Threads</h2>
        {posts.length === 0 ? (
          <p>No discussions yet. Be the first to post!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post">
              <p className="post-user">{post.username}</p>
              <p className="post-date">{post.timestamp}</p>
              <p className="post-subject"><strong>Subject:</strong> {post.subject}</p>
              <p className="post-message">{post.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Discussion;