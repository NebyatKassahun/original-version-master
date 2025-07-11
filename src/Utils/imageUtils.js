import { getBaseUrl } from './baseApi';

/**
 * Utility functions for handling images in the application
 */

/**
 * Get the full image URL from a relative or absolute URL
 * @param {string} imageUrl - The image URL (can be relative or absolute)
 * @returns {string} The full image URL
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  
  // If it's already a full URL (starts with http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative URL, prepend the base URL
  return `${getBaseUrl()}/${imageUrl}`;
};

/**
 * Check if an image URL is valid
 * @param {string} imageUrl - The image URL to check
 * @returns {boolean} True if the URL is valid
 */
export const isValidImageUrl = (imageUrl) => {
  if (!imageUrl) return false;
  
  // Check if it's a valid URL format
  try {
    const url = new URL(getFullImageUrl(imageUrl));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Handle image load error
 * @param {Event} event - The error event
 * @param {string} fallbackText - Text to show when image fails to load
 */
export const handleImageError = (event, fallbackText = 'Image failed to load') => {
  console.error('Image failed to load:', event.target.src);
  event.target.style.display = 'none';
  
  // Create a fallback element if needed
  const fallback = document.createElement('div');
  fallback.className = 'flex items-center justify-center bg-gray-100 text-gray-500 text-xs';
  fallback.textContent = fallbackText;
  event.target.parentNode.appendChild(fallback);
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @param {number} maxSize - Maximum file size in bytes (default: 10MB)
 * @returns {Object} Validation result with isValid and error properties
 */
export const validateImageFile = (file, maxSize = 10 * 1024 * 1024) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: `File size too large. Maximum size is ${formatFileSize(maxSize)}.` };
  }
  
  return { isValid: true, error: null };
}; 