// Helper function to validate image files before upload
// Max size: 2MB
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Please select an image file" };
  }

  // Check file size (2MB = 2 * 1024 * 1024 bytes)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "Image size must be less than 2MB" };
  }

  return { valid: true };
};

// Helper to read image file as base64
export const readImageAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
