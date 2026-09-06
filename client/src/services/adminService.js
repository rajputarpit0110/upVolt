import { API_BASE_URL, safeJson } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/admin`;

/**
 * Fetch audit logs (Restricted to Master Admin)
 * @param {Object} [params]
 */
export const fetchAuditLogs = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.action) query.append('action', params.action);
  if (params.adminEmail) query.append('adminEmail', params.adminEmail);

  const headers = {};
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/audit-logs?${query.toString()}`, { headers });
  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch audit logs.');
  }

  return data.logs || [];
};

/**
 * Fetch overall administrative stats
 */
export const fetchAdminStats = async () => {
  const headers = {};
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/stats`, { headers });
  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch admin statistics.');
  }

  return data.stats;
};

/**
 * Change / Reset password for logged in admin
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export const resetPassword = async (currentPassword, newPassword) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ currentPassword, newPassword })
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to reset password.');
  }

  if (data.token) {
    localStorage.setItem('campuscircuit_token', data.token);
  }

  return data;
};

/**
 * Fetch live analytics (live users, total visitors, rough locations)
 * Accessible to all 3 administrators
 */
export const fetchLiveAnalytics = async () => {
  const headers = {};
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/analytics/live`, { headers });
  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch live analytics.');
  }

  return data.data;
};

/**
 * Reset / clear all test & pre-deployment visitor analytics
 */
export const resetLiveAnalytics = async () => {
  const headers = {};
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/analytics/reset`, {
    method: 'DELETE',
    headers
  });
  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to reset analytics.');
  }

  return data;
};
