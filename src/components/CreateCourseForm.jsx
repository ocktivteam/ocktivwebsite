import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/registerInstructorForm.css";
//import "../style/createCourseForm.css";

export default function CreateCourseForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    certificateDescription: "",
    courseType: "Short",
    instructors: [],
    price: "",
    duration: "",
    image: null,
  });

  const [allInstructors, setAllInstructors] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    try {
      const url =
        window.location.hostname === "localhost"
          ? "http://localhost:5050/api/courses"
          : "https://ocktivwebsite-3.onrender.com/api/courses";

      const res = await axios.post(url, form);
      if (res.data.status) {
        setMessage("Course created successfully.");
        setFormData({
          title: "",
          description: "",
          certificateDescription: "",
          courseType: "Short",
          instructors: [],
          price: "",
          duration: "",
          image: null,
        });
      } else {
        setMessage("Error: " + res.data.message);
      }
    } catch (err) {
      setMessage("Error submitting course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const url =
          window.location.hostname === "localhost"
            ? "http://localhost:5050/api/users/instructors"
            : "https://ocktivwebsite-3.onrender.com/api/users/instructors";

        const res = await axios.get(url);
        setAllInstructors(res.data.instructors);
      } catch {
        console.error("Failed to fetch instructors");
      }
    };

    fetchInstructors();
  }, []);

  return (
    <div className="register-form-box">
      <form className="register-form" onSubmit={handleSubmit}>
        <label>Course Title <span className="required">*</span></label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />

        <label>Course Description <span className="required">*</span></label>
        <input type="text" name="description" value={formData.description} onChange={handleChange} required />

        <label>Certificate Description <span className="required">*</span></label>
        <input type="text" name="certificateDescription" value={formData.certificateDescription} onChange={handleChange} required />

        <label>Course Type <span className="required">*</span></label>
        <select name="courseType" value={formData.courseType} onChange={handleChange} required>
          <option value="Short">Short</option>
          <option value="Full">Full</option>
        </select>

        <label>Instructor(s) Name <span className="required">*</span></label>
        <select name="instructors" value={formData.instructors} onChange={handleChange} required>
          {allInstructors.map((inst) => (
            <option key={inst._id} value={inst._id}>
              {inst.firstName} {inst.lastName}
            </option>
          ))}
        </select>

        <label>Price <span className="required">*</span></label>
        <input type="text" name="price" value={formData.price} onChange={handleChange} required />

        <label>Duration <span className="required">*</span></label>
        <input type="text" name="duration" value={formData.duration} onChange={handleChange} required />

        <label>Course Image Upload</label>
        <input type="file" name="image" accept="image/*" onChange={handleFileChange} />

        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>

        {message && <div className="content-success">{message}</div>}
      </form>
    </div>
  );
}