import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/certificate.css";

export default function CertificateTab({ user, courseId }) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const calledRef = useRef(false);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [effectiveUser, setEffectiveUser] = useState(user);
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const frontendDomain =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://ocktivwebsite.vercel.app";

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5050"
      : "https://ocktivwebsite-3.onrender.com";

  const AUTH_PROFILE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5050/auth/profile"
      : "https://ocktivwebsite-3.onrender.com/auth/profile";

  // Build localStorage key to remember confirmation per user+course
  const confirmedKey =
    effectiveUser?._id && courseId
      ? `certConfirmed_${effectiveUser._id}_${courseId}`
      : null;

  // --- Generate certificate ---
  const fetchCertificate = async () => {
    try {
      const uid = effectiveUser?._id || user?._id;
      const { data } = await axios.post(`${backendURL}/api/certificate/generate`, {
        userId: uid,
        courseId,
      });

      
    if (data?.pending) {
      // backend signals "still generating"
      setPending(true);
      setCertificate(null);

      // poll every 3s
      setTimeout(fetchCertificate, 3000);
      return;
    }
    
  //     // On success, ensure the "confirmed" flag is set (defense-in-depth)
  //     if (confirmedKey) localStorage.setItem(confirmedKey, "true");
  //     setCertificate(data);
  //   } catch (err) {
  //     setCertificate(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  if (confirmedKey) localStorage.setItem(confirmedKey, "true");
  setCertificate(data);
  setPending(false);
} catch (err) {
  console.error("Error generating certificate:", err);
  setCertificate(null);
  setPending(false);
} finally {
  setLoading(false);
}
};

  // Refresh effectiveUser from prop -> localStorage -> server (freshest)
  useEffect(() => {
    let cancelled = false;
    const mergeUsers = (base, override) =>
      base && override && base._id === override._id ? { ...base, ...override } : (override || base);

    const refreshUser = async () => {
      let candidate = user || null;

      // 1) localStorage.user (Profile saves this)
      try {
        const ls = JSON.parse(localStorage.getItem("user") || "null");
        if (ls && (!candidate || ls._id === candidate._id)) candidate = mergeUsers(candidate, ls);
      } catch {}

      // 2) server /auth/profile (authoritative if token exists)
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const resp = await axios.get(AUTH_PROFILE_URL, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resp?.data?.status && resp?.data?.user) {
            const srv = resp.data.user;
            if (!candidate || srv._id === candidate._id) candidate = mergeUsers(candidate, srv);
          }
        }
      } catch {}

      if (!cancelled) setEffectiveUser(candidate || user || null);
    };

    refreshUser();
    return () => {
      cancelled = true;
    };
  }, [user]);

