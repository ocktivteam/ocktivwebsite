// // controllers/emailController.js
// import { mailer } from "../utils/emailTransport.js";
// import { Course } from "../models/Course.js";
// import { User as UserModel } from "../models/User.js";
// import { EmailMessage } from "../models/EmailMessage.js";

// async function resolveInstructor(courseId, requestedInstructorId) {
//   const course = await Course.findById(courseId).populate("instructors");
//   if (!course) throw new Error("Course not found");
//   const instructor = requestedInstructorId
//     ? course.instructors.find(i => String(i._id) === String(requestedInstructorId))
//     : course.instructors?.[0];
//   if (!instructor) throw new Error("No instructor on this course");
//   if (!instructor.email) throw new Error("Instructor has no email");
//   return instructor;
// }

// export const sendStudentEmailToInstructor = async (req, res) => {
//   try {
//     const { senderId: bodySenderId, courseId, instructorId, subject, message } = req.body;

//     const senderId = req.user?._id || bodySenderId; // if you have auth, prefer req.user._id
//     if (!senderId || !courseId || !subject || !message) {
//       return res.status(400).json({ message: "senderId, courseId, subject, message required" });
//     }

//     const sender = await UserModel.findById(senderId);
//     if (!sender) return res.status(404).json({ message: "Sender not found" });

//     const instructor = await resolveInstructor(courseId, instructorId);

//     await mailer.sendMail({
//       from: process.env.FROM_EMAIL || `no-reply@${process.env.SES_DOMAIN || "ocktiv.com"}`,
//       to: instructor.email,
//       // 👇 This is the key: replies go straight to the student's mailbox
//       replyTo: sender.email,
//       subject: `[Ocktiv] ${subject}`,
//       text: message,
//       html: `<p><strong>From:</strong> ${sender.firstName} ${sender.lastName} (${sender.email})</p>
//              <p><strong>Course:</strong> ${courseId}</p><hr/>
//              <p>${message.replace(/\n/g, "<br/>")}</p>`,
//       attachments: (req.files || []).map(f => ({
//         filename: f.originalname,
//         content: f.buffer,
//         contentType: f.mimetype,
//       })),
//     });

//     // Optional tiny audit record:
//     const saved = await EmailMessage.create({
//       senderId,
//       instructorId: instructor._id,
//       courseId,
//       subject,
//       message,
//       attachments: (req.files || []).map(f => ({
//         filename: f.originalname, mimeType: f.mimetype, size: f.size
//       })),
//       sentAt: new Date(),
//     });

//     res.status(201).json({ status: true, message: "Email sent", id: saved._id });
//   } catch (err) {
//     console.error("sendStudentEmailToInstructor error:", err);
//     res.status(500).json({ status: false, message: err.message || "Failed to send" });
//   }
// };


// //new modified to send to multiple instructors in the course
// // controllers/emailController.js
// import { mailer } from "../utils/emailTransport.js";
// import { Course } from "../models/Course.js";
// import { User as UserModel } from "../models/User.js";
// import { EmailMessage } from "../models/EmailMessage.js";

// /**
//  * Resolve recipients:
//  * - If instructorIds (array) provided → filter to those on the course
//  * - Else if instructorId (single) provided → pick that one
//  * - Else → all course instructors
//  */
// async function resolveInstructors(courseId, requestedInstructorId, requestedInstructorIds) {
//   const course = await Course.findById(courseId).populate("instructors");
//   if (!course) throw new Error("Course not found");

//   let list = course.instructors || [];

//   if (Array.isArray(requestedInstructorIds) && requestedInstructorIds.length) {
//     const set = new Set(requestedInstructorIds.map(String));
//     list = list.filter(i => set.has(String(i._id)));
//   } else if (requestedInstructorId) {
//     list = list.filter(i => String(i._id) === String(requestedInstructorId));
//   }

//   if (!list.length) throw new Error("No instructor on this course");
//   list.forEach(i => { if (!i.email) throw new Error("Instructor has no email"); });

//   return list;
// }

// export const sendStudentEmailToInstructor = async (req, res) => {
//   try {
//     const {
//       senderId: bodySenderId,
//       courseId,
//       instructorId,          // optional (single)
//       instructorIds,         // optional (array)
//       subject,
//       message
//     } = req.body;

//     const senderId = req.user?._id || bodySenderId;
//     if (!senderId || !courseId || !subject || !message) {
//       return res.status(400).json({ message: "senderId, courseId, subject, message required" });
//     }

//     const sender = await UserModel.findById(senderId);
//     if (!sender) return res.status(404).json({ message: "Sender not found" });

//     const instructors = await resolveInstructors(courseId, instructorId, instructorIds);

//     const attachments = (req.files || []).map(f => ({
//       filename: f.originalname,
//       content: f.buffer,
//       contentType: f.mimetype,
//     }));

//     // Send one email per instructor (keeps audit model simple)
//     await Promise.all(instructors.map(i =>
//       mailer.sendMail({
//         from: process.env.FROM_EMAIL || `no-reply@${process.env.SES_DOMAIN || "ocktiv.com"}`,
//         to: i.email,
//         replyTo: sender.email, // replies go straight to the student
//         subject: `[Ocktiv] ${subject}`,
//         text: message,
//         html: `<p><strong>From:</strong> ${sender.firstName ?? ""} ${sender.lastName ?? ""} (${sender.email})</p>
//                <p><strong>Course:</strong> ${courseId}</p>
//                <hr/>
//                <p>${String(message).replace(/\n/g, "<br/>")}</p>`,
//         attachments
//       })
//     ));

