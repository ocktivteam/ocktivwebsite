import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/certificate.css"; // optional, for styling

export default function CertificateTab({ user, courseId }) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5050"
      : "https://ocktivwebsite-3.onrender.com";

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const { data } = await axios.post(`${backendURL}/api/certificate/generate`, {
          userId: user._id,
          courseId,
        });
        setCertificate(data);
      } catch (err) {
        console.error("Certificate fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [user._id, courseId, backendURL]);

  if (loading) return <p>Generating your certificate...</p>;
  if (!certificate) return <p>Something went wrong. Please try again later.</p>;

  return (
    <div className="certificate-wrapper">
      <h2>🎉 Congratulations on completing this course!</h2>
      <p>You can download or share your certificate below.</p>
      <div className="certificate-actions">
        <a
          href={certificate.certificateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="certificate-btn download-btn"
        >
          Download PDF
        </a>
        <button
          className="certificate-btn share-btn"
          onClick={() => navigator.clipboard.writeText(certificate.certificateUrl)}
        >
          Copy Shareable Link
        </button>
      </div>
      <iframe
        src={certificate.certificateUrl}
        title="Certificate Preview"
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid #ccc",
          marginTop: "20px",
        }}
      />
    </div>
  );
}
