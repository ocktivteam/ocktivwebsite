// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../style/certificate.css";

// export default function CertificateTab({ user, courseId }) {
//   const [certificate, setCertificate] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const calledRef = useRef(false);
//   const [copied, setCopied] = useState(false);
//   const [showShare, setShowShare] = useState(false);
//   const navigate = useNavigate();

//   // Change this to match your frontend deploy domain!
//   const frontendDomain =
//     window.location.hostname === "localhost"
//       ? "http://localhost:3000"
//       : "https://ocktivwebsite.vercel.app";

//   const backendURL =
//     window.location.hostname === "localhost"
//       ? "http://localhost:5050"
//       : "https://ocktivwebsite-3.onrender.com";

//         //  new wrapper function for certificate generation
//   const fetchCertificate = async () => {
//     try {
//       const { data } = await axios.post(`${backendURL}/api/certificate/generate`, {
//         userId: user._id,
//         courseId,
//       });
//       setCertificate(data);
//     } catch (err) {
//       setCertificate(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (calledRef.current || !user || !user._id || !courseId) return;

//     // 🔑 prompt before generating
//     const confirmed = window.confirm(
//       `Your certificate will be generated with the following name:\n\n"${user.legalName || user.firstName + " " + user.lastName}".\n\nIs this your full legal name?\n\nClick OK to continue.\nClick Cancel if you want to change it first.`
//     );

//     if (confirmed) {
//       calledRef.current = true;
//       fetchCertificate();
//     } else {
//       // 🚀 redirect to profile page to update legalName
//       navigate("/profile", { replace: true, state: { from: "certificate" } });
//     }
//   }, [user, courseId, backendURL, navigate]);

//   useEffect(() => {
//     function handler(e) {
//       if (
//         !e.target.closest(".certificate-share-popup") &&
//         !e.target.closest(".share-btn")
//       ) {
//         setShowShare(false);
//       }
//     }
//     if (showShare) document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [showShare]);

//   if (!user || !user._id || !courseId || loading)
//     return <p>Loading certificate info...</p>;

//   if (!certificate)
//     return <p>Something went wrong. Please try again later.</p>;

//   const {
//     studentName = "Student Name",
//     courseName = "Course Name",
//     instructor = "Instructor Name",
//     completionDate,
//     certId = "CertID",
//     certificateUrl = "#",
//   } = certificate;

//   let formattedDate = "Date of Completion";
//   if (completionDate) {
//     const date = new Date(completionDate);
//     formattedDate = date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "long",
//       year: "numeric",
//     });
//   }
//   // useEffect(() => {
//   //   if (calledRef.current || !user || !user._id || !courseId) return;
//   //   calledRef.current = true;
//   //   const fetchCertificate = async () => {
//   //     try {
//   //       const { data } = await axios.post(`${backendURL}/api/certificate/generate`, {
//   //         userId: user._id,
//   //         courseId,
//   //       });
//   //       setCertificate(data);
//   //     } catch (err) {
//   //       setCertificate(null);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };
//   //   fetchCertificate();
//   // }, [user, courseId, backendURL]);

//   // useEffect(() => {
//   //   function handler(e) {
//   //     if (!e.target.closest(".certificate-share-popup") && !e.target.closest(".share-btn")) {
//   //       setShowShare(false);
//   //     }
//   //   }
//   //   if (showShare) document.addEventListener("mousedown", handler);
//   //   return () => document.removeEventListener("mousedown", handler);
//   // }, [showShare]);

//   // if (!user || !user._id || !courseId || loading)
//   //   return <p>Loading certificate info...</p>;

//   // if (!certificate)
//   //   return <p>Something went wrong. Please try again later.</p>;

//   // const {
//   //   studentName = "Student Name",
//   //   courseName = "Course Name",
//   //   instructor = "Instructor Name",
//   //   completionDate,
//   //   certId = "CertID",
//   //   certificateUrl = "#",
//   // } = certificate;

