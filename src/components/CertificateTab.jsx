// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import "../style/certificate.css";
// import { useSessionCheck } from '../hooks/useSessionCheck';

// export default function CertificateTab({ user, courseId }) {
//   useSessionCheck();
  
//   const [certificate, setCertificate] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const calledRef = useRef(false);
//   const [copied, setCopied] = useState(false);
//   const [showShare, setShowShare] = useState(false);

//   // Change this to match your frontend deploy domain!
//   const frontendDomain =
//     window.location.hostname === "localhost"
//       ? "http://localhost:3000"
//       : "https://ocktivwebsite.vercel.app";

//   const backendURL =
//     window.location.hostname === "localhost"
//       ? "http://localhost:5050"
//       : "https://ocktivwebsite-3.onrender.com";

//   useEffect(() => {
//     if (calledRef.current || !user || !user._id || !courseId) return;
//     calledRef.current = true;
//     const fetchCertificate = async () => {
//       try {
//         const { data } = await axios.post(`${backendURL}/api/certificate/generate`, {
//           userId: user._id,
//           courseId,
//         });
//         setCertificate(data);
//       } catch (err) {
//         setCertificate(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCertificate();
//   }, [user, courseId, backendURL]);

//   useEffect(() => {
//     function handler(e) {
//       if (!e.target.closest(".certificate-share-popup") && !e.target.closest(".share-btn")) {
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

//   // The pretty, shareable link
//   const shareLink = `${frontendDomain}/certificates/${certId}`;

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
//                   <a
//                     href={`https://www.instagram.com/`} // Instagram doesn't support direct link sharing
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     title="Share on Instagram"
//                   >
//                     <img src="/img/instagram.png" alt="Instagram" className="share-icon" />
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
//                   </div>
//     {copied && (
//       <div className="copy-toast">Link copied!</div>
//     )}
//   </div>

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
//             href={shareLink}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <b>{shareLink}</b>
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

//== Jul 18 ==


import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../style/certificate.css";

export default function CertificateTab({ user, courseId }) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const calledRef = useRef(false);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Change this to match your frontend deploy domain!
  const frontendDomain =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://ocktivwebsite.vercel.app";

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5050"
      : "https://ocktivwebsite-3.onrender.com";

  useEffect(() => {
    if (calledRef.current || !user || !user._id || !courseId) return;
    calledRef.current = true;
    const fetchCertificate = async () => {
      try {
        const { data } = await axios.post(`${backendURL}/api/certificate/generate`, {
          userId: user._id,
          courseId,
        });
        setCertificate(data);
      } catch (err) {
        setCertificate(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [user, courseId, backendURL]);

  useEffect(() => {
    function handler(e) {
      if (!e.target.closest(".certificate-share-popup") && !e.target.closest(".share-btn")) {
        setShowShare(false);
      }
    }
    if (showShare) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showShare]);

  if (!user || !user._id || !courseId || loading)
    return <p>Loading certificate info...</p>;

  if (!certificate)
    return <p>Something went wrong. Please try again later.</p>;

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

  // The pretty, shareable link
  //const shareLink = `${frontendDomain}/certificates/${certId}`;
  //const shareLink = certificateUrl; // Use the S3 URL directly for sharing
  const brandedLink = `${frontendDomain}/certificates/${certId}`; // for UI display
  const shareLink = certificateUrl; // raw AWS S3 link for sharing

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ------- DOWNLOAD HANDLER --------
  const handleDownload = async () => {
    try {
      const res = await axios.get(
        `${backendURL}/api/certificate/download/${certId}`
      );
      const presignedUrl = res.data.url;

      // Trigger download via hidden anchor
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
        {/* BUTTONS */}
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
                  <a
                    href={`https://www.instagram.com/`} // Instagram doesn't support direct link sharing
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on Instagram"
                  >
                    <img src="/img/instagram.png" alt="Instagram" className="share-icon" />
                  </a>
                </div>
                <div className="share-popup-label">Manually copy the URL for sharing</div>
                <div className="share-popup-url-row">
                  <input
                    className="share-popup-url"
                    value={shareLink}
                    readOnly
                    onClick={handleCopy}
                  />
                  <button className="copy-btn" onClick={handleCopy} type="button" tabIndex={-1}>
                    <span role="img" aria-label="Copy">📋</span>
                  </button>
                </div>
                {copied && (
                  <div className="copy-toast">Link copied!</div>
                )}
              </div>
            )}
          </div>
          {/* Download button */}
          <button
            className="certificate-btn download-btn"
            onClick={handleDownload}
            type="button"
          >
            Download Certificate
          </button>
        </div>
      </div>
      {/* CERTIFICATE IMAGE */}
      <div className="certificate-image-wrapper">
        <img
          src={certificateUrl}
          alt="Certificate"
          className="certificate-image"
        />
      </div>
      {/* DESCRIPTION */}
      <div className="certificate-description">
        <p>
          This certificate confirms that <b>{studentName}</b> has successfully completed the <b>{courseName}</b> course on <b>{formattedDate}</b>, under the instruction of <b>{instructor}</b> through ocktiv.
          <br /><br />
          You can view or share your certificate using the following link:{" "}
          <a
            href={brandedLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <b>{brandedLink}</b>
          </a>
        </p>
      </div>
    </div>
  );
}
