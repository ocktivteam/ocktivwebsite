import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CourseNavbar from "./courseNavbar";
import { useSessionCheck } from '../hooks/useSessionCheck';
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
import { Mark, mergeAttributes, Node } from '@tiptap/core';

// --- Custom File Card Node for Tiptap ---
const FileCardNode = Node.create({
  name: "fileCard",
  group: "block",
  atom: true,
  draggable: false,
  selectable: true,
  addAttributes() {
    return {
      name: { default: "" },
      url: { default: "" },
      ext: { default: "" },
      localId: { default: "" }, // reference to local file
    };
  },
  parseHTML() {
    return [{ tag: "file-card" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["file-card", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.className = "file-card-block";
      dom.style.cssText = `
        display:flex;align-items:center;background:#fafbfc;
        border:1.7px solid #d7e3f6;border-radius:12px;
        padding:13px 19px;margin:14px 0;min-width:240px;max-width:550px;
        font-family:'Montserrat',Arial,sans-serif;box-shadow:0 2px 7px 0 rgba(60,60,60,0.07);
      `;

      let icon = "📄";
      const ext = node.attrs.ext || (node.attrs.name.split(".").pop().toLowerCase());
      if (["pdf"].includes(ext)) icon = "📕";
      if (["doc","docx"].includes(ext)) icon = "📄";
      if (["ppt","pptx"].includes(ext)) icon = "📊";
      if (["xls","xlsx"].includes(ext)) icon = "📋";
      if (["zip","rar","7z"].includes(ext)) icon = "🗜️";
      if (["jpg","jpeg","png","gif","webp"].includes(ext)) icon = "🖼️";

      const iconEl = document.createElement("span");
      iconEl.textContent = icon;
      iconEl.style.cssText = "font-size:1.7rem;margin-right:16px;user-select:none;";

      // Filename text (as link if url)
      const filenameEl = document.createElement("span");
      filenameEl.textContent = node.attrs.name;
      filenameEl.style.cssText = `
        font-size:1.07rem;font-weight:700;color:#18305c;margin-right:10px;flex:1;
        white-space:pre-wrap;word-break:break-all;user-select:text;cursor:pointer;
      `;
      if (node.attrs.url) {
        filenameEl.style.textDecoration = "underline";
        filenameEl.onclick = () => window.open(node.attrs.url, "_blank");
      }

      // Trash
      const trash = document.createElement("span");
      trash.textContent = "🗑️";
      trash.title = "Remove file";
      trash.style.cssText = "font-size:1.18rem;margin-left:18px;cursor:pointer;user-select:none;";
      trash.onclick = e => {
        e.stopPropagation();
        editor.chain().focus().deleteRange({ from: getPos(), to: getPos() + node.nodeSize }).run();
      };

      dom.appendChild(iconEl);
      dom.appendChild(filenameEl);
      dom.appendChild(trash);

      return { dom };
    };
  }
});

function extractFilesFromHTML(html) {
  const files = [];
  if (!html) return files;
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  // Images
  Array.from(doc.querySelectorAll("img")).forEach(el => {
    const src = el.src;
    if (src && !src.startsWith("data:")) {
      files.push({
        type: "image",
        name: el.alt || "Image",
        url: src,
        source: "upload", // or "external" if you want
      });
    }
  });
  // File Cards
  Array.from(doc.querySelectorAll("file-card")).forEach(el => {
    const url = el.getAttribute("url");
    const name = el.getAttribute("name");
    if (url) {
      files.push({
        type: getFileType(url, name),
        name: name || "File",
        url: url,
        source: "upload",
      });
    }
  });
  return files;
}

// --- FontSize Mark for Tiptap ---
const FontSize = Mark.create({
  name: "fontSize",
  addOptions() { return { HTMLAttributes: {} }; },
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
  parseHTML() { return [{ style: "font-size" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => chain().setMark(this.name, { fontSize }).run(),
    };
  },
});

// --- Config ---
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

function makeLocalId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// --- Main Component ---
export default function Content() {
  useSessionCheck();

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
  const [localFiles, setLocalFiles] = useState({});
  const fileInputRef = useRef(null);
  const [existingImages, setExistingImages] = useState({});

  // --- Tiptap Editor ---
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
      FileCardNode,
    ],
    content: "",
    editorProps: { attributes: { class: "content-tiptap-editorarea" } },
  });

  // --- Edit mode: load content ---
  useEffect(() => {
    if (mode === "edit" && moduleId && editor) {
      axios.get(`${MODULE_API}/${moduleId}`)
        .then(res => {
          const mod = res.data.module || res.data;
          setModuleTitle(mod.moduleTitle || "");
          editor.commands.setContent(mod.description || "");

          // Extract <img> tags from HTML and store in existingImages
          const container = document.createElement("div");
          container.innerHTML = mod.description || "";
          const imgs = Array.from(container.querySelectorAll("img"));
          let imgsMap = {};
          imgs.forEach(img => {
            if (img.src) {
              imgsMap[img.src] = {
                name: img.alt || "Image",
                url: img.src,
                type: "image"
              };
            }
          });
          setExistingImages(imgsMap);

        })
        .catch(() => setError("Failed to load module data."));
    }
    // eslint-disable-next-line
  }, [mode, moduleId, editor]);

  // --- Toolbar Actions ---
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

  // --- File Input Handler (delayed upload strategy) ---
  const handleFileInput = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    let newFiles = { ...localFiles };
  
    for (const file of files) {
      const ext = file.name.split(".").pop().toLowerCase();
      const localId = makeLocalId();
  
      if (file.type.startsWith("image/")) {
        // UPLOAD TO S3
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
          editor.chain().focus().insertContent({
            type: "image",
            attrs: {
              src: res.data.url,
              alt: file.name || "Image",
              style: "width:350px; height:auto;",
            }
          }).run();
        } catch (err) {
          setError("Image upload failed: " + (err?.response?.data?.error || err.message));
        }
      } else {
        editor.chain().focus().insertContent({
          type: "fileCard",
          attrs: {
            name: file.name,
            url: "", // Will be filled in after upload on submit
            ext,
            localId,
          }
        }).run();
        newFiles[localId] = file;
      }
    }
    setLocalFiles(newFiles);
    e.target.value = "";
  };

  // --- Handle actual upload on submit ---
  const handleUpload = async () => {
    setUploading(true); setError(""); setSuccess("");
    let json = editor.getJSON();

    // Find all localIds referenced in the editor (image and fileCard)
    let currentLocalIds = new Set();
    function findLocalIds(node) {
      if (!node) return;
      if (node.type === "image" && node.attrs && node.attrs["data-local-id"]) {
        currentLocalIds.add(node.attrs["data-local-id"]);
      }
      if (node.type === "fileCard" && node.attrs && node.attrs.localId) {
        currentLocalIds.add(node.attrs.localId);
      }
      if (node.content) node.content.forEach(findLocalIds);
    }
    findLocalIds(json);

    // Upload only files that are still referenced
    let filesToUpload = Object.entries(localFiles)
      .filter(([id]) => currentLocalIds.has(id))
      .map(([id, file]) => ({ id, file }));

    let uploadedFiles = [];
    let fileUploadMap = {};

    // Upload
    for (let { id, file } of filesToUpload) {
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
        uploadedFiles.push({ type, name: file.name, url, source: "upload" });
        fileUploadMap[id] = url;
      } catch (err) {
        setError("File upload failed: " + (err?.response?.data?.error || err.message));
        setUploading(false);
        return;
      }
    }

    // Replace localId image/fileCard src/urls in the JSON
    function updateFileRefs(node) {
      if (node.type === "image" && node.attrs && node.attrs["data-local-id"]) {
        const id = node.attrs["data-local-id"];
        if (fileUploadMap[id]) {
          node.attrs.src = fileUploadMap[id];
          delete node.attrs["data-local-id"];
        }
      }
      if (node.type === "fileCard" && node.attrs && node.attrs.localId) {
        const id = node.attrs.localId;
        if (fileUploadMap[id]) {
          node.attrs.url = fileUploadMap[id];
          delete node.attrs.localId;
        }
      }
      if (node.content) node.content.forEach(updateFileRefs);
    }
    updateFileRefs(json);

    // Set updated content in editor and get HTML
    editor.commands.setContent(json);
    const updatedHtml = editor.getHTML();

    // Step 4: Extract all files for metadata
    const filesFromEditor = extractFilesFromHTML(updatedHtml);
    const files = [
      ...uploadedFiles,
      ...filesFromEditor.filter(f => !uploadedFiles.find(up => up.url === f.url))
    ];

    // Step 5: Submit to backend
    const formDataObj = {
      moduleTitle,
      description: updatedHtml,
      files,
      courseId,
      createdBy: JSON.parse(localStorage.getItem("user"))?._id || "",
    };

    try {
      const token = localStorage.getItem("authToken");
      if (mode === "create") {
        const res = await axios.post(MODULE_API, formDataObj, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSuccess("Module created!");
        const user = JSON.parse(localStorage.getItem("user"));
        setTimeout(() => {
          setModuleTitle("");
          editor.commands.clearContent();
          setUploading(false);
          setSuccess("");
          setLocalFiles({});
          navigate(`/course/${courseId}`, user?.role === "instructor" && res.data?.module?._id
            ? { state: { selectedModuleId: res.data.module._id } }
            : undefined
          );
        }, 1000);
        return;
      } else {
        await axios.put(`${MODULE_API}/${moduleId}`, formDataObj, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSuccess("Module updated!");
        setTimeout(() => {
          setModuleTitle("");
          editor.commands.clearContent();
          setUploading(false);
          setSuccess("");
          setLocalFiles({});
          navigate(`/course/${courseId}`);
        }, 1000);
      }
    } catch {
      setError("Upload failed. Check your inputs and try again.");
      setUploading(false);
    }
  };

  // --- Add link/youtube ---
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

  // --- Drag/drop and paste files handler ---
  useEffect(() => {
    if (!editor) return;
    const dom = document.querySelector(".content-tiptap-editorarea");
    if (!dom) return;
    const handleDropPaste = (event) => {
      const dt = event.dataTransfer || event.clipboardData;
      if (!dt?.files?.length) return;
      let newFiles = { ...localFiles };
      Array.from(dt.files).forEach(file => {
        const ext = file.name.split(".").pop().toLowerCase();
        const localId = makeLocalId();
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = e => {
            editor.chain().focus().insertContent({
              type: "image",
              attrs: {
                src: e.target.result,
                alt: file.name || "Image",
                style: "width:350px; height:auto;",
                "data-local-id": localId
              }
            }).run();
          };
          reader.readAsDataURL(file);
          newFiles[localId] = file;
        } else {
          editor.chain().focus().insertContent({
            type: "fileCard",
            attrs: {
              name: file.name,
              url: "",
              ext,
              localId,
            }
          }).run();
          newFiles[localId] = file;
        }
      });
      setLocalFiles(newFiles);
      event.preventDefault();
    };
    dom.addEventListener("drop", handleDropPaste);
    dom.addEventListener("paste", handleDropPaste);
    return () => {
      dom.removeEventListener("drop", handleDropPaste);
      dom.removeEventListener("paste", handleDropPaste);
    };
  }, [editor, localFiles]);

  // --- Render ---
  return (
    <div>
      {/* <CourseNavbar /> */}
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