//   // let formattedDate = "Date of Completion";
//   // if (completionDate) {
//   //   const date = new Date(completionDate);
//   //   formattedDate = date.toLocaleDateString("en-GB", {
//   //     day: "2-digit",
//   //     month: "long",
//   //     year: "numeric",
//   //   });
//   // }

//   // The pretty, shareable link
//   //const shareLink = `${frontendDomain}/certificates/${certId}`;
//   //const shareLink = certificateUrl; // Use the S3 URL directly for sharing
//   const brandedLink = `${frontendDomain}/certificates/${certId}`; // for UI display
//   const shareLink = certificateUrl; // raw AWS S3 link for sharing

//   const handleCopy = () => {
//     navigator.clipboard.writeText(shareLink);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   // ------- DOWNLOAD HANDLER --------
//   const handleDownload = async () => {
//     try {
//       const res = await axios.get(
//         `${backendURL}/api/certificate/download/${certId}`
//       );
//       const presignedUrl = res.data.url;

//       // Trigger download via hidden anchor
//       const a = document.createElement("a");
//       a.href = presignedUrl;
//       a.download = `${studentName}-${courseName}-certificate.png`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//     } catch (err) {
//       alert("Failed to download certificate. Please try again.");
//     }
//   };

//   return (
//     <div className="certificate-outer-container">
//       {/* ⚠️ WARNING BANNER */}
//       <div
//         style={{
//           background: "#fff3cd",
//           border: "1px solid #ffeeba",
//           padding: "12px 18px",
//           borderRadius: "8px",
//           marginBottom: "20px",
//           color: "#856404",
//           fontSize: "0.95rem",
//           fontWeight: 500,
//         }}
//       >
//         ⚠️ Please make sure your full legal name is correct before generating. 
//         After your certificate is issued, changes can only be made by contacting{" "}
//         <a href="mailto:support@ocktiv.com">support@ocktiv.com</a>.
//       </div>
//       {/* HEADER */}
//       <div className="certificate-header-row">
//         <div>
//           <h1 className="certificate-main-header">Congratulations for completing this course!</h1>
//         </div>
//         {/* BUTTONS */}
//         <div className="certificate-action-buttons">
//           {/* Share button + popup */}
//           <div className="certificate-share-container">
//             <button
//               className="certificate-btn share-btn"
//               onClick={() => setShowShare((v) => !v)}
//               type="button"
//             >
//               Share Certificate
//             </button>
//             {showShare && (
//               <div className="certificate-share-popup">
//                 <div className="share-popup-title">Share</div>
//                 <div className="share-popup-icons">
//                   <a
//                     href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     title="Share on Facebook"
//                   >
//                     <img src="/img/facebook.png" alt="Facebook" className="share-icon" />
//                   </a>
//                   <a
//                     href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     title="Share on LinkedIn"
//                   >
//                     <img src="/img/linkedin.png" alt="LinkedIn" className="share-icon" />
//                   </a>
//                   {/* <a
//                     href={`https://www.instagram.com/`} // Instagram doesn't support direct link sharing
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     title="Share on Instagram"
//                   >
//                     <img src="/img/instagram.png" alt="Instagram" className="share-icon" />
//                   </a> */}
//                 </div>
//                 <div className="share-popup-label">Manually copy the URL for sharing</div>
//                 <div className="share-popup-url-row">
//                   <input
//                     className="share-popup-url"
//                     value={shareLink}
//                     readOnly
//                     onClick={handleCopy}
//                   />
//                   <button className="copy-btn" onClick={handleCopy} type="button" tabIndex={-1}>
//                     <span role="img" aria-label="Copy">📋</span>
//                   </button>
//                 </div>
//                 {copied && (
//                   <div className="copy-toast">Link copied!</div>
//                 )}
//               </div>
//             )}
//           </div>
//           {/* Download button */}
//           <button
//             className="certificate-btn download-btn"
//             onClick={handleDownload}
//             type="button"
//           >
//             Download Certificate
//           </button>
//         </div>
//       </div>
//       {/* CERTIFICATE IMAGE */}
//       <div className="certificate-image-wrapper">
//         <img
//           src={certificateUrl}
//           alt="Certificate"
//           className="certificate-image"
//         />
//       </div>
//       {/* DESCRIPTION */}
//       <div className="certificate-description">
//         <p>
//           This certificate confirms that <b>{studentName}</b> has successfully completed the <b>{courseName}</b> course on <b>{formattedDate}</b>, under the instruction of <b>{instructor}</b> through ocktiv.
//           <br /><br />
//           You can view or share your certificate using the following link:{" "}
//           <a
//             href={brandedLink}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <b>{brandedLink}</b>
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }




