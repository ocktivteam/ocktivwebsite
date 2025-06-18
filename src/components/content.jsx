// src/components/content.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CourseNavbar from "./courseNavbar";
import "../style/content.css";
import {
  OutlinedInput, Typography, Button, Box, Tooltip, IconButton, Menu, MenuItem, Popover
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  FormatBold, FormatItalic, FormatUnderlined, StrikethroughS,
  FormatListBulleted, FormatListNumbered, FormatColorText,
  FormatAlignLeft, FormatAlignCenter, FormatAlignRight,
  InsertLink, AttachFile as AttachFileIcon, Clear as ClearIcon
} from "@mui/icons-material";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { HexColorPicker } from "react-colorful";
import { Mark, mergeAttributes } from '@tiptap/core';

// --- FontSize Mark for Tiptap ---
const FontSize = Mark.create({
  name: "fontSize",
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize?.replace(/['"]/g, ""),
        renderHTML: attributes => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
  parseHTML() {
    return [{ style: "font-size" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => chain().setMark(this.name, { fontSize }).run(),
    };
  },
});

const MODULE_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/modules"
    : "https://ocktivwebsite-3.onrender.com/api/modules";

const fontSizes = [
  { label: "12px", value: "12px" },
  { label: "13px", value: "13px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
];

// Helper to get file type from url/file name
function getFileType(url = "", fileName = "") {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "video";
  if (/\.(pdf)$/i.test(url) || /\.pdf$/i.test(fileName)) return "pdf";
  if (/\.(doc|docx)$/i.test(url) || /\.(doc|docx)$/i.test(fileName)) return "doc";
  if (/\.(txt|csv)$/i.test(url) || /\.(txt|csv)$/i.test(fileName)) return "text";
  if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url) || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) return "image";
  return "external";
}

// Extract all files/links/images/youtube from HTML
function extractFilesFromHTML(html) {
  const files = [];
  if (!html) return files;

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // YouTube
  Array.from(doc.querySelectorAll("iframe")).forEach(el => {
    const src = el.src;
    if (src && (src.includes("youtube.com") || src.includes("youtu.be"))) {
      files.push({
        type: "video",
        name: "YouTube Video",
        url: src,
        source: "youtube",
      });
    }
  });

  // Images
  Array.from(doc.querySelectorAll("img")).forEach(el => {
    const src = el.src;
    if (src && !src.startsWith("data:")) {
      files.push({
        type: "image",
        name: el.alt || "Image",
        url: src,
        source: "external",
      });
    }
  });

  // Links/documents
  Array.from(doc.querySelectorAll("a")).forEach(el => {
    const url = el.href;
    if (!url) return;
    if (url.includes("youtube.com") || url.includes("youtu.be")) return;
    let type = getFileType(url, el.textContent);
    if (type === "image" && url.startsWith("data:")) return;
    if (type === "external" && url.startsWith("http")) type = "doc";
    files.push({
      type: type,
      name: el.textContent || "Document",
      url,
      source: "external",
    });
  });

  return files;
}

export default function Content() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [mode] = useState(moduleId ? "edit" : "create");
  const [moduleTitle, setModuleTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fontAnchor, setFontAnchor] = useState(null);
  const [colorAnchor, setColorAnchor] = useState(null);
  const [color, setColor] = useState("#1664b6");
  const fileInputRef = useRef(null);

  // TIPTAP EDITOR
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontSize,
      Link.configure({ openOnClick: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Compose your module—add text, links, YouTube, attachments..." }),
      Image,
      Youtube.configure({
        HTMLAttributes: { class: "tiptap-youtube" },
        controls: false,
      }),
    ],
    content: "",
    editorProps: { attributes: { class: "content-tiptap-editorarea" } },
  });

  // Load module in edit mode
  useEffect(() => {
    if (mode === "edit" && moduleId && editor) {
      axios.get(`${MODULE_API}/${moduleId}`)
        .then(res => {
          const mod = res.data.module || res.data;
          setModuleTitle(mod.moduleTitle || "");
          editor.commands.setContent(mod.description || "");
        })
        .catch(() => setError("Failed to load module data."));
    }
    // eslint-disable-next-line
  }, [mode, moduleId, editor]);

  // Upload handler: now extracts files array from editor HTML
  const handleUpload = async () => {
    setUploading(true); setError(""); setSuccess("");
    const description = editor.getHTML();
    const files = extractFilesFromHTML(description);

    const formData = {
      moduleTitle,
      description,
      files,
      courseId,
      createdBy: JSON.parse(localStorage.getItem("user"))?._id || "",
    };
    try {
      const token = localStorage.getItem("authToken"); // Get JWT token if using
      if (mode === "create") {
        await axios.post(MODULE_API, formData, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSuccess("Module created!");
      } else {
        await axios.put(`${MODULE_API}/${moduleId}`, formData, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSuccess("Module updated!");
      }
      setTimeout(() => {
        setModuleTitle("");
        editor.commands.clearContent();
        setUploading(false);
        setSuccess("");
        navigate(`/course/${courseId}`);
      }, 1000);
    } catch {
      setError("Upload failed. Check your inputs and try again."); setUploading(false);
    }
  };

  // --- TOOLBAR ACTIONS ---
  const handleFontMenu = (e) => setFontAnchor(e.currentTarget);
  const handleFontSelect = (size) => {
    editor.chain().focus().setFontSize(size).run();
    setFontAnchor(null);
  };

  const handleColorMenu = (e) => setColorAnchor(e.currentTarget);
  const handleColorChange = (col) => {
    setColor(col);
    editor.chain().focus().setColor(col).run();
  };

  // Handle file uploads (images)
  const handleFileInput = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
  
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = ev => {
          editor.chain().focus().insertContent({
            type: "image",
            attrs: {
              src: ev.target.result,
              alt: file.name || "Image",
              style: "width:350px; height:auto;"
            }
          }).run();
        };
        reader.readAsDataURL(file);
      } else {
        const formData = new FormData();
        formData.append("file", file);
  
        try {
          const res = await axios.post(
            window.location.hostname === "localhost"
              ? "http://localhost:5050/api/upload"
              : "https://ocktivwebsite-3.onrender.com/api/upload",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          const { url } = res.data;
          editor.chain().focus().insertContent(
            `<a href="${url}" target="_blank" rel="noopener noreferrer" download="${file.name}">${file.name}</a>`
          ).run();
        } catch (err) {
          setError("File upload failed: " + (err?.response?.data?.error || err.message));
        }
      }
    }
    e.target.value = "";
  };
  
  
  

  const handleAddLink = () => {
    const url = prompt("Paste a URL (YouTube, doc, article, etc):");
    if (!url) return;
    // YouTube detection (accepts youtu.be or youtube.com)
    const ytId = (
      url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
      url.match(/youtube\.com\/.*v=([A-Za-z0-9_-]{11})/)
    );
    if (ytId && ytId[1]) {
      editor.chain().focus().insertContent({
        type: "youtube",
        attrs: {
          src: url,
          width: 640,
          height: 360,
        }
      }).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // Drag/drop paste (handles images only)
  useEffect(() => {
    if (!editor) return;
    const dom = document.querySelector(".content-tiptap-editorarea");
    if (!dom) return;
    const handleDropPaste = (event) => {
      const dt = event.dataTransfer || event.clipboardData;
      if (!dt?.files?.length) return;
      Array.from(dt.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
        // Inside handleDropPaste
if (file.type.startsWith("image/")) {
  editor.chain().focus().insertContent({
    type: "image",
    attrs: {
      src: e.target.result,
      alt: file.name || "Image",
      style: "width:350px; height:auto;"
    }
  }).run();
}
 else {
            const url = URL.createObjectURL(file);
            editor.chain().focus().insertContent(
              `<a href="${url}" download="${file.name}">${file.name}</a>`
            ).run();
          }
        };
        reader.readAsDataURL(file);
      });
      event.preventDefault();
    };
    dom.addEventListener("drop", handleDropPaste);
    dom.addEventListener("paste", handleDropPaste);
    return () => {
      dom.removeEventListener("drop", handleDropPaste);
      dom.removeEventListener("paste", handleDropPaste);
    };
  }, [editor]);

  return (
    <div>
      <CourseNavbar />
      <div className="content-body">
        <Box className="content-form-card" sx={{ p: { xs: 2, md: 5 } }}>
          <Typography variant="h6" sx={{ color: "#1664b6", fontWeight: 700, mb: 2 }}>
            {mode === "edit" ? "Edit module" : "Create a new module"} <span className="content-required">*</span>
          </Typography>
          <OutlinedInput
            className="content-title-input"
            value={moduleTitle}
            onChange={e => setModuleTitle(e.target.value)}
            placeholder="Module Title"
            fullWidth
            sx={{
              fontSize: "1.09rem",
              fontWeight: 600,
              background: "#fafbfc",
              borderRadius: "9px",
              mb: 3
            }}
            inputProps={{ maxLength: 80 }}
          />

          <Typography variant="h6" sx={{ color: "#1664b6", fontWeight: 700, mt: 2, mb: 1 }}>
            Description / Body:
          </Typography>

          {/* Card/Toolbar/Editor */}
          <div className="content-editor-block">
            <div className="content-tiptap-toolbar">
              <Tooltip title="Bold"><IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} className={editor?.isActive("bold") ? "is-active" : ""}><FormatBold /></IconButton></Tooltip>
              <Tooltip title="Italic"><IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor?.isActive("italic") ? "is-active" : ""}><FormatItalic /></IconButton></Tooltip>
              <Tooltip title="Underline"><IconButton size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor?.isActive("underline") ? "is-active" : ""}><FormatUnderlined /></IconButton></Tooltip>
              <Tooltip title="Strikethrough"><IconButton size="small" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor?.isActive("strike") ? "is-active" : ""}><StrikethroughS /></IconButton></Tooltip>
              <span className="toolbar-divider" />
              {/* Font Color */}
              <Tooltip title="Font Color">
                <IconButton size="small" onClick={handleColorMenu}>
                  <FormatColorText sx={{ color: "#ffffff" }} />
                </IconButton>
              </Tooltip>
              <Popover
                open={Boolean(colorAnchor)}
                anchorEl={colorAnchor}
                onClose={() => setColorAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                <Box sx={{ p: 2 }}>
                  <HexColorPicker color={color} onChange={handleColorChange} />
                </Box>
              </Popover>
              {/* Font Size */}
              <Tooltip title="Font Size">
                <IconButton size="small" onClick={handleFontMenu}><span style={{ fontWeight: 700, fontSize: 18, borderBottom: '2px solid #1664b6', paddingBottom: 2, color: "#ffffff" }}>A</span></IconButton>
              </Tooltip>
              <Menu anchorEl={fontAnchor} open={Boolean(fontAnchor)} onClose={() => setFontAnchor(null)}>
                {fontSizes.map(size => (
                  <MenuItem key={size.value} onClick={() => handleFontSelect(size.value)}>
                    {size.label}
                  </MenuItem>
                ))}
              </Menu>
              <span className="toolbar-divider" />
              <Tooltip title="Bulleted List"><IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()}><FormatListBulleted /></IconButton></Tooltip>
              <Tooltip title="Numbered List"><IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()}><FormatListNumbered /></IconButton></Tooltip>
              <span className="toolbar-divider" />
              <Tooltip title="Align Left"><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign("left").run()}><FormatAlignLeft /></IconButton></Tooltip>
              <Tooltip title="Align Center"><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign("center").run()}><FormatAlignCenter /></IconButton></Tooltip>
              <Tooltip title="Align Right"><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign("right").run()}><FormatAlignRight /></IconButton></Tooltip>
              <span className="toolbar-divider" />
              <Tooltip title="Add Link or YouTube">
                <IconButton size="small" onClick={handleAddLink}>
                  <InsertLink />
                </IconButton>
              </Tooltip>
              <Tooltip title="Attach File or Image">
                <IconButton size="small" onClick={() => fileInputRef.current.click()}>
                  <AttachFileIcon />
                </IconButton>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.jpg,.jpeg,.png,.gif,.txt,.csv"
                  onChange={handleFileInput}
                />
              </Tooltip>
              <span className="toolbar-divider" />
              <Tooltip title="Clear Formatting">
                <IconButton size="small" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><ClearIcon /></IconButton>
              </Tooltip>
            </div>
            <EditorContent editor={editor} className="content-tiptap-editorarea" />
          </div>

          {error && <div className="content-error">{error}</div>}
          {success && <div className="content-success">{success}</div>}
          <Button
            variant="contained"
            color="primary"
            className="content-upload-btn"
            onClick={handleUpload}
            disabled={uploading || !moduleTitle.trim() || !editor?.getText().trim()}
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 4, minWidth: 180, fontWeight: 700, fontSize: "1.13rem" }}
          >
            {mode === "edit" ? "Update Module" : "Upload Module"}
          </Button>
        </Box>
      </div>
    </div>
  );
}
