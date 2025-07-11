import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function CertificateViewer() {
  const { certId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Match backend URL to your deploy/local setup
  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5050"
      : "https://ocktivwebsite-3.onrender.com";

  useEffect(() => {
    async function fetchCert() {
      setLoading(true);
      try {
        // Fetch by certId: respond with certificateUrl (stored in DB)
        const res = await axios.get(`${backendURL}/api/certificate/${certId}`);
        setCertificate(res.data);
      } catch (err) {
        setError("Certificate not found or has expired.");
      } finally {
        setLoading(false);
      }
    }
    fetchCert();
  }, [certId, backendURL]);

  if (loading) return <div style={{ padding: 40 }}>Loading certificate...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
    
      {certificate?.certificateUrl ? (
        <img
          src={certificate.certificateUrl}
          alt="Certificate"
          style={{
            maxWidth: 800,
            width: "100%",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "2px solid #e0e0e0",
            background: "#fff",
          }}
        />
      ) : (
        <p>No certificate found.</p>
      )}
      {/* Button below removed as requested */}
    </div>
  );
}