// Decide whether to show the modal or load existing cert
useEffect(() => {
  if (calledRef.current || !effectiveUser?._id || !courseId) return;

  const key = `certConfirmed_${effectiveUser._id}_${courseId}`;
  const nameEditedKey = `legalNameEditedOnce_${effectiveUser._id}`;
  const alreadyEdited = localStorage.getItem(nameEditedKey) === "true";

  const checkCertificate = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/certificate/by-user-course`, {
        params: { userId: effectiveUser._id, courseId },
      });

      if (res.data.exists) {
        // Cert exists → load it
        setCertificate(res.data.certificate);
        setShowConfirmModal(false);
        localStorage.setItem(key, "true");
        calledRef.current = true;
      } else {
        // Cert missing
        localStorage.removeItem(key);

        if (alreadyEdited) {
          // Student already edited legal name once → skip modal
          setShowConfirmModal(false);
          calledRef.current = true;
          fetchCertificate(); // go straight to generation
        } else {
          // Show modal normally
          setShowConfirmModal(true);
        }
      }
    } catch (err) {
      console.error("Error checking cert:", err);
    } finally {
      setLoading(false);
    }
  };

  checkCertificate();
}, [effectiveUser?._id, courseId]);


  // Close share popup when clicking outside
  useEffect(() => {
    function handler(e) {
      if (
        !e.target.closest(".certificate-share-popup") &&
        !e.target.closest(".share-btn")
      ) {
        setShowShare(false);
      }
    }
    if (showShare) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showShare]);

  // Modal actions
  const handleConfirmGenerate = () => {
    setShowConfirmModal(false);
    if (calledRef.current) return;
  
    // Mark confirmed so modal won’t reappear for this course
    if (confirmedKey) localStorage.setItem(confirmedKey, "true");
  
    calledRef.current = true;
    fetchCertificate(); // <-- only triggered when user explicitly confirms
  };
  
  const handleGoToProfile = () => {
    setShowConfirmModal(false);
    navigate("/profile", { replace: true, state: { from: "certificate" } });
  };

  // === MODAL RENDER ===
  if (showConfirmModal) {
    const ln = (effectiveUser?.legalName || "").trim();
    const fallbackFull = `${effectiveUser?.firstName || ""} ${effectiveUser?.lastName || ""}`.trim();
    const legalNameToShow = ln || fallbackFull;

    return (
      <>
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "min(600px, 92vw)",
              background: "#fff",
              borderRadius: "14px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              padding: "24px 24px 18px",
              fontFamily: "inherit",
            }}
          >
            <h2 style={{ margin: 0, marginBottom: 10, fontSize: 20, fontWeight: 700 }}>
              Confirm Your Legal Name
            </h2>
            <p style={{ margin: "6px 0 12px", lineHeight: 1.5, color: "#333" }}>
              Please review your full legal name exactly as it will appear on your certificate:
            </p>
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                background: "#f6f7fb",
                border: "1px solid #e5e7f1",
                fontWeight: 600,
              }}
            >
              {legalNameToShow || "Your Full Legal Name"}
            </div>
            <p
              style={{
                margin: "8px 0 16px",
                lineHeight: 1.5,
                color: "#8a182b",
                fontWeight: 600,
              }}
            >
              ⚠️ Please ensure your full legal name is correct. After your certificate is
              issued, changes can only be made by contacting support@ocktiv.com.
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
              <button
                type="button"
                onClick={handleGoToProfile}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #d0d5dd",
                  background: "#1252ff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                No, I want to change it now
              </button>
              <button
                type="button"
                onClick={handleConfirmGenerate}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #1252ff",
                  background: "#1252ff",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Yes, it is correct
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // // Loading / error states
  // if (!effectiveUser || !effectiveUser._id || !courseId || loading)
  //   return <p>Loading certificate info...</p>;

  // if (!certificate)
  //   return <p>Something went wrong. Please try again later.</p>;

  // Loading state first
  if (loading) {
    return <p>Loading certificate info...</p>;
  }
  
  if (pending) {
    return <p>Generating your certificate… please wait.</p>;
  }
  
  if (!certificate) {
    return <p>Something went wrong. Please try again later.</p>;
  }
  

  // Certificate content
  const {
    studentName = "Student Name",
    courseName = "Course Name",
    instructor = "Instructor Name",
    completionDate,
    certId = "CertID",
    certificateUrl = "#",
  } = certificate;

  let formattedDate = "Date of Completion";
  if (completionDate) {
    const date = new Date(completionDate);
    formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const brandedLink = `${frontendDomain}/certificates/${certId}`;
  const shareLink = certificateUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/certificate/download/${certId}`);
      const presignedUrl = res.data.url;
      const a = document.createElement("a");
      a.href = presignedUrl;
      a.download = `${studentName}-${courseName}-certificate.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download certificate. Please try again.");
    }
  };

  return (
    <div className="certificate-outer-container">
      {/* HEADER */}
      <div className="certificate-header-row">
        <div>
          <h1 className="certificate-main-header">Congratulations for completing this course!</h1>
        </div>
        <div className="certificate-action-buttons">
          {/* Share button + popup */}
          <div className="certificate-share-container">
            <button
              className="certificate-btn share-btn"
              onClick={() => setShowShare((v) => !v)}
              type="button"
            >
              Share Certificate
            </button>
            {showShare && (
              <div className="certificate-share-popup">
                <div className="share-popup-title">Share</div>
                <div className="share-popup-icons">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on Facebook"
                  >
                    <img src="/img/facebook.png" alt="Facebook" className="share-icon" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on LinkedIn"
                  >
                    <img src="/img/linkedin.png" alt="LinkedIn" className="share-icon" />
                  </a>
                </div>
                <div className="share-popup-label">Manually copy the URL for sharing</div>
                <div className="share-popup-url-row">
                  <input className="share-popup-url" value={shareLink} readOnly onClick={handleCopy} />
                  <button className="copy-btn" onClick={handleCopy} type="button" tabIndex={-1}>
                    <span role="img" aria-label="Copy">
                      📋
                    </span>
                  </button>
                </div>
                {copied && <div className="copy-toast">Link copied!</div>}
              </div>
            )}
          </div>
          {/* Download button */}
          <button className="certificate-btn download-btn" onClick={handleDownload} type="button">
            Download Certificate
          </button>
        </div>
      </div>

      {/* CERTIFICATE IMAGE */}
      <div className="certificate-image-wrapper">
        <img src={certificateUrl} alt="Certificate" className="certificate-image" />
      </div>

      {/* DESCRIPTION */}
      <div className="certificate-description">
        <p>
          This certificate confirms that <b>{studentName}</b> has successfully completed the <b>{courseName}</b>{" "}
          course on <b>{formattedDate}</b>, under the instruction of <b>{instructor}</b> through Ocktiv.
          <br />
          <br />
          You can view or share your certificate using the following link:{" "}
          <a href={brandedLink} target="_blank" rel="noopener noreferrer">
            <b>{brandedLink}</b>
          </a>
        </p>
      </div>
    </div>
  );
}
