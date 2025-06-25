// src/components/ModuleDetails.jsx
import React, { useEffect, useState } from "react";
import { renderFilePreview } from "../utils/filePreview"; // Create this utility

function ModuleDetails({ moduleId }) {
  const [module, setModule] = useState(null);

  useEffect(() => {
    // Fetch module details (pseudo-code)
    // axios.get(`/api/modules/${moduleId}`).then(res => setModule(res.data));
  }, [moduleId]);

  if (!module) return <div>Loading...</div>;

  return (
    <div className="module-details-card">
      <h2>{module.moduleTitle}</h2>
      <div
        className="module-description"
        dangerouslySetInnerHTML={{ __html: module.description }}
      />
      {/* Here is where you display the file previews */}
      <div className="module-files-list">
        {module.files && module.files.map(file => (
          <div key={file.url}>
            {renderFilePreview(file)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModuleDetails;
