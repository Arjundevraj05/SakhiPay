// Mock file storage layer (no AWS calls).
// It returns a data URL so the UI can still "view" uploaded files as if they were stored remotely.
const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read selected file."));
    reader.readAsDataURL(file);
  });

/**
 * Upload a file to S3
 * @param {File} file - The file to upload
 * @param {string} userId - User ID for organizing files
 * @param {string} expenseId - Expense ID to associate with the file
 * @returns {Promise<Object>} - Upload result with file URL
 */
export const uploadFileToS3 = async (file, userId, expenseId) => {
  try {
    const fileUrl = await fileToDataUrl(file);
    const mockFileKey = `mock-storage/${userId || "guest"}/${expenseId || Date.now()}/${file.name}`;

    return {
      success: true,
      fileUrl: fileUrl,
      fileName: mockFileKey,
      etag: "mock-etag",
      provider: "local-mock",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get file from S3
 * @param {string} fileName - The S3 key of the file
 * @returns {Promise<Object>} - File data or error
 */
export const getFileFromS3 = async (fileName) => {
  return {
    success: true,
    data: fileName,
    contentType: "application/octet-stream",
  };
};

/**
 * Delete file from S3
 * @param {string} fileName - The S3 key of the file to delete
 * @returns {Promise<Object>} - Delete result
 */
export const deleteFileFromS3 = async (fileName) => {
  return {
    success: true,
    fileName,
    provider: "local-mock",
  };
};

/**
 * Generate a presigned URL for viewing files
 * @param {string} fileName - The S3 key for the file
 * @returns {Promise<Object>} - Presigned URL or error
 */
export const generatePresignedViewUrl = async (fileName) => {
  return {
    success: true,
    presignedUrl: fileName,
    provider: "local-mock",
  };
};

/**
 * Generate a presigned URL for file upload (alternative method)
 * @param {string} fileName - The S3 key for the file
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<Object>} - Presigned URL or error
 */
export const generatePresignedUploadUrl = async (fileName, contentType) => {
  return {
    success: true,
    presignedUrl: `mock-upload://${fileName}`,
    contentType,
    provider: "local-mock",
  };
};