// //Aug 20
// //cert legal name issue - and repeated pop ups
// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../style/certificate.css";

// export default function CertificateTab({ user, courseId }) {
//   const [certificate, setCertificate] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const calledRef = useRef(false);
//   const [copied, setCopied] = useState(false);
//   const [showShare, setShowShare] = useState(false);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const navigate = useNavigate();

//   const frontendDomain =
//     window.location.hostname === "localhost"
//       ? "http://localhost:3000"
//       : "https://ocktivwebsite.vercel.app";

//   const backendURL =
//     window.location.hostname === "localhost"
//       ? "http://localhost:5050"
//       : "https://ocktivwebsite-3.onrender.com";

//   // --- Generate certificate ---
//   const fetchCertificate = async () => {
//     try {
//       const { data } = await axios.post(`${backendURL}/api/certificate/generate`, {
//         userId: user._id,
//         courseId,
//       });
//       setCertificate(data);
//     } catch (err) {
//       setCertificate(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Show custom modal instead of window.confirm
//   useEffect(() => {
//     if (calledRef.current || !user || !user._id || !courseId) return;

//     // Show modal only once per mount
//     setShowConfirmModal(true);
//     // While waiting for user choice, keep loading state true so we don't render the certificate area yet
//   }, [user, courseId]);

//   useEffect(() => {
//     function handler(e) {
//       if (
//         !e.target.closest(".certificate-share-popup") &&
//         !e.target.closest(".share-btn")
//       ) {
//         setShowShare(false);
//       }
//     }
//     if (showShare) document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [showShare]);

//   // Handle modal actions
//   const handleConfirmGenerate = () => {
//     setShowConfirmModal(false);
//     if (calledRef.current) return;
//     calledRef.current = true;
//     fetchCertificate();
//   };

//   const handleGoToProfile = () => {
//     setShowConfirmModal(false);
//     navigate("/profile", { replace: true, state: { from: "certificate" } });
//   };

//   // If we’re still waiting on user confirmation, show the modal and a subtle backdrop loader fallback
//   if (showConfirmModal) {
//     const legalNameToShow = (user?.legalName || `${user?.firstName || ""} ${user?.lastName || ""}`).trim();

//     return (
//       <>
//         {/* Minimal modal styles inline so you don't need external CSS changes */}
//         <div style={{
//           position: "fixed",
//           inset: 0,
//           background: "rgba(0,0,0,0.45)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           zIndex: 9999
//         }}>
//           <div style={{
//             width: "min(600px, 92vw)",
//             background: "#fff",
//             borderRadius: "14px",
//             boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
//             padding: "24px 24px 18px",
//             fontFamily: "inherit"
//           }}>
//             <h2 style={{ margin: 0, marginBottom: 10, fontSize: 20, fontWeight: 700 }}>
//               Confirm Your Legal Name
//             </h2>
//             <p style={{ margin: "6px 0 12px", lineHeight: 1.5, color: "#333" }}>
//               Please review your full legal name exactly as it will appear on your certificate:
//             </p>
//             <div style={{
//               padding: "12px 14px",
//               borderRadius: 10,
//               background: "#f6f7fb",
//               border: "1px solid #e5e7f1",
//               fontWeight: 600
//             }}>
//               {legalNameToShow || "Your Full Legal Name"}
//             </div>

