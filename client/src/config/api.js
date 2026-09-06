/**
 * API Configuration & Utilities
 * In local development, VITE_API_URL is usually empty and requests are proxied via Vite.
 * In production (e.g. Render, Vercel), set VITE_API_URL to your backend URL (e.g. https://your-backend.onrender.com).
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * Safely parse JSON from a fetch Response.
 * Avoids raw syntax errors like "Unexpected end of JSON input" when the server
 * returns 404/502/503 or HTML/plain text error pages.
 * @param {Response} res
 * @returns {Promise<any>}
 */
export const safeJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (err) {
    if (res.status === 404) {
      throw new Error('Backend API endpoint not found (404). Please verify your backend service is running and VITE_API_URL is configured.');
    }
    if (res.status === 502 || res.status === 503) {
      throw new Error('Backend is currently sleeping or starting up on cloud server. Please wait 30 seconds and try again.');
    }
    if (!res.ok) {
      throw new Error(`Server returned error (${res.status}).`);
    }
    throw new Error('Server returned an invalid non-JSON response.');
  }
};
