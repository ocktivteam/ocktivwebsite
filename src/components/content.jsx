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

// SVG ICON MAP (as Data URI for <img>)
const iconSvgs = {
  pdf: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#d32f2f" d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 7V3.5L18.5 9ZM8 12h8v2H8zm0 4h5v2H8z"/></svg>`,
  doc: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#1565c0" d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 7V3.5L18.5 9ZM8 12h8v2H8zm0 4h5v2H8z"/></svg>`,
  pptx: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#e67e22" d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 7V3.5L18.5 9ZM8 12h8v2H8zm0 4h5v2H8z"/></svg>`,
  xlsx: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#388e3c" d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 7V3.5L18.5 9ZM8 12h8v2H8zm0 4h5v2H8z"/></svg>`,
  image: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#228be6" d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Zm-9-4l-2.5 3.01L7 15l-4 5h18l-5-6Z"/></svg>`,
  video: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#d9480f" d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11ZM15 17H5V7h10ZM7 9v6l5-3Z"/></svg>`,
  zip: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#6d4c41" d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 7V3.5L18.5 9ZM8 12h8v2H8zm0 4h5v2H8z"/></svg>`,
  text: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#607d8b" d="M6 4h12v2H6zm0 4h7v2H6zm0 4h12v2H6zm0 4h7v2H6z"/></svg>`,
  default: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#616161" d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 7V3.5L18.5 9ZM8 12h8v2H8zm0 4h5v2H8z"/></svg>`
};