//     // Create one audit record per instructor
//     const saved = await Promise.all(instructors.map(i =>
//       EmailMessage.create({
//         senderId,
//         instructorId: i._id,
//         courseId,
//         subject,
//         message,
//         attachments: (req.files || []).map(f => ({
//           filename: f.originalname,
//           mimeType: f.mimetype,
//           size: f.size
//         })),
//         sentAt: new Date(),
//       })
//     ));

//     return res.status(201).json({
//       status: true,
//       message: `Email sent to ${instructors.length} instructor(s)`,
//       ids: saved.map(doc => doc._id)
//     });
//   } catch (err) {
//     console.error("sendStudentEmailToInstructor error:", err);
//     return res.status(500).json({ status: false, message: err.message || "Failed to send" });
//   }
// };


// new

// controllers/emailController.js
import { mailer } from "../utils/emailTransport.js";
import { Course } from "../models/Course.js";
import { User as UserModel } from "../models/User.js";
import { EmailMessage } from "../models/EmailMessage.js";

/**
 * Normalize instructorIds from FormData:
 * - Accepts JSON string, single string, array of strings, or "instructorIds[]"
 */
function normalizeInstructorIds(body) {
  let ids = body.instructorIds ?? body["instructorIds[]"];

  // If undefined -> return empty array (means send to all)
  if (ids == null) return [];

  // If already an array (e.g., multiple instructorIds[]), ensure strings
  if (Array.isArray(ids)) return ids.map(String).filter(Boolean);

  // If a single string
  if (typeof ids === "string") {
    // Try JSON parse first (frontend may send JSON in FormData)
    try {
      const parsed = JSON.parse(ids);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      // If JSON parsed to string, fall through
      if (typeof parsed === "string") return [parsed].filter(Boolean);
    } catch {
      // Not JSON → treat as single id
      return [ids].filter(Boolean);
    }
  }

  // Fallback
  return [];
}

/**
 * Resolve recipients:
 * - If instructorIds (array) provided → filter to those on the course
 * - Else if instructorId (single) provided → pick that one
 * - Else → all course instructors
 */
async function resolveInstructors(courseId, requestedInstructorId, requestedInstructorIds) {
  const course = await Course.findById(courseId).populate("instructors");
  if (!course) throw new Error("Course not found");

  let list = course.instructors || [];

  if (Array.isArray(requestedInstructorIds) && requestedInstructorIds.length) {
    const set = new Set(requestedInstructorIds.map(String));
    list = list.filter(i => set.has(String(i._id)));
  } else if (requestedInstructorId) {
    list = list.filter(i => String(i._id) === String(requestedInstructorId));
  }

  if (!list.length) throw new Error("No matching instructor(s) on this course");
  list.forEach(i => { if (!i.email) throw new Error("Instructor has no email"); });

  return list;
}

export const sendStudentEmailToInstructor = async (req, res) => {
  try {
    let {
      senderId: bodySenderId,
      courseId,
      instructorId,   // optional (single)
      subject,
      message
    } = req.body;

    // Normalize array input from FormData
    const instructorIds = normalizeInstructorIds(req.body);

    const senderId = req.user?._id || bodySenderId;
    if (!senderId || !courseId || !subject || !message) {
      return res.status(400).json({ message: "senderId, courseId, subject, message are required" });
    }

    const sender = await UserModel.findById(senderId);
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    const instructors = await resolveInstructors(courseId, instructorId, instructorIds);

    const attachments = (req.files || []).map(f => ({
      filename: f.originalname,
      content: f.buffer,
      contentType: f.mimetype,
    }));

    // Send one email per instructor (keeps audit model simple)
    await Promise.all(instructors.map(i =>
      mailer.sendMail({
        from: process.env.FROM_EMAIL || `no-reply@${process.env.SES_DOMAIN || "ocktiv.com"}`,
        to: i.email,
        replyTo: sender.email, // replies go straight to the student
        subject: `[Ocktiv] ${subject}`,
        text: message,
        html: `<p><strong>From:</strong> ${sender.firstName ?? ""} ${sender.lastName ?? ""} (${sender.email})</p>
               <p><strong>Course:</strong> ${courseId}</p>
               <hr/>
               <p>${String(message).replace(/\n/g, "<br/>")}</p>`,
        attachments
      })
    ));

    // Create one audit record per instructor
    const saved = await Promise.all(instructors.map(i =>
      EmailMessage.create({
        senderId,
        instructorId: i._id,
        courseId,
        subject,
        message,
        attachments: (req.files || []).map(f => ({
          filename: f.originalname,
          mimeType: f.mimetype,
          size: f.size
        })),
        sentAt: new Date(),
      })
    ));

    return res.status(201).json({
      status: true,
      message: `Email sent to ${instructors.length} instructor(s)`,
      ids: saved.map(doc => doc._id)
    });
  } catch (err) {
    console.error("sendStudentEmailToInstructor error:", err);
    return res.status(500).json({ status: false, message: err.message || "Failed to send" });
  }
};