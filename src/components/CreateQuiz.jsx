import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../style/CreateQuiz.css";
import { useSessionCheck } from '../hooks/useSessionCheck';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaRegCopy, FaRegTrashAlt, FaRegImage } from "react-icons/fa";

const QUIZ_DRAFT_KEY = "ocktiv_quiz_form_draft";

// Configuration for input limits - easily adjustable for future changes
const INPUT_LIMITS = {
  POINTS: 100,
  ATTEMPTS_ALLOWED: 100,
  PASSING_RATE: 100
};

const API_ROOT =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://ocktivwebsite-3.onrender.com";

const UPLOAD_API = `${API_ROOT}/api/upload`;
const QUIZ_API = `${API_ROOT}/api/quiz`;

const MAX_IMAGE_SIZE_MB = 15;
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const SUPPORTED_IMG = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

const TIME_OPTIONS = [
  { value: 'unlimited', label: 'No time limit' },
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 'custom', label: 'Set custom time' }
];

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

// Utility function to enforce input limits
const enforceLimit = (value, maxLimit) => {
  const numValue = Number(value);
  if (isNaN(numValue) || numValue < 0) return 0;
  if (numValue > maxLimit) return maxLimit;
  return numValue;
};

// --- PreviewModal Component: Student View ---
const PreviewModal = ({ quiz, isOpen, onClose, themeImages }) => {
  const [previewAnswers, setPreviewAnswers] = useState([]);
  const [previewCurrentQuestion, setPreviewCurrentQuestion] = useState(0);
  const [previewPopupImg, setPreviewPopupImg] = useState(null);
  const [previewTimeLeft, setPreviewTimeLeft] = useState(null);

  // Timer setup
  useEffect(() => {
    if (isOpen && quiz.quizTime && !isNaN(quiz.quizTime)) {
      setPreviewTimeLeft(Number(quiz.quizTime) * 60);
    } else {
      setPreviewTimeLeft(null);
    }
  }, [isOpen, quiz.quizTime]);

  useEffect(() => {
    if (!isOpen || previewTimeLeft === null || previewTimeLeft === 0) return;
    const timer = setTimeout(() => setPreviewTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [previewTimeLeft, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setPreviewAnswers([]);
      setPreviewCurrentQuestion(0);
      setPreviewPopupImg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePreviewAnswer = (questionIndex, optionIndex) => {
    setPreviewAnswers(prev => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const goToPreviewQuestion = (index) => {
    setPreviewCurrentQuestion(index);
    const element = document.getElementById(`preview-quiz-q-card-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const getPreviewBackgroundStyle = () => {
    if (quiz.backgroundTheme === 'custom' && quiz.customBackground) {
      return {
        '--custom-bg-url': `url(${quiz.customBackground})`
      };
    }
    return {};
  };

  const getPreviewThemeAttribute = () => {
    if (quiz.backgroundTheme === 'custom') {
      return "custom";
    }
    return quiz.backgroundTheme || "theme1";
  };

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <div className="preview-modal-header">
          <h2>Student Preview</h2>
          <button className="preview-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="preview-quiz-game-layout">
          {/* LEFT PANEL: Question Nav */}
          <div className="preview-quiz-left-panel">
            <div className="quiz-left-panel-header">
              <h3>Questions</h3>
              <button className="preview-exit-btn" onClick={onClose}>
                Exit Quiz
              </button>
            </div>
            <div className="quiz-left-panel-content">
              <div className="quiz-left-panel-list">
                {quiz.questions?.map((question, idx) => (
                  <div
                    className={`quiz-nav-q ${previewAnswers[idx] !== undefined ? "answered" : ""} ${previewCurrentQuestion === idx ? "active" : ""}`}
                    key={idx}
                    onClick={() => goToPreviewQuestion(idx)}
                  >
                    <div className="question-nav-number">{idx + 1}</div>
                    <div className="question-nav-content">
                      <div className="question-nav-text">
                        {question.questionText?.substring(0, 40)}
                        {question.questionText?.length > 40 ? "..." : ""}
                      </div>
                      <div className="question-nav-meta">
                        {previewAnswers[idx] !== undefined ? "Answered" : "Not answered"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* MIDDLE PANEL: Student Quiz View */}
          <div
            className="preview-quiz-mid-panel"
            data-theme={getPreviewThemeAttribute()}
            style={getPreviewBackgroundStyle()}
          >
            <div className="quiz-gamified-main">
              <div className="quiz-title">{quiz.quizTitle}</div>
              <div className="quiz-description">{quiz.description}</div>
              {previewTimeLeft !== null && (
                <div className="quiz-timer-bar-wrap">
                  <div className="quiz-timer-bar-bg">
                    <div
                      className="quiz-timer-bar"
                      style={{
                        width: quiz.quizTime
                          ? `${Math.max(0, (previewTimeLeft / (quiz.quizTime * 60)) * 100)}%`
                          : "100%",
                      }}
                    ></div>
                  </div>
                  <div className={`quiz-timer-label${previewTimeLeft < 30 ? " urgent" : ""}`}>
                    {Math.floor(previewTimeLeft / 60)}:{String(previewTimeLeft % 60).padStart(2, "0")}
                  </div>
                </div>
              )}
              {quiz.questions?.map((question, idx) => (
                <div
                  key={idx}
                  className="quiz-q-card"
                  id={`preview-quiz-q-card-${idx}`}
                  onMouseEnter={() => setPreviewCurrentQuestion(idx)}
                >
                  <div className="quiz-q-meta">
                    <span className="quiz-q-index">Question {idx + 1}</span>
                    <span className="quiz-q-points">{question.points || 1} pt</span>
                  </div>
                  <div className="quiz-q-text">{question.questionText}</div>
                  {question.imageUrl && (
                    <div className="quiz-q-image">
                      <img
                        src={question.imageUrl}
                        alt="Quiz question visual"
                        style={{ cursor: "pointer" }}
                        onClick={() => setPreviewPopupImg(question.imageUrl)}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="quiz-q-options">
                    {question.options?.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={`quiz-q-option${previewAnswers[idx] === optionIndex ? " selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`preview-question-${idx}`}
                          value={optionIndex}
                          checked={previewAnswers[idx] === optionIndex}
                          onChange={() => handlePreviewAnswer(idx, optionIndex)}
                        />
                        <span className="quiz-q-option-label">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="quiz-q-option-text">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {quiz.questions?.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <button 
                    className="quiz-submit-btn" 
                    onClick={() => alert("This is preview mode - quiz not submitted")}
                    style={{
                      padding: '16px 32px',
                      background: 'var(--primary-gradient)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-md)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Submit Quiz (Preview)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Preview Image Popup */}
        {previewPopupImg && (
          <div
            className="quiz-image-popup-overlay"
            onClick={() => setPreviewPopupImg(null)}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img
              src={previewPopupImg}
              alt="Full screen quiz question"
              style={{
                maxWidth: "90vw",
                maxHeight: "85vh",
                borderRadius: 16,
                boxShadow: "0 8px 40px #0008",
                background: "#fff"
              }}
              onClick={e => e.stopPropagation()}
            />
            <button
              style={{
                position: "fixed",
                top: 32,
                right: 44,
                background: "rgba(0,0,0,0.6)",
                color: "white",
                border: "none",
                fontSize: 32,
                cursor: "pointer",
                borderRadius: 8,
                padding: "6px 18px"
              }}
              onClick={() => setPreviewPopupImg(null)}
            >×</button>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateQuiz = () => {
  useSessionCheck();
  const navigate = useNavigate();
  const { courseId: paramCourseId, id } = useParams();
  const [courseId, setCourseId] = useState(paramCourseId);  
  const isEditMode = Boolean(id);
  const user = getCurrentUser();
  const userId = user?._id;

  // THEME: State for dynamic S3 themes
  const [themeImages, setThemeImages] = useState([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [themeError, setThemeError] = useState("");

  const [form, setForm] = useState(() => {
    if (!isEditMode && localStorage.getItem(QUIZ_DRAFT_KEY)) {
      try {
        return JSON.parse(localStorage.getItem(QUIZ_DRAFT_KEY));
      } catch {}
    }
    return {
      quizTitle: "",
      description: "",
      courseId: courseId || "",
      userId: userId || "",
      quizType: "Mcq",
      questions: [],
      attemptsAllowed: 0,
      dueDate: "",
      quizGrade: 1,
      quizTime: 'unlimited',
      customTime: "",
      customTimeUnit: "minutes",
      isPublished: true,
      isGradedAutomatically: true,
      passingRate: 0.8,
      backgroundTheme: "",
      customBackground: ""
    };
  });

  const [leftPanelTab, setLeftPanelTab] = useState('questions');
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const middlePanelRef = useRef();
  const fileInputRef = useRef();
  const scrollTimeoutRef = useRef(); // kept

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fetch S3 themes ONCE on mount
  useEffect(() => {
    setLoadingThemes(true);
    axios.get(`${API_ROOT}/api/upload/themes`)
      .then(res => {
        setThemeImages(res.data); // [{ key, url }]
        setLoadingThemes(false);
      })
      .catch(() => {
        setThemeImages([]);
        setLoadingThemes(false);
      });
  }, []);

  useEffect(() => {
    setLoadingThemes(true);
    axios.get(`${UPLOAD_API}/themes`)
      .then(res => {
        setThemeImages(res.data || []);
        setLoadingThemes(false);
      })
      .catch(() => {
        setThemeError("Failed to load themes.");
        setLoadingThemes(false);
      });
  }, []);
  
  // Find the word lavender as default background
  useEffect(() => {
    if (!form.backgroundTheme && themeImages.length > 0) {
      // Try to find lavender (case-insensitive)
      const lavenderTheme = themeImages.find(img =>
        img.key.toLowerCase().includes("lavender")
      );
      setForm(prev => ({
        ...prev,
        backgroundTheme: lavenderTheme ? lavenderTheme.key : themeImages[0].key,
        customBackground: ""
      }));
    }
    // eslint-disable-next-line
  }, [themeImages]);
  

  useEffect(() => {
    if (!isEditMode) return;
    axios.get(`${QUIZ_API}/${id}`)
      .then(res => {
        const quiz = res.data;
        setCourseId(
            typeof quiz.courseId === "object" && quiz.courseId._id
              ? quiz.courseId._id
              : quiz.courseId
          );         

          let quizTime = 'unlimited';
          let customTime = '';
          let customTimeUnit = 'minutes';
    
          if (quiz.quizTime === null || quiz.quizTime === undefined) {
            quizTime = 'unlimited';
          } else if ([5,10,15,20,30,45,60].includes(Number(quiz.quizTime))) {
            quizTime = String(quiz.quizTime);
          } else if (typeof quiz.quizTime === 'number' && quiz.quizTime > 0) {
            quizTime = 'custom';
            // If it's divisible by 60, treat as hours (ex: 120 => 2 hours)
            if (quiz.quizTime % 60 === 0) {
              customTime = String(quiz.quizTime / 60);
              customTimeUnit = 'hours';
            } else {
              customTime = String(quiz.quizTime);
              customTimeUnit = 'minutes';
            }
          }
    
          // If quizTime is custom, customTime should NOT be empty!
          if (quizTime === 'custom' && !customTime) {
            customTime = String(quiz.quizTime);
            customTimeUnit = 'minutes';
          }
    
        const formData = {
          quizTitle: quiz.quizTitle || "",
          description: quiz.description || "",
          courseId: quiz.courseId || courseId || "",
          userId: quiz.userId || userId || "",
          quizType: quiz.quizType || "Mcq",
          questions: quiz.questions || [],
          attemptsAllowed: quiz.attemptsAllowed || 0,
          dueDate: quiz.dueDate ? quiz.dueDate.split('T')[0] : "",
          quizGrade: quiz.quizGrade || 1,
          // quizTime: quiz.quizTime || 'unlimited',
          // customTime: "",
          // customTimeUnit: "minutes",
          quizTime,        
          customTime,      
          customTimeUnit, 
          isPublished: quiz.isPublished !== undefined ? quiz.isPublished : true,
          isGradedAutomatically: quiz.isGradedAutomatically !== undefined ? quiz.isGradedAutomatically : true,
          passingRate: quiz.passingRate || 0.8,
          backgroundTheme: quiz.backgroundTheme || (themeImages[0]?.key || ""),
          customBackground: quiz.customBackground || ""
        };
        setForm(formData);
      })
      .catch(() => navigate(`/course/${courseId}`));
      // eslint-disable-next-line
  }, [id, isEditMode, courseId, userId, navigate, themeImages]);

  useEffect(() => {
    if (!isEditMode && form.quizTitle) {
      localStorage.setItem(QUIZ_DRAFT_KEY, JSON.stringify(form));
    }
  }, [form, isEditMode]);

  // === SYNC HIGHLIGHT WITH SCROLL (IntersectionObserver: pick most visible) ===
  useEffect(() => {
    const root = middlePanelRef.current;
    if (!root || form.questions.length === 0) return;

    const visibility = new Map();
    let raf = null;

    const updateActiveFromVisibility = () => {
      let maxRatio = -1;
      let bestIndex = 0;
      for (let i = 0; i < form.questions.length; i++) {
        const r = visibility.get(i) ?? 0;
        if (r > maxRatio) {
          maxRatio = r;
          bestIndex = i;
        }
      }
      setSelectedQuestion(bestIndex);
      raf = null;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id; // e.g. "question-3"
          const idx = Number(id.split("-")[1]);
          visibility.set(idx, entry.intersectionRatio);
        });
        if (!raf) {
          raf = requestAnimationFrame(updateActiveFromVisibility);
        }
      },
      {
        root,
        threshold: [0.1, 0.25, 0.5, 0.75, 1.0],
      }
    );

    // Observe all question elements
    for (let i = 0; i < form.questions.length; i++) {
      const el = document.getElementById(`question-${i}`);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [form.questions.length]);

  // THEME: Middle panel background
  let middlePanelBg = {};
  if (form.backgroundTheme === 'custom' && form.customBackground) {
    middlePanelBg = {
      background: `url(${form.customBackground}) center/cover no-repeat`
    };
  } else if (form.backgroundTheme && themeImages.length > 0) {
    const themeImg = themeImages.find(img => img.key === form.backgroundTheme);
    if (themeImg) {
      middlePanelBg = {
        background: `url(${themeImg.url}) center/cover no-repeat`
      };
    }
  }

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    // Apply limits for specific fields
    if (name === 'attemptsAllowed') {
      finalValue = enforceLimit(finalValue, INPUT_LIMITS.ATTEMPTS_ALLOWED);
    } else if (name === 'passingRate') {
      finalValue = enforceLimit(finalValue, INPUT_LIMITS.PASSING_RATE) / 100;
    }

    setForm(prev => ({
      ...prev,
      [name]: finalValue,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  // Handler specifically for points with limit enforcement
  const handlePointsChange = useCallback((index, value) => {
    const limitedValue = enforceLimit(value, INPUT_LIMITS.POINTS);
    updateQuestion(index, 'points', limitedValue);
  }, []);

  const addQuestion = useCallback(() => {
    const newQuestion = {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      type: "Mcq",
      imageUrl: "",
      points: 1 
    };
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    
    const newQuestionIndex = form.questions.length;
    setSelectedQuestion(newQuestionIndex);
    
    // AUTO-SCROLL: Scroll to the new question after it's rendered
    setTimeout(() => {
      const questionElement = document.getElementById(`question-${newQuestionIndex}`);
      if (questionElement && middlePanelRef.current) {
        questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // Small delay to ensure DOM is updated
  }, [form.questions.length]);

  const duplicateQuestion = useCallback((index) => {
    const questionToDuplicate = { ...form.questions[index] };
    questionToDuplicate.questionText += " (Copy)";
    setForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions.slice(0, index + 1),
        questionToDuplicate,
        ...prev.questions.slice(index + 1)
      ]
    }));
  }, [form.questions]);

  const deleteQuestion = useCallback((index) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    if (selectedQuestion >= form.questions.length - 1) {
      setSelectedQuestion(Math.max(0, form.questions.length - 2));
    }
  }, [selectedQuestion, form.questions.length]);

  const updateQuestion = useCallback((index, field, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  }, []);

  const updateQuestionOption = useCallback((questionIndex, optionIndex, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.map((opt, oi) => oi === optionIndex ? value : opt)
            } 
          : q
      )
    }));
  }, []);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const items = Array.from(form.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setForm(prev => ({
      ...prev,
      questions: items
    }));
    if (selectedQuestion === result.source.index) {
      setSelectedQuestion(result.destination.index);
    } else if (selectedQuestion === result.destination.index) {
      setSelectedQuestion(result.source.index > result.destination.index ? selectedQuestion + 1 : selectedQuestion - 1);
    }
  }, [form.questions, selectedQuestion]);

  const handleBackgroundUpload = async (file) => {
    if (!file) return;
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!SUPPORTED_IMG.includes(ext)) {
      setErrors(prev => ({
        ...prev,
        customBackground: `Unsupported file type. Supported: ${SUPPORTED_IMG.join(", ")}`,
      }));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors(prev => ({
        ...prev,
        customBackground: `Image too large. Max ${MAX_IMAGE_SIZE_MB} MB.`,
      }));
      return;
    }
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("keyPrefix", "quiz/backgrounds/");
      const res = await axios.post(UPLOAD_API, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm(prev => ({
        ...prev,
        customBackground: res.data.url,
        backgroundTheme: 'custom'
      }));
      setErrors(prev => ({ ...prev, customBackground: undefined }));
    } catch {
      setErrors(prev => ({ ...prev, customBackground: "Background upload failed." }));
    }
  };

  const handleQuestionImageUpload = async (questionIndex, file) => {
    if (!file) return;
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!SUPPORTED_IMG.includes(ext)) {
      setErrors(prev => ({
        ...prev,
        [`question_${questionIndex}_image`]: `Unsupported file type. Supported: ${SUPPORTED_IMG.join(", ")}`,
      }));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors(prev => ({
        ...prev,
        [`question_${questionIndex}_image`]: `Image too large. Max ${MAX_IMAGE_SIZE_MB} MB.`,
      }));
      return;
    }
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("keyPrefix", "quiz/questions/");
      const res = await axios.post(UPLOAD_API, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateQuestion(questionIndex, 'imageUrl', res.data.url);
      setErrors(prev => ({ ...prev, [`question_${questionIndex}_image`]: undefined }));
    } catch {
      setErrors(prev => ({ 
        ...prev, 
        [`question_${questionIndex}_image`]: "Question image upload failed." 
      }));
    }
  };

  const validate = useCallback(() => {
    const errs = {};
    if (!form.quizTitle.trim()) errs.quizTitle = "Quiz title is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (form.questions.length === 0) errs.questions = "At least one question is required.";
    form.questions.forEach((q, i) => {
      if (!q.questionText.trim()) {
        errs[`question_${i}`] = "Question text is required.";
      }
      if (q.options.some(opt => !opt.trim())) {
        errs[`question_${i}_options`] = "All answer options must be filled.";
      }
    });
    if (form.quizTime === 'custom') {
      if (!form.customTime || form.customTime <= 0) {
        errs.customTime = "Custom time must be greater than 0.";
      }
    }
    return errs;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    let finalQuizTime = null;
    if (form.quizTime === 'unlimited') {
      finalQuizTime = null;
    } else if (form.quizTime === 'custom') {
      const multiplier = form.customTimeUnit === 'hours' ? 60 : 1;
      finalQuizTime = Number(form.customTime) * multiplier;
    } else {
      finalQuizTime = Number(form.quizTime);
    }
    let backgroundUrl = "";
    if (form.backgroundTheme === 'custom') {
      backgroundUrl = form.customBackground;
    } else {
      const themeImg = themeImages.find(t => t.key === form.backgroundTheme);
      backgroundUrl = themeImg ? themeImg.url : "";
    }
    const payload = {
      quizTitle: form.quizTitle,
      description: form.description,
      courseId: form.courseId,
      userId: form.userId,
      quizType: form.quizType,
      questions: form.questions,
      attemptsAllowed: form.attemptsAllowed || 0,
      dueDate: form.dueDate || null,
      quizGrade: form.quizGrade,
      quizTime: finalQuizTime,
      isPublished: form.isPublished,
      isGradedAutomatically: form.isGradedAutomatically,
      passingRate: form.passingRate,
      backgroundTheme: form.backgroundTheme,
      customBackground: backgroundUrl
    };
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      if (isEditMode) {
        await axios.put(`${QUIZ_API}/${id}`, payload, { headers });
        setSuccess("Quiz updated successfully!");
      } else {
        await axios.post(QUIZ_API, payload, { headers });
        setSuccess("Quiz created successfully!");
      }
      if (!isEditMode) localStorage.removeItem(QUIZ_DRAFT_KEY);
      setLoading(false);
      setTimeout(() => {
        navigate(`/course/${courseId}`);
      }, 1500);
    } catch {
      setErrors({ submit: "Failed to save quiz. Please try again." });
      setLoading(false);
    }
  };

  const scrollToQuestion = (index) => {
    setSelectedQuestion(index);
    const questionElement = document.getElementById(`question-${index}`);
    if (questionElement && middlePanelRef.current) {
      questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- RENDER ---
  return (
    <div className="create-quiz-container">
      <div className="quiz-header">
        <div className="quiz-header-left">
          <h1>{isEditMode ? "Edit Quiz" : "Create New Quiz"}</h1>
          <p>Design an engaging quiz for your students</p>
        </div>
        <div className="quiz-header-right">
          <button
            className="back-to-modules-btn"
            onClick={() => navigate(`/course/${courseId}`)}
          >
            ← Back to Modules
          </button>
          <button
            type="button"
            className="preview-btn"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>

          <button
            type="button"
            className="save-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : (isEditMode ? "Update Quiz" : "Save Quiz")}
          </button>
        </div>
      </div>

      <div className={`kahoot-layout ${rightPanelCollapsed ? 'right-panel-collapsed' : ''}`}>
        <div className="left-panel">
          <div className="left-panel-tabs">
            <button
              className={`tab-btn ${leftPanelTab === 'questions' ? 'active' : ''}`}
              onClick={() => setLeftPanelTab('questions')}
            >
              Questions
            </button>
            <button
              className={`tab-btn ${leftPanelTab === 'customize' ? 'active' : ''}`}
              onClick={() => setLeftPanelTab('customize')}
            >
              Customize Theme
            </button>
          </div>
          <div className="left-panel-content">
            {leftPanelTab === 'questions' ? (
              <div className="questions-list">
                {form.questions.length > 0 && (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="questions-list">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {form.questions.map((question, index) => (
                            <Draggable key={index} draggableId={`question-${index}`} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`question-slide ${selectedQuestion === index ? 'active' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
                                  onClick={() => scrollToQuestion(index)}
                                >
                                  <div className="question-slide-number">{index + 1}</div>
                                  <div className="question-slide-content">
                                    {question.imageUrl && (
                                      <img src={question.imageUrl} alt="Question" className="question-slide-image" />
                                    )}
                                    <div className="question-slide-text">
                                      {question.questionText || `Question ${index + 1}`}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
                {form.questions.length === 0 && (
                  <div className="empty-questions-list">
                    <div className="empty-icon">❓</div>
                    <p>No questions yet</p>
                  </div>
                )}
                <button className="add-question-btn-left" onClick={addQuestion}>
                  + Add Question
                </button>
              </div>
            ) : (
              <div className="customize-content">
                <div className="form-group">
                  <label>Background Theme</label>

                  {themeError && <div className="error-text">{themeError}</div>}
                  {!loadingThemes && themeImages.length === 0 && (
                    <div style={{ color: "#aaa", marginBottom: 12 }}>No themes found.</div>
                  )}
                  <div className="theme-grid">
                    {themeImages.map((img, i) => (
                      <div
                        key={img.key}
                        className={`theme-option ${form.backgroundTheme === img.key ? 'selected' : ''}`}
                        onClick={() => setForm(prev => ({
                          ...prev,
                          backgroundTheme: img.key,
                          customBackground: ""
                        }))}
                      >
                        <div className="theme-preview" style={{
                          background: `url(${img.url}) center/cover no-repeat`
                        }}></div>
                        <span className="theme-name">
                          {img.key.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "").replace(/[-_]/g, " ")}
                        </span>
                      </div>
                    ))}
                    <div
                      className={`theme-option custom-theme ${form.backgroundTheme === 'custom' ? 'selected' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="theme-preview custom-preview">
                        {form.customBackground ? (
                          <img src={form.customBackground} alt="Custom background" />
                        ) : (
                          <div className="upload-icon">📁</div>
                        )}
                      </div>
                      <span className="theme-name">Custom</span>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={SUPPORTED_IMG.join(",")}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleBackgroundUpload(file);
                    }}
                    style={{ display: 'none' }}
                  />
                  {errors.customBackground && (
                    <div className="error-text">{errors.customBackground}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          className="middle-panel"
          ref={middlePanelRef}
          style={middlePanelBg} // THEME: Apply background style here
        >
          <div className="middle-panel-content">
            {form.questions.length > 0 ? (
              form.questions.map((question, index) => (
                // <div key={index} id={`question-${index}`} className="question-editor">
                <div key={index} id={`question-${index}`} className="question-editor question-card">
                  <div className="question-editor-header">
                    <div className="question-info">
                      <span className="question-number">Question {index + 1}</span>
                    </div>
                    <div className="question-actions">
                      <button
                        type="button"
                        className="duplicate-btn"
                        onClick={() => duplicateQuestion(index)}
                        title="Duplicate Question"
                      >
                        <FaRegCopy size={22} />
                      </button>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => deleteQuestion(index)}
                        title="Delete Question"
                      >
                        <FaRegTrashAlt size={22} color="#e74c3c" />
                      </button>

                    </div>
                  </div>
                  <div className="question-editor-content">
                    <div className="form-group">
                      <label>Question Text *</label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                        placeholder="Start typing your question..."
                        rows={3}
                        maxLength={500}
                      />
                      {errors[`question_${index}`] && (
                        <div className="error-text">{errors[`question_${index}`]}</div>
                      )}
                    </div>
                    <div className="form-group" style={{ maxWidth: 200 }}>
                      <label>Points (Max: {INPUT_LIMITS.POINTS})</label>
                      <input
                        type="number"
                        min="1"
                        max={INPUT_LIMITS.POINTS}
                        value={question.points || 1}
                        onChange={e => handlePointsChange(index, e.target.value)}
                        onBlur={e => handlePointsChange(index, e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Find and insert media</label>
                      <div className="image-upload-area">
                        {question.imageUrl && (
                          <div className="uploaded-image">
                            <img src={question.imageUrl} alt="Question" />
                            <button
                              type="button"
                              className="remove-image"
                              onClick={() => updateQuestion(index, 'imageUrl', '')}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <input
                          type="file"
                          accept={SUPPORTED_IMG.join(",")}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleQuestionImageUpload(index, file);
                          }}
                          className="file-input"
                        />
                        <div className="upload-placeholder">
                          <div className="upload-icon">
                            <FaRegImage size={48} color="#8898aa" />
                          </div>
                          <p>{question.imageUrl ? "Change media" : "Upload file or drag here to upload"}</p>
                        </div>
                      </div>
                      {errors[`question_${index}_image`] && (
                        <div className="error-text">{errors[`question_${index}_image`]}</div>
                      )}

                    </div>
                    <div className="answer-options">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className={`answer-option ${optionIndex < 2 ? 'required' : 'optional'}`}>
                          <div className="option-label" style={{
                            fontWeight: 700,
                            fontSize: 18,
                            width: 26,
                            height: 26,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "7px",
                            background: "#f2f6fb",
                            color: "#1d2a40",
                            marginRight: 12,
                          }}>
                            {String.fromCharCode(65 + optionIndex)}
                          </div>

                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value)}
                            placeholder={`Add answer ${optionIndex + 1}${optionIndex >= 2 ? ' (optional)' : ''}`}
                            maxLength={200}
                          />
                          <label className="correct-answer-radio">
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => updateQuestion(index, 'correctAnswer', optionIndex)}
                            />
                            <span className="radio-custom"></span>
                          </label>
                        </div>
                      ))}
                      {errors[`question_${index}_options`] && (
                        <div className="error-text">{errors[`question_${index}_options`]}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-middle-panel">
                <div className="empty-icon">❓</div>
                <h3>Start building your quiz</h3>
                <p>Add your first question to get started</p>
                <button className="add-question-btn-middle" onClick={addQuestion}>
                  + Add Question
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* --- RIGHT PANEL --- */}
        <div className={`right-panel ${rightPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="right-panel-header">
            <h3>Quiz Settings</h3>
            <button 
              className="collapse-btn"
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              title={rightPanelCollapsed ? "Expand Settings Panel" : "Collapse Settings Panel"}
            >
              {windowWidth <= 1024 ? (rightPanelCollapsed ? '↓' : '↑') : (rightPanelCollapsed ? '←' : '→')}
            </button>

          </div>
          {!rightPanelCollapsed && (
            <div className="right-panel-content">
              <div className="form-group">
                <label>Quiz Title *</label>
                <input
                  type="text"
                  name="quizTitle"
                  value={form.quizTitle}
                  onChange={handleChange}
                  placeholder="Enter Quiz Title..."
                  maxLength={80}
                />
                {errors.quizTitle && <div className="error-text">{errors.quizTitle}</div>}
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter Quiz Description..."
                  rows={3}
                  maxLength={500}
                />
                {errors.description && <div className="error-text">{errors.description}</div>}
              </div>
              <div className="form-group">
                <label>Time Limit</label>
                <select
                  name="quizTime"
                  value={form.quizTime}
                  onChange={handleChange}
                >
                  {TIME_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {form.quizTime === 'custom' && (
                <>
                  <div className="form-group">
                    <label>Custom Time</label>
                    <input
                      type="number"
                      name="customTime"
                      value={form.customTime}
                      onChange={handleChange}
                      placeholder="Enter time"
                      min="1"
                    />
                    {errors.customTime && <div className="error-text">{errors.customTime}</div>}
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <select
                      name="customTimeUnit"
                      value={form.customTimeUnit}
                      onChange={handleChange}
                    >
                      <option value="minutes">Minute(s)</option>
                      <option value="hours">Hour(s)</option>
                    </select>
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Attempts Allowed (Max: {INPUT_LIMITS.ATTEMPTS_ALLOWED})</label>
                <input
                  type="number"
                  name="attemptsAllowed"
                  value={form.attemptsAllowed}
                  onChange={handleChange}
                  onBlur={handleChange}
                  placeholder="0 = Unlimited"
                  min="0"
                  max={INPUT_LIMITS.ATTEMPTS_ALLOWED}
                />
              </div>
              <div className="form-group">
                <label>Passing Rate (%) - Max: {INPUT_LIMITS.PASSING_RATE}%</label>
                <input
                  type="number"
                  name="passingRate"
                  value={Math.round(form.passingRate * 100)}
                  onChange={handleChange}
                  onBlur={handleChange}
                  min="0"
                  max={INPUT_LIMITS.PASSING_RATE}
                />
              </div>
              {/* <div className="form-group">
                <label>Points per Question</label>
                <input
                  type="number"
                  name="quizGrade"
                  value={form.quizGrade}
                  onChange={handleChange}
                  min="1"
                />
              </div> */}
            </div>
          )}
        </div>
      </div>
      {rightPanelCollapsed && (
        <div
          className="right-panel-tab"
          onClick={() => setRightPanelCollapsed(false)}
          title="Show Quiz Settings"
        >
          ⚙️
        </div>
      )}
      {success && (
        <div className="success-message">
          <div className="success-content">
            <span className="success-icon"></span>
            <span>{success}</span>
          </div>
        </div>
      )}
      {errors.submit && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon"></span>
            <span>{errors.submit}</span>
          </div>
        </div>
      )}

      {/* STUDENT PREVIEW MODAL */}
      <PreviewModal 
        quiz={form}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        themeImages={themeImages}
      />

    </div>
  );
};

export default CreateQuiz;
