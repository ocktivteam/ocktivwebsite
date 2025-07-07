// utils/filePreview.js
export function renderFilePreview(file) {
    const ext = file.url.split('.').pop().toLowerCase();
    if (file.type === "image" || /\.(jpg|jpeg|png|gif|webp)$/i.test(ext)) {
      return (
        <div style={{ marginBottom: 10 }}>
          <img src={file.url} alt={file.name} style={{ maxWidth: "100%", borderRadius: 8 }} />
          <a href={file.url} download target="_blank" rel="noopener noreferrer">
            <button>Download</button>
          </a>
        </div>
      );
    }
    if (file.type === "pdf" || /\.pdf$/i.test(ext)) {
      return (
        <div style={{ marginBottom: 10 }}>
          <iframe src={file.url} width="100%" height="450px" title={file.name} />
          <a href={file.url} download target="_blank" rel="noopener noreferrer">
            <button>Download PDF</button>
          </a>
        </div>
      );
    }
    if (file.type === "doc" || file.type === "ppt" || /\.(docx?|pptx?)$/i.test(ext)) {
      return (
        <div style={{ marginBottom: 10 }}>
          <iframe
            src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(file.url)}`}
            width="100%" height="450px" frameBorder="0" title={file.name}
          />
          <a href={file.url} download target="_blank" rel="noopener noreferrer">
            <button>Download {ext.toUpperCase()}</button>
          </a>
        </div>
      );
    }
    // Default
    return (
      <div style={{ marginBottom: 10 }}>
        <a href={file.url} download target="_blank" rel="noopener noreferrer">
          <button>Download {file.name}</button>
        </a>
      </div>
    );
  }
  