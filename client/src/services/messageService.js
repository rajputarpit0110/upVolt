import { API_BASE_URL, safeJson } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/messages`;

/**
 * Public: Send a contact message / inquiry
 * @param {{ name: string, email: string, subject: string, message: string }} formData
 */
export const submitContactMessage = async (formData) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to send message. Please try again.');
  }

  return data;
};

/**
 * Admin: Fetch inquiries with optional status filter
 * @param {{ status?: string, limit?: number }} [params]
 */
export const fetchAdminMessages = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') {
    query.append('status', params.status);
  }
  if (params.limit) {
    query.append('limit', String(params.limit));
  }

  const headers = {};
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = query.toString() ? `${API_BASE}?${query.toString()}` : API_BASE;
  const res = await fetch(url, { headers });
  const data = await safeJson(res);

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load inquiries.');
  }

  return {
    messages: data.messages || [],
    total: data.total || 0,
    unreadCount: data.unreadCount || 0
  };
};

/**
 * Admin: Update status of a message ('unread', 'read', 'replied')
 * @param {string} id
 * @param {'unread' | 'read' | 'replied'} status
 */
export const updateMessageStatus = async (id, status) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status })
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update message status.');
  }

  return data.data;
};

/**
 * Admin: Delete an inquiry by ID
 * @param {string} id
 */
export const deleteMessage = async (id) => {
  const headers = {};
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete message.');
  }

  return data;
};
