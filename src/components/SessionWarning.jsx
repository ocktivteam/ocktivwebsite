import React from 'react';

function SessionWarning({ open, onContinue, onLogout }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      background: "#ffd",
      border: "1px solid #c90",
      borderRadius: 8,
      padding: "16px 24px",
      zIndex: 1000,
      boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
    }}>
      <div style={{marginBottom: 8, fontWeight: "bold"}}>
        Your session will expire soon.
      </div>
      <button onClick={onContinue} style={{
        marginRight: 16,
        background: "#2c7",
        border: "none",
        borderRadius: 4,
        color: "#fff",
        padding: "6px 14px",
        cursor: "pointer",
      }}>
        Continue Session
      </button>
      <button onClick={onLogout} style={{
        background: "#eee",
        border: "1px solid #ccc",
        borderRadius: 4,
        color: "#333",
        padding: "6px 14px",
        cursor: "pointer",
      }}>
        Log Out Now
      </button>
    </div>
  );
}

export default SessionWarning;
