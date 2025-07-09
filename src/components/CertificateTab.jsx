// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "../style/certificate.css"; // optional, for styling

// export default function CertificateTab({ user, courseId }) {
//   const [certificate, setCertificate] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const backendURL =
//     window.location.hostname === "localhost"
//       ? "http://localhost:5050"
//       : "https://ocktivwebsite-3.onrender.com";

//   useEffect(() => {
//     const fetchCertificate = async () => {
//       try {
//         const { data } = await axios.post(`${backendURL}/api/certificate/generate`, {
//           userId: user._id,
//           courseId,
//         });
//         setCertificate(data);
//       } catch (err) {
//         console.error("Certificate fetch failed", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCertificate();
//   }, [user._id, courseId, backendURL]);

//   if (loading) return <p>Generating your certificate...</p>;
//   if (!certificate) return <p>Something went wrong. Please try again later.</p>;

//   return (
//     <div className="certificate-wrapper">
//       <h2>Congratulations on completing this course!</h2>
//       <p>You can download or share your certificate below.</p>
//       <div className="certificate-actions">
//         <a
//           href={certificate.certificateUrl}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="certificate-btn download-btn"
//         >
//           Download PDF
//         </a>
//         <button
//           className="certificate-btn share-btn"
//           onClick={() => navigator.clipboard.writeText(certificate.certificateUrl)}
//         >
//           Copy Shareable Link
//         </button>
//       </div>
//       <iframe
//         src={certificate.certificateUrl}
//         title="Certificate Preview"
//         style={{
//           width: "100%",
//           height: "600px",
//           border: "1px solid #ccc",
//           marginTop: "20px",
//         }}
//       />
//     </div>
//   );
// }


//==July9--


import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/certificate.css"; // Keep your styles

export default function CertificateTab({ user, courseId }) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5050"
      : "https://ocktivwebsite-3.onrender.com";

  useEffect(() => {
    if (!user || !user._id || !courseId) {
      setLoading(true);
      return;
    }
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

  if (!user || !user._id || !courseId || loading)
    return <p>Loading certificate info...</p>;

  if (!certificate)
    return <p>Something went wrong. Please try again later.</p>;

  // Fallbacks if any field is missing
  const {
    studentName = "Student Name",
    courseName = "Course Name",
    instructorName = "Instructor Name",
    dateOfCompletion,
    certId = "CertID",
    certificateUrl = "#",
  } = certificate;

  // Format date to readable (e.g. July 9, 2025)
  let formattedDate = "Date of Completion";
  if (dateOfCompletion) {
    const date = new Date(dateOfCompletion);
    formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  return (
    <div className="certificate-outer-container">
      {/* HEADER */}
      <div className="certificate-header-row">
        <div>
          <h1 className="certificate-main-header">Congratulations for completing this course!</h1>
          <p className="certificate-subtext">
            You may now download your certificate below
          </p>
        </div>
        {/* BUTTONS */}
        <div className="certificate-action-buttons">
          <button
            className="certificate-btn share-btn"
            onClick={() => navigator.clipboard.writeText(certificateUrl)}
          >
            Share Certificate
          </button>
          <a
            href={certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="certificate-btn download-btn"
            download
          >
            Download Certificate
          </a>
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
          This certificate confirms that <b>{studentName}</b> completed all requirements for the <b>{courseName}</b> course on <b>{formattedDate}</b>, under the instruction of <b>{instructorName}</b> through Ocktiv.
          <br />
          Course completion has been validated within our platform. To confirm the authenticity of this certificate, please visit <b>ocktiv.com/certificates/{certId}</b> and enter the provided Cert ID in the URL.
        </p>
      </div>
    </div>
  );
}