//             <p style={{ margin: "14px 0 0", lineHeight: 1.5, color: "#333" }}>
//               This name will be permanently displayed on your certificate.
//             </p>
//             <p style={{ margin: "8px 0 16px", lineHeight: 1.5, color: "#8a182b", fontWeight: 600 }}>
//               ⚠️ Please ensure your full legal name is correct before generating. After your certificate is issued, changes can only be made by contacting support@ocktiv.com.
//             </p>

//             <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
//               <button
//                 type="button"
//                 onClick={handleGoToProfile}
//                 style={{
//                   padding: "10px 14px",
//                   borderRadius: 10,
//                   border: "1px solid #d0d5dd",
//                   background: "#1252ff",
//                   cursor: "pointer",
//                   fontWeight: 600
//                 }}
//               >
//                 No, I want to change it now
//               </button>
//               <button
//                 type="button"
//                 onClick={handleConfirmGenerate}
//                 style={{
//                   padding: "10px 14px",
//                   borderRadius: 10,
//                   border: "1px solid #1252ff",
//                   background: "#1252ff",
//                   color: "#fff",
//                   cursor: "pointer",
//                   fontWeight: 700
//                 }}
//               >
//                 Yes, it is correct
//               </button>
//             </div>
//           </div>
//         </div>
//       </>
//     );
//   }

//   if (!user || !user._id || !courseId || loading)
//     return <p>Loading certificate info...</p>;

//   if (!certificate)
//     return <p>Something went wrong. Please try again later.</p>;

//   const {
//     studentName = "Student Name",
//     courseName = "Course Name",
//     instructor = "Instructor Name",
//     completionDate,
//     certId = "CertID",
//     certificateUrl = "#",
//   } = certificate;

//   let formattedDate = "Date of Completion";
//   if (completionDate) {
//     const date = new Date(completionDate);
//     formattedDate = date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "long",
//       year: "numeric",
//     });
//   }

//   const brandedLink = `${frontendDomain}/certificates/${certId}`;
//   const shareLink = certificateUrl;

//   const handleCopy = () => {
//     navigator.clipboard.writeText(shareLink);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleDownload = async () => {
//     try {
//       const res = await axios.get(
//         `${backendURL}/api/certificate/download/${certId}`
//       );
//       const presignedUrl = res.data.url;

//       const a = document.createElement("a");
//       a.href = presignedUrl;
//       a.download = `${studentName}-${courseName}-certificate.png`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//     } catch (err) {
//       alert("Failed to download certificate. Please try again.");
//     }
//   };

//   return (
//     <div className="certificate-outer-container">
//       {/* HEADER */}
//       <div className="certificate-header-row">
//         <div>
//           <h1 className="certificate-main-header">Congratulations for completing this course!</h1>
//         </div>
//         <div className="certificate-action-buttons">
//           {/* Share button + popup */}
//           <div className="certificate-share-container">
//             <button
//               className="certificate-btn share-btn"
//               onClick={() => setShowShare((v) => !v)}
//               type="button"
//             >
//               Share Certificate
//             </button>
//             {showShare && (
//               <div className="certificate-share-popup">
//                 <div className="share-popup-title">Share</div>
//                 <div className="share-popup-icons">
//                   <a
//                     href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     title="Share on Facebook"
//                   >
//                     <img src="/img/facebook.png" alt="Facebook" className="share-icon" />
//                   </a>
//                   <a
//                     href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     title="Share on LinkedIn"
//                   >
//                     <img src="/img/linkedin.png" alt="LinkedIn" className="share-icon" />
//                   </a>
//                 </div>
//                 <div className="share-popup-label">Manually copy the URL for sharing</div>
//                 <div className="share-popup-url-row">
//                   <input
//                     className="share-popup-url"
//                     value={shareLink}
//                     readOnly
//                     onClick={handleCopy}
//                   />
//                   <button className="copy-btn" onClick={handleCopy} type="button" tabIndex={-1}>
//                     <span role="img" aria-label="Copy">📋</span>
//                   </button>
//                 </div>
//                 {copied && <div className="copy-toast">Link copied!</div>}
//               </div>
//             )}
//           </div>
//           {/* Download button */}
//           <button
//             className="certificate-btn download-btn"
//             onClick={handleDownload}
//             type="button"
//           >
//             Download Certificate
//           </button>
//         </div>
//       </div>
//       {/* CERTIFICATE IMAGE */}
//       <div className="certificate-image-wrapper">
//         <img
//           src={certificateUrl}
//           alt="Certificate"
//           className="certificate-image"
//         />
//       </div>
//       {/* DESCRIPTION */}
//       <div className="certificate-description">
//         <p>
//           This certificate confirms that <b>{studentName}</b> has successfully completed the <b>{courseName}</b> course on <b>{formattedDate}</b>, under the instruction of <b>{instructor}</b> through Ocktiv.
//           <br /><br />
//           You can view or share your certificate using the following link:{" "}
//           <a
//             href={brandedLink}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <b>{brandedLink}</b>
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }



