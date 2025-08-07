import axios from 'axios';

// Configuration
const API_ROOT = window.location.hostname === "localhost" 
  ? "http://localhost:5050" 
  : "https://ocktivwebsite-3.onrender.com";

const UPLOAD_API = `${API_ROOT}/api/upload`;

// File validation constants
export const MAX_IMAGE_SIZE_MB = 15;
export const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024; // 15MB in bytes
export const SUPPORTED_IMAGE_TYPES = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

// Mime type mapping
const MIME_TYPE_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp'
};

/**
 * Validates file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = MAX_IMAGE_SIZE,
    allowedTypes = SUPPORTED_IMAGE_TYPES,
    allowedMimeTypes = Object.values(MIME_TYPE_MAP)
  } = options;

  if (!file) {
    return {
      isValid: false,
      error: "No file selected"
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB`
    };
  }

  // Check file extension
  const fileExtension = '.' + (file.name.split('.').pop() || '').toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Unsupported file type. Supported types: ${allowedTypes.join(', ')}`
    };
  }

  // Check MIME type
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file format. Please upload a valid image file.`
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Generates a unique filename with timestamp
 * @param {string} originalName - Original filename
 * @param {string} prefix - Optional prefix
 * @returns {string} - Unique filename
 */
export const generateUniqueFilename = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.substring(originalName.lastIndexOf('.'));
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '-');
  
  return `${prefix}${baseName}-${timestamp}-${random}${extension}`;
};

/**
 * Compresses image file if needed
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed file
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      outputFormat = 'image/jpeg'
    } = options;

    // If file is already small enough, return as is
    if (file.size <= 1024 * 1024) { // 1MB
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with compressed data
            const compressedFile = new File([blob], file.name, {
              type: outputFormat,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Compression failed'));
          }
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Uploads file to AWS S3 via backend API
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
export const uploadFile = async (file, options = {}) => {
  const {
    keyPrefix = 'uploads/',
    compress = true,
    onProgress = () => {},
    signal = null
  } = options;

  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Compress image if needed and enabled
    let fileToUpload = file;
    if (compress && file.type.startsWith('image/')) {
      try {
        fileToUpload = await compressImage(file, {
          quality: 0.85,
          maxWidth: 1920,
          maxHeight: 1080
        });
      } catch (compressionError) {
        console.warn('Image compression failed, uploading original:', compressionError);
        fileToUpload = file;
      }
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('keyPrefix', keyPrefix);
    
    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    formData.append('filename', uniqueFilename);

    // Get auth token
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    // Upload with progress tracking
    const response = await axios.post(UPLOAD_API, formData, {
      headers,
      signal,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    });

    return {
      success: true,
      url: response.data.url,
      key: response.data.key,
      filename: uniqueFilename,
      originalFilename: file.name,
      size: fileToUpload.size,
      type: fileToUpload.type
    };

  } catch (error) {
    // Handle different types of errors
    if (error.name === 'AbortError') {
      throw new Error('Upload cancelled');
    }
    
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Upload failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      // Other errors (validation, compression, etc.)
      throw new Error(error.message || 'Upload failed');
    }
  }
};

/**
 * Uploads multiple files
 * @param {FileList|Array} files - Files to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleFiles = async (files, options = {}) => {
  const {
    concurrent = 3,
    onProgress = () => {},
    onFileComplete = () => {}
  } = options;

  const fileArray = Array.from(files);
  const results = [];
  const errors = [];
  
  // Process files in batches
  for (let i = 0; i < fileArray.length; i += concurrent) {
    const batch = fileArray.slice(i, i + concurrent);
    
    const batchPromises = batch.map(async (file, index) => {
      try {
        const result = await uploadFile(file, {
          ...options,
          onProgress: (progress) => {
            onProgress(i + index, progress, file.name);
          }
        });
        
        onFileComplete(i + index, result, null);
        return result;
      } catch (error) {
        onFileComplete(i + index, null, error);
        return { error: error.message, filename: file.name };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  // Separate successful uploads from errors
  const successful = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);

  return {
    successful,
    failed,
    total: fileArray.length,
    successCount: successful.length,
    errorCount: failed.length
  };
};

/**
 * Deletes file from S3 (if backend supports it)
 * @param {string} fileKey - S3 file key to delete
 * @returns {Promise<Object>} - Delete result
 */
export const deleteFile = async (fileKey) => {
  try {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.delete(`${UPLOAD_API}/${encodeURIComponent(fileKey)}`, {
      headers
    });

    return {
      success: true,
      message: response.data.message || 'File deleted successfully'
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      'Failed to delete file'
    );
  }
};

/**
 * Gets file info/metadata
 * @param {string} fileUrl - File URL
 * @returns {Promise<Object>} - File metadata
 */
export const getFileInfo = async (fileUrl) => {
  try {
    const response = await axios.head(fileUrl);
    return {
      size: parseInt(response.headers['content-length'] || '0'),
      type: response.headers['content-type'],
      lastModified: response.headers['last-modified']
    };
  } catch (error) {
    throw new Error('Failed to get file information');
  }
};

/**
 * Creates a preview URL for file
 * @param {File} file - File to preview
 * @returns {string} - Preview URL
 */
export const createPreviewUrl = (file) => {
  if (!file || !file.type.startsWith('image/')) {
    return null;
  }
  return URL.createObjectURL(file);
};

/**
 * Revokes preview URL to free memory
 * @param {string} url - Preview URL to revoke
 */
export const revokePreviewUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Hook for file upload with React state management
 * @param {Object} options - Hook options
 * @returns {Object} - Upload state and functions
 */
export const useFileUpload = (options = {}) => {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState(null);

  const upload = async (file, uploadOptions = {}) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const uploadResult = await uploadFile(file, {
        ...options,
        ...uploadOptions,
        onProgress: (percent) => {
          setProgress(percent);
          uploadOptions.onProgress?.(percent);
        }
      });

      setResult(uploadResult);
      return uploadResult;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  };

  return {
    upload,
    uploading,
    progress,
    error,
    result,
    reset
  };
};

// Default export
export default {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  validateFile,
  compressImage,
  createPreviewUrl,
  revokePreviewUrl,
  getFileInfo,
  generateUniqueFilename,
  useFileUpload,
  MAX_IMAGE_SIZE_MB,
  MAX_IMAGE_SIZE,
  SUPPORTED_IMAGE_TYPES
};