
import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Chip,
    Button,
    Tooltip,
    Stack,
    Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import axios from "axios";

export default function EmailComposePopup({ courseId, senderId, onClose }) {
    // Dark → Ocktiv navbar green
    const colors = {
        headerFrom: "#2E6B1F",  // darker green (left)
        headerTo: "#71B043",  // ocktiv navbar green (right)
        glow: "rgba(46,107,31,0.35)",
        primary: "#71B043"
    };

    const API_ROOT = useMemo(() => {
        return window.location.hostname === "localhost"
            ? "http://localhost:5050"
            : "https://ocktivwebsite-3.onrender.com";
    }, []);

    const [instructors, setInstructors] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState([]);
    const [expanded, setExpanded] = useState(false); // expands message area

    useEffect(() => {
        let mounted = true;
        async function fetchInstructors() {
            try {
                const res = await axios.get(`${API_ROOT}/api/courses/${courseId}`);
                const list = res.data?.course?.instructors || [];
                const mapped = list
                    .filter(x => x?.email)
                    .map(x => ({
                        id: x._id,
                        email: x.email,
                        name: [x.firstName, x.lastName].filter(Boolean).join(" ") || "Instructor"
                    }));
                if (!mounted) return;
                setInstructors(mapped);
                setRecipients(mapped);
            } catch (e) {
                console.error("Failed to load instructors", e);
                if (mounted) { setInstructors([]); setRecipients([]); }
            }
        }
        if (courseId) fetchInstructors();
        return () => { mounted = false; };
    }, [API_ROOT, courseId]);

    const removeRecipient = (id) => {
        setRecipients(prev => prev.filter(r => r.id !== id));
    };

    const handleFileChange = (e) => {
        const added = Array.from(e.target.files || []);
        if (!added.length) return;
        setFiles(prev => [...prev, ...added]);
        e.target.value = null;
    };

    // below handleFileChange
    const removeAttachment = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const canSend = recipients.length > 0 && subject.trim() && message.trim();
    async function handleSend() {
        if (!canSend) return;
        try {
            const fd = new FormData();
            fd.append("senderId", senderId);
            fd.append("courseId", courseId);
            recipients.forEach(r => fd.append("instructorIds[]", r.id));
            fd.append("subject", subject);
            fd.append("message", message);
            files.forEach(f => fd.append("attachments", f));

            const { data } = await axios.post(
                `${API_ROOT}/api/email/student-to-instructor`,
                fd,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (data?.status) {
                alert(`Email sent successfully to ${recipients.map(r => r.name).join(", ")}!`);
                setSubject("");
                setMessage("");
                setFiles([]);
                onClose?.();
            } else {
                alert(data?.message || "Failed to send email");
            }
        } catch (err) {
            console.error("Send email error:", err?.response?.data || err.message);
            alert(err?.response?.data?.message || "Failed to send email");
        }
    }

    return (
        <Paper
            elevation={16}
            sx={{
                position: "fixed",
                right: { xs: 8, sm: 16, md: 20 },
                bottom: { xs: 8, sm: 16, md: 20 },
                width: { xs: "96vw", sm: 600, md: 680 },   // ⬅ wider
                maxHeight: "70vh",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: `0 12px 32px ${colors.glow}`,
                zIndex: 2000
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#fff",
                    background: `linear-gradient(90deg, ${colors.headerFrom}, ${colors.headerTo})`
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Email Instructor(s)
                </Typography>
                <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }} aria-label="Close compose">
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{ p: 2, overflowY: "auto" }}>
                {/* To */}
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    To
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    {recipients.map(r => (
                        <Tooltip title={r.email} placement="top" arrow key={r.id}>
                            <Chip
                                label={r.name}
                                onDelete={() => removeRecipient(r.id)}
                                size="small"
                                sx={{ borderRadius: "999px" }}
                            />
                        </Tooltip>
                    ))}
                    {recipients.length === 0 && (
                        <Typography variant="body2" sx={{ color: "text.disabled", ml: 0.5 }}>
                            (No recipients selected)
                        </Typography>
                    )}
                </Stack>

                {/* Subject */}
                <TextField
                    size="small"
                    placeholder="Subject"
                    fullWidth
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    sx={{ mt: 1 }}
                />

                {/* Message + expand toggle */}
                {/* <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.25 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Message
                    </Typography>
                    <Tooltip title={expanded ? "Collapse editor" : "Expand editor"} arrow>
                        <IconButton size="small" onClick={() => setExpanded(x => !x)}>
                            {expanded ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Stack> */}
                {/* Message label */}
                <Typography variant="caption" sx={{ color: "text.secondary", mt: 2, display: "block" }}>
                    Message
                </Typography>

                <TextField
                    placeholder="Message"
                    fullWidth
                    multiline
                    minRows={3}  // ⬅ smaller starting size
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{
                        "& textarea": {
                            resize: "vertical",       // ⬅ user can drag to expand
                            minHeight: 80,            // ⬅ starting pixel height (~3 rows)
                            maxHeight: "56vh"         // ⬅ prevents it from getting too tall
                        }
                    }}
                />

                {/* Attachments */}
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 1.5 }}>
                    <Button component="label" startIcon={<AttachFileIcon />} size="small">
                        Attach
                        <input type="file" hidden multiple onChange={handleFileChange} />
                    </Button>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : ""}
                    </Typography>
                </Stack>

                {files.length > 0 && (
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                        {files.map((f, idx) => (
                            <Chip
                                key={`${f.name}-${idx}`}
                                variant="outlined"
                                size="small"
                                label={f.name}
                                onDelete={() => removeAttachment(idx)}   // ← actually removes from state
                            />
                        ))}
                    </Stack>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Footer actions */}
                <Stack spacing={1}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Replies go to your email.
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        For technical issues, contact <strong>support@ocktiv.com</strong>. Please only email instructors for questions about course content.
                    </Typography>
                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            endIcon={<SendIcon />}
                            onClick={handleSend}

                            disabled={!canSend}
                            sx={{
                                bgcolor: colors.primary,
                                borderRadius: "999px",
                                px: 2.5
                            }}
                        >
                            Send
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Paper>
    );
}