// // Aug 20 (patched)
// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../style/certificate.css";

// export default function CertificateTab({ user, courseId }) {
//   const [certificate, setCertificate] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const calledRef = useRef(false);
//   const [copied, setCopied] = useState(false);
//   const [showShare, setShowShare] = useState(false);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);

//   // NEW: keep a fresh user snapshot that merges localStorage / server / prop
//   const [effectiveUser, setEffectiveUser] = useState(user);

//   const navigate = useNavigate();

//     // helper: build a stable localStorage key per user+course
//     const confirmedKey = effectiveUser?._id && courseId
//     ? `certConfirmed_${effectiveUser._id}_${courseId}`
//     : null;


//   const frontendDomain =
//     window.location.hostname === "localhost"
//       ? "http://localhost:3000"
//       : "https://ocktivwebsite.vercel.app";

//   const backendURL =
//     window.location.hostname === "localhost"
//       ? "http://localhost:5050"
//       : "https://ocktivwebsite-3.onrender.com";

//   // NEW: auth profile endpoint (same as Profile.jsx)
//   const AUTH_PROFILE_URL =
//     window.location.hostname === "localhost"
//       ? "http://localhost:5050/auth/profile"
//       : "https://ocktivwebsite-3.onrender.com/auth/profile";

//   // --- Generate certificate ---
//   const fetchCertificate = async () => {
//     try {
//       const uid = effectiveUser?._id || user?._id;
//       const { data } = await axios.post(`${backendURL}/api/certificate/generate`, {
//         userId: uid,
//         courseId,
//       });
//       // On success, ensure the "confirmed" flag is set (defense-in-depth)
//       if (confirmedKey) localStorage.setItem(confirmedKey, "true");
//       setCertificate(data);
//     } catch (err) {
//       setCertificate(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // NEW: On mount (and when prop user changes), refresh effective user from
//   // 1) localStorage.user (which Profile updates) and
//   // 2) server /auth/profile (optional but safest)
//   useEffect(() => {
//     let cancelled = false;

//     const mergeUsers = (base, override) =>
//       base && override && base._id === override._id ? { ...base, ...override } : (override || base);

//     const refreshUser = async () => {
//       // start with the prop user
//       let candidate = user || null;

//       // try localStorage.user (Profile writes this on save)
//       try {
//         const ls = JSON.parse(localStorage.getItem("user") || "null");
//         if (ls && (!candidate || ls._id === candidate._id)) {
//           candidate = mergeUsers(candidate, ls);
//         }
//       } catch {
//         /* ignore JSON errors */
//       }

//       // optionally hit server for the freshest data
//       try {
//         const token = localStorage.getItem("authToken");
//         if (token) {
//           const resp = await axios.get(AUTH_PROFILE_URL, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           if (resp?.data?.status && resp?.data?.user) {
//             const srv = resp.data.user;
//             if (!candidate || srv._id === candidate._id) {
//               candidate = mergeUsers(candidate, srv);
//             }
//           }
//         }
//       } catch {
//         /* best-effort only */
//       }