function fileIconSvg(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (file.type && file.type.startsWith('image/')) return iconSvgs.image;
  if (file.type && file.type.startsWith('video/')) return iconSvgs.video;
  if (ext === 'pdf') return iconSvgs.pdf;
  if (['doc', 'docx'].includes(ext)) return iconSvgs.doc;
  if (['ppt', 'pptx'].includes(ext)) return iconSvgs.pptx;
  if (['xls', 'xlsx'].includes(ext)) return iconSvgs.xlsx;
  if (['zip', 'rar', '7z', '7zip'].includes(ext)) return iconSvgs.zip;
  if (['txt', 'csv'].includes(ext)) return iconSvgs.text;
  return iconSvgs.default;
}
function fileIconSvgDataUri(file) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(fileIconSvg(file))}`;
}
const getStrictCardHtml = (file) => {
  const svgUri = fileIconSvgDataUri(file);
  return `
    <a class="file-pill-strictcard" contenteditable="false" tabindex="-1"
      style="display:inline-flex;align-items:center;background:#dadada;border-radius:3px;padding:18px 34px 18px 22px;margin:14px 0;min-width:340px;max-width:700px;gap:22px;text-decoration:none;user-select:none;">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:50px;height:50px;background:#000;border-radius:50%;flex-shrink:0;">
        <img src="${svgUri}" alt="" style="width:28px;height:28px;display:block;" />
      </span>
      <span style="font-weight:900;font-size:2rem;color:#181818;font-family:'Montserrat',sans-serif;line-height:1;">
        ${file.name}
      </span>
    </a>
  `;
};

// --- FontSize Mark for Tiptap ---
const FontSize = Mark.create({
  name: "fontSize",
  addOptions() {
    return { HTMLAttributes: {} };
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

function getFileType(url = "", fileName = "") {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "video";
  if (/\.(pdf)$/i.test(url) || /\.pdf$/i.test(fileName)) return "pdf";
  if (/\.(doc|docx)$/i.test(url) || /\.(doc|docx)$/i.test(fileName)) return "doc";
  if (/\.(txt|csv)$/i.test(url) || /\.(txt|csv)$/i.test(fileName)) return "text";
  if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url) || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) return "image";
  if (/\.(ppt|pptx)$/i.test(url) || /\.(ppt|pptx)$/i.test(fileName)) return "pptx";
  if (/\.(xls|xlsx)$/i.test(url) || /\.(xls|xlsx)$/i.test(fileName)) return "xlsx";
  if (/\.(zip)$/i.test(url) || /\.zip$/i.test(fileName)) return "zip";
  if (/\.(rar)$/i.test(url) || /\.rar$/i.test(fileName)) return "rar";
  if (/\.(7z|7zip)$/i.test(url) || /\.7z(ip)?$/i.test(fileName)) return "7zip";
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
  const [pendingFiles, setPendingFiles] = useState([]);
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

  // STRICT CARD for DOCX, PDF, etc
  const handleFileInput = (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    let newFiles = [];
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
        newFiles.push(file);
      } else {
        const pillHtml = getStrictCardHtml(file);
        editor.chain().focus().insertContent(pillHtml).run();
        newFiles.push(file);
      }
    }
    setPendingFiles(pending => [...pending, ...newFiles]);
    e.target.value = "";
  };

  // --- MAIN UPLOAD HANDLER (unchanged) ---
  const handleUpload = async () => {
    setUploading(true); setError(""); setSuccess("");
    let description = editor.getHTML();
    let uploadedFiles = [];

    for (const file of pendingFiles) {
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
        let type = getFileType(url, file.name);

        if (file.type.startsWith("image/")) {
          const regex = new RegExp(
            `<img[^>]+src=["'][^"']*["'][^>]*alt=["']${file.name}["'][^>]*>`,
            "g"
          );
          description = description.replace(regex, `<img src="${url}" alt="${file.name}" style="width:350px; height:auto;">`);
          uploadedFiles.push({ type, name: file.name, url, source: "upload" });
        } else {
          // Replace pill href to S3 URL (name stays, icon stays)
          const regex = new RegExp(
            `<a[^>]*class=["']file-pill-strictcard["'][^>]*href=["'][^"']*["'][^>]*>([\\s\\S]*?)${file.name}([\\s\\S]*?)<\\/a>`,
            "g"
          );
          const svgUri = fileIconSvgDataUri(file);
          const newPill = `
            <a class="file-pill-strictcard" contenteditable="false" tabindex="-1" href="${url}" target="_blank" rel="noopener noreferrer"
              style="display:inline-flex;align-items:center;background:#dadada;border-radius:3px;padding:18px 34px 18px 22px;margin:14px 0;min-width:340px;max-width:700px;gap:22px;text-decoration:none;user-select:none;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:50px;height:50px;background:#000;border-radius:50%;flex-shrink:0;">
                <img src="${svgUri}" alt="" style="width:28px;height:28px;display:block;" />
              </span>
              <span style="font-weight:900;font-size:2rem;color:#181818;font-family:'Montserrat',sans-serif;line-height:1;">
                ${file.name}
              </span>
            </a>`;
          description = description.replace(regex, newPill);
          uploadedFiles.push({ type, name: file.name, url, source: "upload" });
        }
      } catch (err) {
        setError("File upload failed: " + (err?.response?.data?.error || err.message));
        setUploading(false);
        return;
      }
    }

    const filesFromEditor = extractFilesFromHTML(description);
    const files = [
      ...uploadedFiles,
      ...filesFromEditor.filter(f => !uploadedFiles.find(up => up.url === f.url))
    ];

    const formDataObj = {
      moduleTitle,
      description,
      files,
      courseId,
      createdBy: JSON.parse(localStorage.getItem("user"))?._id || "",
    };
    try {
      const token = localStorage.getItem("authToken");
      if (mode === "create") {
        await axios.post(MODULE_API, formDataObj, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSuccess("Module created!");
      } else {
        await axios.put(`${MODULE_API}/${moduleId}`, formDataObj, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSuccess("Module updated!");
      }
      setTimeout(() => {
        setModuleTitle("");
        editor.commands.clearContent();
        setUploading(false);
        setSuccess("");
        setPendingFiles([]);
        navigate(`/course/${courseId}`);
      }, 1000);
    } catch {
      setError("Upload failed. Check your inputs and try again."); setUploading(false);
    }
  };

  const handleAddLink = () => {
    const url = prompt("Paste a URL (YouTube, doc, article, etc):");
    if (!url) return;
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

  // Drag/drop paste logic for files (uses strict card for non-images)
  useEffect(() => {
    if (!editor) return;
    const dom = document.querySelector(".content-tiptap-editorarea");
    if (!dom) return;
    const handleDropPaste = (event) => {
      const dt = event.dataTransfer || event.clipboardData;
      if (!dt?.files?.length) return;
      Array.from(dt.files).forEach(file => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = e => {
            editor.chain().focus().insertContent({
              type: "image",
              attrs: {
                src: e.target.result,
                alt: file.name || "Image",
                style: "width:350px; height:auto;"
              }
            }).run();
          };
          reader.readAsDataURL(file);
          setPendingFiles(pending => [...pending, file]);
        } else {
          const pillHtml = getStrictCardHtml(file);
          editor.chain().focus().insertContent(pillHtml).run();
          setPendingFiles(pending => [...pending, file]);
        }
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

  // ---- FILE PREVIEW CARDS (rectangle style) ----
  const renderPendingFileCard = (file, idx) => (
    <div
      key={idx}
      style={{
        display: "flex",
        alignItems: "center",
        background: "#f6f7fb",
        border: "1.5px solid #d2e3fc",
        borderRadius: 10,
        padding: "10px 14px",
        gap: 16,
        marginBottom: 10,
        minWidth: 280,
        maxWidth: 420
      }}
    >
      {file.type.startsWith("image/") ? (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          style={{ width: 44, height: 44, borderRadius: 7, objectFit: "cover", border: "1px solid #ccc" }}
        />
      ) : (
        <img src={fileIconSvgDataUri(file)} alt="" style={{ width: 32, height: 32, marginRight: 9 }} />
      )}
      <div style={{ flex: 1 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#194f99" }}>
          {file.name}
        </Typography>
      </div>
      <Button size="small" color="secondary" onClick={() => {
        setPendingFiles(files => files.filter((_, i) => i !== idx));
      }}>
        Remove
      </Button>
    </div>
  );

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

          {pendingFiles.length > 0 && (
            <div style={{ marginBottom: 20, marginTop: 4 }}>
              {pendingFiles.map((file, idx) => renderPendingFileCard(file, idx))}
            </div>
          )}

          <div className="content-editor-block">
            <div className="content-tiptap-toolbar">
              <Tooltip title="Bold"><IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} className={editor?.isActive("bold") ? "is-active" : ""}><FormatBold /></IconButton></Tooltip>
              <Tooltip title="Italic"><IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor?.isActive("italic") ? "is-active" : ""}><FormatItalic /></IconButton></Tooltip>
              <Tooltip title="Underline"><IconButton size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor?.isActive("underline") ? "is-active" : ""}><FormatUnderlined /></IconButton></Tooltip>
              <Tooltip title="Strikethrough"><IconButton size="small" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor?.isActive("strike") ? "is-active" : ""}><StrikethroughS /></IconButton></Tooltip>
              <span className="toolbar-divider" />
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
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.7z,.7zip,.jpg,.jpeg,.png,.gif,.bmp,.webp,.txt,.csv"
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
            disabled={uploading || !moduleTitle.trim()}
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 4, minWidth: 180, fontWeight: 700, fontSize: "1.13rem", display: "block",
              mx: "auto", }}
          >
            {mode === "edit" ? "Update Module" : "Upload Module"}
          </Button>
        </Box>
      </div>
    </div>
  );
}
