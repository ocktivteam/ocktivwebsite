import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FormControl, Select, MenuItem } from "@mui/material";
import "../style/createCourseForm.css"; // Do NOT remove, your styles live here.

const COURSE_API =
    window.location.hostname === "localhost"
        ? "http://localhost:5050/api/courses"
        : "https://ocktivwebsite-3.onrender.com/api/courses";
const INSTRUCTOR_API =
    window.location.hostname === "localhost"
        ? "http://localhost:5050/auth/instructors"
        : "https://ocktivwebsite-3.onrender.com/auth/instructors";
const UPLOAD_API =
    window.location.hostname === "localhost"
        ? "http://localhost:5050/api/upload"
        : "https://ocktivwebsite-3.onrender.com/api/upload";

const MAX_IMAGE_SIZE_MB = 15;
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const SUPPORTED_IMG = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];


export default function CreateCourseForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        courseTitle: "",
        description: "",
        certDesc: "",
        courseType: null,
        instructors: [],
        price: "",
        duration: "",
        imageUrl: "",
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [instructors, setInstructors] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("/img/ocktivLogo.png");
    const fileInputRef = useRef();

    // NEW: Search filter state for instructors
    const [instructorSearch, setInstructorSearch] = useState("");

    // NEW: Processing state for file input
    const [isFileInputProcessing, setIsFileInputProcessing] = useState(false);

    const { id: courseId } = useParams();
    const isEditMode = Boolean(courseId);

    useEffect(() => {
        if (!isEditMode) return;

        axios.get(`${COURSE_API}/${courseId}`)
            .then(res => {
                const course = res.data.course;
                setForm({
                    courseTitle: course.courseTitle || "",
                    description: course.description || "",
                    certDesc: course.certDesc || "",
                    courseType: course.courseType || "",
                    price: course.price || "",
                    duration: course.duration || "",
                    imageUrl: course.imageUrl || "",
                    instructors: course.instructors?.map(i => i._id) || []
                });
                setImagePreview(course.imageUrl || "/img/ocktivLogo.png");
            })
            .catch(() => navigate("/admin-dashboard"));
    }, [courseId]);


    useEffect(() => {
        axios
            .get(INSTRUCTOR_API)
            .then(res => setInstructors(res.data?.instructors || []))
            .catch(() => setInstructors([]));
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // ----------- NEW: Instructor selection logic (with checkboxes and search) ----------
    function handleInstructorCheckbox(e) {
        const value = e.target.value;
        if (e.target.checked) {
            setForm(prev => ({
                ...prev,
                instructors: [...prev.instructors, value],
            }));
        } else {
            setForm(prev => ({
                ...prev,
                instructors: prev.instructors.filter(id => id !== value),
            }));
        }
        setErrors(prev => ({ ...prev, instructors: undefined }));
    }

    const filteredInstructors = instructorSearch
        ? instructors.filter(
            inst =>
                (inst.firstName + " " + inst.lastName)
                    .toLowerCase()
                    .includes(instructorSearch.toLowerCase()) ||
                inst.email.toLowerCase().includes(instructorSearch.toLowerCase())
        )
        : instructors;
    // ----------- END Instructor selection logic ----------

    // ---- IMPROVED IMAGE UPLOAD HANDLERS ----
    function handleFileInputClick() {
        if (isFileInputProcessing) return; // Prevent multiple rapid clicks
        setIsFileInputProcessing(true);

        setTimeout(() => {
            setIsFileInputProcessing(false);
        }, 500); // Reset after 500ms

        fileInputRef.current?.click();
    }

    function handleRemoveImage(e) {
        e.preventDefault();
        e.stopPropagation();

        // Handle both synthetic and native events
        if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
            e.nativeEvent.stopImmediatePropagation();
        }

        setImageFile(null);
        setImagePreview("/img/ocktivLogo.png");
        setErrors(prev => ({ ...prev, imageUrl: undefined }));
    }

    function handleDropZoneClick(e) {
        // Only allow clicks on the drop zone background or message area
        const clickableElements = ['image-drop-zone', 'image-drop-message', 'drop-text'];
        const hasClickableClass = clickableElements.some(className =>
            e.target.classList.contains(className)
        );

        if (e.target === e.currentTarget || hasClickableClass) {
            e.preventDefault();
            e.stopPropagation();
            handleFileInputClick();
        }
    }

    function handleFileInputChange(e) {
        setIsFileInputProcessing(false); // Reset processing flag

        const file = e.target.files?.[0];

        // Clear previous errors first
        setErrors(prev => ({ ...prev, imageUrl: undefined }));

        // Reset input immediately to prevent issues
        e.target.value = "";

        if (!file) {
            // User cancelled - do nothing
            return;
        }

        const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
        if (!SUPPORTED_IMG.includes(ext)) {
            setErrors(prev => ({
                ...prev,
                imageUrl: `Unsupported file type. Supported: ${SUPPORTED_IMG.join(", ")}`,
            }));
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setErrors(prev => ({
                ...prev,
                imageUrl: `Image too large. Max ${MAX_IMAGE_SIZE_MB} MB.`,
            }));
            return;
        }

        // File is valid - process it
        setImageFile(file);

        // Show preview
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            if (readerEvent.target?.result) {
                setImagePreview(readerEvent.target.result);
            }
        };
        reader.onerror = () => {
            setErrors(prev => ({
                ...prev,
                imageUrl: "Failed to read image file.",
            }));
        };
        reader.readAsDataURL(file);
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelector(".image-drop-zone").classList.remove("dragover");
        const file = e.dataTransfer.files[0];
        if (file) handleFileInputChange({ target: { files: [file] } });
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelector(".image-drop-zone").classList.add("dragover");
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelector(".image-drop-zone").classList.remove("dragover");
    }
    // ---- END IMPROVED IMAGE UPLOAD HANDLERS ----

    function validate() {
        const errs = {};
        if (!form.courseTitle.trim()) errs.courseTitle = "Course Title is required.";
        if (!form.description.trim()) errs.description = "Description is required.";
        if (!form.certDesc.trim()) errs.certDesc = "Certificate Description is required.";
        if (!form.courseType) errs.courseType = "Course Type is required.";
        if (!form.duration.trim()) errs.duration = "Duration is required.";
        if (!form.price.toString().trim() && form.price !== 0) errs.price = "Price is required.";
        if (!form.instructors.length) errs.instructors = "At least one instructor is required.";
        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErrors({});
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        setLoading(true);

        let uploadedImageUrl = form.imageUrl;
        if (imageFile) {
            try {
                const data = new FormData();
                data.append("file", imageFile);
                data.append("keyPrefix", "CourseImages/");
                const res = await axios.post(UPLOAD_API, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                uploadedImageUrl = res.data.url;
            } catch (err) {
                setErrors({ imageUrl: "Image upload failed." });
                setLoading(false);
                return;
            }
        }

        const payload = {
            ...form,
            price: form.price === "" ? 0 : Number(form.price),
            courseType: form.courseType,
            instructors: form.instructors,
            imageUrl: uploadedImageUrl || "/img/ocktivLogo.png",
        };

        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {}; // DEFINE HEADERS HERE

            let res;
            if (isEditMode) {
                res = await axios.put(`${COURSE_API}/${courseId}`, payload, { headers });
                setSuccess("Course updated successfully!");
            } else {
                res = await axios.post(COURSE_API, payload, { headers });
                setSuccess("Course created successfully!");
            }            

            setLoading(false);
            setTimeout(() => {
                setSuccess("");
                navigate("/admin-dashboard", {
                    state: {
                        // filterCourseId: res.data.course?._id,
                        // filterInstructorIds: payload.instructors,
                        refresh:true
                    },
                });
            }, 1500);
        } catch (err) {
            setErrors({ submit: "Failed to create course. Check your inputs and try again." });
            setLoading(false);
        }
    }

    return (
        <div className="create-course-bg">
            <form className="create-course-form" onSubmit={handleSubmit}>
                <h2>{isEditMode ? "Edit Course" : "Add New Course"}</h2>
                {/* Course Title */}
                <label>
                    <span>
                        Course Title <span className="required">*</span>
                    </span>
                    <input
                        type="text"
                        name="courseTitle"
                        value={form.courseTitle}
                        onChange={handleChange}
                        maxLength={80}
                    />
                    {errors.courseTitle && <div className="form-error">{errors.courseTitle}</div>}
                </label>
                {/* Description */}
                <label>
                    <span>
                        Description <span className="required">*</span>
                    </span>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        maxLength={800}
                        rows={3}
                    />
                    {errors.description && <div className="form-error">{errors.description}</div>}
                </label>
                {/* Certificate Description */}
                <label>
                    <span>
                        Certificate Description <span className="required">*</span>
                    </span>
                    <textarea
                        name="certDesc"
                        value={form.certDesc}
                        onChange={handleChange}
                        maxLength={120}
                        rows={3}
                        style={{ resize: "vertical", minHeight: 60, maxHeight: 300 }}
                    />
                    {errors.certDesc && <div className="form-error">{errors.certDesc}</div>}
                </label>

                {/* Course Type (MUI, untouched) */}
                <FormControl
                    fullWidth
                    className="course-type-mui"
                    margin="none"
                    error={Boolean(errors.courseType)}
                >
                    <label className="course-type-label" htmlFor="mui-course-type">
                        Course Type <span className="required">*</span>
                    </label>
                    <Select
                        labelId="mui-course-type"
                        value={form.courseType || ""}
                        name="courseType"
                        onChange={e => handleChange({ target: { name: "courseType", value: e.target.value } })}
                        className="course-type-mui"
                        MenuProps={{
                            classes: { paper: "course-type-mui" }
                        }}
                        displayEmpty
                        inputProps={{ id: "mui-course-type" }}
                    >
                        <MenuItem value="" disabled className="course-type-mui">Select type</MenuItem>
                        <MenuItem value="Short" className="course-type-mui">Short</MenuItem>
                        <MenuItem value="Long" className="course-type-mui">Long</MenuItem>
                    </Select>
                    {errors.courseType && (
                        <div className="form-error" style={{ marginTop: 13 }}><b>{errors.courseType}</b></div>
                    )}
                </FormControl>
                {/* Duration */}
                <label>
                    <span>
                        Duration <span className="required">*</span>
                    </span>
                    <input
                        type="text"
                        name="duration"
                        value={form.duration}
                        onChange={handleChange}
                        maxLength={40}
                        placeholder="e.g. 6 weeks, 1 semester"
                    />
                    {errors.duration && <div className="form-error">{errors.duration}</div>}
                </label>
                {/* Price */}
                <label>
                    <span>
                        Price <span className="required">*</span>
                    </span>
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        min="0"
                        step="any"
                        onChange={handleChange}
                        placeholder="e.g. 1 or 0.99 or for free"
                    />
                    {errors.price && <div className="form-error">{errors.price}</div>}
                </label>

                {/* INSTRUCTOR(S) FIELD STARTS */}
                <label>
                    <span>
                        Instructor(s) <span className="required">*</span>
                    </span>
                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={instructorSearch}
                        onChange={e => setInstructorSearch(e.target.value)}
                        style={{
                            marginBottom: 7,
                            padding: 8,
                            fontSize: "1rem",
                            borderRadius: 6,
                            border: "1px solid #bbb",
                            width: "100%",
                            background: "#fafbff"
                        }}
                    />
                    <div className="instructor-list-gamified">
                        {filteredInstructors.length === 0 && (
                            <div style={{ color: "#999", fontSize: "1rem" }}>No instructors found.</div>
                        )}
                        {filteredInstructors.map(inst => (
                            <div
                                key={inst._id}
                                className="instructor-option-gamified"
                            >
                                <input
                                    type="checkbox"
                                    value={inst._id}
                                    checked={form.instructors.includes(inst._id)}
                                    onChange={handleInstructorCheckbox}
                                    className="instructor-checkbox"
                                />
                                <span className="instructor-name">{inst.firstName} {inst.lastName}</span>
                                <span className="instructor-email">({inst.email})</span>
                            </div>
                        ))}
                    </div>
                    {errors.instructors && <div className="form-error">{errors.instructors}</div>}
                </label>
                {/* INSTRUCTOR(S) FIELD ENDS */}

                {/* Course Image */}
                <label className="image-upload-label">
                    Course Image
                    <div
                        className={`image-drop-zone${imageFile ? " image-dropped" : ""}`}
                        onClick={handleDropZoneClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        tabIndex={0}
                        style={{ cursor: isFileInputProcessing ? "wait" : "pointer" }}
                    >
                        <div className="image-preview-wrapper">
                            {imageFile && (
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    title="Remove Image"
                                    onClick={handleRemoveImage}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                    onTouchStart={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                >✖</button>
                            )}
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="image-preview"
                                draggable="false"
                                style={{
                                    pointerEvents: "none",
                                    userSelect: "none"
                                }}
                            />
                        </div>
                        <div className="image-drop-message">
                            {imageFile ? (
                                <>
                                    <span role="img" aria-label="check">✓</span>{" "}
                                    <span style={{ color: "#1ca421", fontWeight: 600, fontSize: "1.27rem" }}>Uploaded!</span>
                                </>
                            ) : (
                                <>
                                    <span role="img" aria-label="upload"></span>{" "}
                                    <span className="drop-text">
                                        {isFileInputProcessing ? "Uploading..." : "Drag & drop or click to upload"}
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="xp-bar-bg">
                            <div className="xp-bar-fill" style={{ width: imageFile ? "100%" : "0%" }}></div>
                        </div>
                        <input
                            type="file"
                            accept={SUPPORTED_IMG.join(",")}
                            style={{ display: "none" }}
                            ref={fileInputRef}
                            onChange={handleFileInputChange}
                            tabIndex={-1}
                        />
                    </div>
                    <button
                        type="button"
                        className="choose-image-btn modern-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleFileInputClick();
                        }}
                        disabled={isFileInputProcessing}
                    >
                        {isFileInputProcessing ? "Opening..." : (imageFile ? "Change Image" : "Choose Image")}
                    </button>
                    <div className="form-info">
                        File must be {MAX_IMAGE_SIZE_MB} MB max. Supported files: JPG, JPEG, PNG, GIF, BMP, WEBP.
                    </div>
                    {errors.imageUrl && <div className="form-error">{errors.imageUrl}</div>}
                </label>

                {/* Submit */}
                <button type="submit" className="create-course-btn" disabled={loading}>
                    {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Course" : "Add Course")}
                </button>
                {success && <div className="form-success">{success}</div>}
                {errors.submit && <div className="form-error">{errors.submit}</div>}
            </form>
        </div>
    );
}