//       if (!cancelled) setEffectiveUser(candidate || user || null);
//     };

//     refreshUser();
//     return () => {
//       cancelled = true;
//     };
//   }, [user]); // re-run if parent updates user

//   // Show custom modal instead of window.confirm
//   useEffect(() => {
//     if (calledRef.current || !effectiveUser?._id || !courseId) return;
//     setShowConfirmModal(true);
//   }, [effectiveUser?._id, courseId]);

//   useEffect(() => {
//     function handler(e) {
//       if (
//         !e.target.closest(".certificate-share-popup") &&
//         !e.target.closest(".share-btn")
//       ) {
//         setShowShare(false);
//       }
//     }
//     if (showShare) document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [showShare]);

//   // Handle modal actions
//   const handleConfirmGenerate = () => {
//     setShowConfirmModal(false);
//     if (calledRef.current) return;
//     calledRef.current = true;
//     fetchCertificate();
//   };

//   const handleGoToProfile = () => {
//     setShowConfirmModal(false);
//     navigate("/profile", { replace: true, state: { from: "certificate" } });
//   };

//   // === MODAL RENDER ===
//   if (showConfirmModal) {
//     // NEW: compute legal name from the freshest source
//     const ln = (effectiveUser?.legalName || "").trim();
//     const fallbackFull = `${effectiveUser?.firstName || ""} ${effectiveUser?.lastName || ""}`.trim();
//     const legalNameToShow = ln || fallbackFull;

//     return (
//       <>
//         <div style={{
//           position: "fixed",
//           inset: 0,
//           background: "rgba(0,0,0,0.45)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           zIndex: 9999
//         }}>
//           <div style={{
//             width: "min(600px, 92vw)",
//             background: "#fff",
//             borderRadius: "14px",
//             boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
//             padding: "24px 24px 18px",
//             fontFamily: "inherit"
//           }}>
//             <h2 style={{ margin: 0, marginBottom: 10, fontSize: 20, fontWeight: 700 }}>
//               Confirm Your Legal Name
//             </h2>
//             <p style={{ margin: "6px 0 12px", lineHeight: 1.5, color: "#333" }}>
//               Please review your full legal name exactly as it will appear on your certificate:
//             </p>
//             <div style={{
//               padding: "12px 14px",
//               borderRadius: 10,
//               background: "#f6f7fb",
//               border: "1px solid #e5e7f1",
//               fontWeight: 600
//             }}>
//               {legalNameToShow || "Your Full Legal Name"}
//             </div>
//             <p style={{ margin: "8px 0 16px", lineHeight: 1.5, color: "#8a182b", fontWeight: 600 }}>
//               ⚠️ Please ensure your full legal name is correct. After your certificate is issued, changes can only be made by contacting support@ocktiv.com.
//             </p>
//             <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
//               <button
//                 type="button"
//                 onClick={handleGoToProfile}
//                 style={{
//                   padding: "10px 14px",
//                   borderRadius: 10,
//                   border: "1px solid #d0d5dd",
//                   background: "#1252ff",
//                   cursor: "pointer",
//                   fontWeight: 600
//                 }}
//               >
//                 No, I want to change it now
//               </button>
//               <button
//                 type="button"
//                 onClick={handleConfirmGenerate}
//                 style={{
//                   padding: "10px 14px",
//                   borderRadius: 10,
//                   border: "1px solid #1252ff",
//                   background: "#1252ff",
//                   color: "#fff",
//                   cursor: "pointer",
//                   fontWeight: 700
//                 }}
//               >
//                 Yes, it is correct
//               </button>
//             </div>
//           </div>
//         </div>
//       </>
//     );
//   }

//   if (!effectiveUser || !effectiveUser._id || !courseId || loading)
//     return <p>Loading certificate info...</p>;

//   if (!certificate)
//     return <p>Something went wrong. Please try again later.</p>;

//   const {
//     studentName = "Student Name",
//     courseName = "Course Name",
//     instructor = "Instructor Name",
//     completionDate,
//     certId = "CertID",
//     certificateUrl = "#",
//   } = certificate;

