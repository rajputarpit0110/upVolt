import { API_BASE_URL, safeJson } from '../config/api';

/**
 * Upload single or multiple files (images, datasheets, or video) to the server / Cloudinary.
 * Offloads media from MongoDB to high-speed CDN.
 * 
 * @param {File[]|FileList|File} files - Single File or array/FileList of File objects
 * @returns {Promise<string[]>} Array of clean HTTPS CDN URLs
 */
export const uploadMediaFiles = async (files) => {
  const fileArray = files instanceof FileList 
    ? Array.from(files) 
    : (Array.isArray(files) ? files : [files]);

  if (fileArray.length === 0) return [];

  const formData = new FormData();
  fileArray.forEach((file) => {
    formData.append('images', file);
  });

  const token = localStorage.getItem('upvolt_token') || localStorage.getItem('campuscircuit_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers,
    body: formData
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data?.message || 'Failed to upload media files');
  }

  if (data.urls && Array.isArray(data.urls)) {
    return data.urls;
  }
  if (data.url) {
    return [data.url];
  }

  return [];
};