//   let formattedDate = "Date of Completion";
//   if (completionDate) {
//     const date = new Date(completionDate);
//     formattedDate = date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "long",
//       year: "numeric",
//     });
//   }

//   const brandedLink = `${frontendDomain}/certificates/${certId}`;
//   const shareLink = certificateUrl;

//   const handleCopy = () => {
//     navigator.clipboard.writeText(shareLink);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleDownload = async () => {
//     try {
//       const res = await axios.get(
//         `${backendURL}/api/certificate/download/${certId}`
//       );
//       const presignedUrl = res.data.url;

//       const a = document.createElement("a");
//       a.href = presignedUrl;
//       a.download = `${studentName}-${courseName}-certificate.png`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//     } catch (err) {
//       alert("Failed to download certificate. Please try again.");
//     }
//   };

//   return (
//     <div className="certificate-outer-container">
//       {/* HEADER */}
//       <div className="certificate-header-row">
//         <div>
//           <h1 className="certificate-main-header">Congratulations for completing this course!</h1>
//         </div>
//         <div className="certificate-action-buttons">
//           {/* Share button + popup */}
//           <div className="certificate-share-container">
//             <button
//               className="certificate-btn share-btn"
//               onClick={() => setShowShare((v) => !v)}
//               type="button"
//             >
//               Share Certificate
//             </button>
//             {showShare && (
//               <div className="certificate-share-popup">
//                 <div className="share-popup-title">Share</div>
//                 <div className="share-popup-icons">
//                   <a
//                     href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     title="Share on Facebook"
//                   >
//                     <img src="/img/facebook.png" alt="Facebook" className="share-icon" />
//                   </a>
//                   <a
//                     href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     title="Share on LinkedIn"
//                   >
//                     <img src="/img/linkedin.png" alt="LinkedIn" className="share-icon" />
//                   </a>
//                 </div>
//                 <div className="share-popup-label">Manually copy the URL for sharing</div>
//                 <div className="share-popup-url-row">
//                   <input
//                     className="share-popup-url"
//                     value={shareLink}
//                     readOnly
//                     onClick={handleCopy}
//                   />
//                   <button className="copy-btn" onClick={handleCopy} type="button" tabIndex={-1}>
//                     <span role="img" aria-label="Copy">📋</span>
//                   </button>
//                 </div>
//                 {copied && <div className="copy-toast">Link copied!</div>}
//               </div>
//             )}
//           </div>
//           {/* Download button */}
//           <button
//             className="certificate-btn download-btn"
//             onClick={handleDownload}
//             type="button"
//           >
//             Download Certificate
//           </button>
//         </div>
//       </div>
//       {/* CERTIFICATE IMAGE */}
//       <div className="certificate-image-wrapper">
//         <img
//           src={certificateUrl}
//           alt="Certificate"
//           className="certificate-image"
//         />
//       </div>
//       {/* DESCRIPTION */}
//       <div className="certificate-description">
//         <p>
//           This certificate confirms that <b>{studentName}</b> has successfully completed the <b>{courseName}</b> course on <b>{formattedDate}</b>, under the instruction of <b>{instructor}</b> through Ocktiv.
//           <br /><br />
//           You can view or share your certificate using the following link:{" "}
//           <a
//             href={brandedLink}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <b>{brandedLink}</b>
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }




// Aug 20 (final)
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
      // On success, ensure the "confirmed" flag is set (defense-in-depth)
      if (confirmedKey) localStorage.setItem(confirmedKey, "true");
      setCertificate(data);
    } catch (err) {
      setCertificate(null);
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
        // Cert missing → clear flag and show modal
        localStorage.removeItem(key);
        setShowConfirmModal(true);
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

  // Loading / error states
  if (!effectiveUser || !effectiveUser._id || !courseId || loading)
    return <p>Loading certificate info...</p>;

  if (!certificate)
    return <p>Something went wrong. Please try again later.</p>;

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
