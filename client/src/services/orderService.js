import { API_BASE_URL, safeJson } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/orders`;

/**
 * Place a new order
 * @param {Object} orderData
 */
export const createOrder = async (orderData) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData)
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to place order.');
  }

  return data.order;
};

/**
 * Fetch customer orders
 * @param {Object} [params] - phone or email
 */
export const fetchMyOrders = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.phone) query.append('phone', params.phone);
  if (params.email) query.append('email', params.email);

  const headers = {};
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/my-orders?${query.toString()}`, { headers });
  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch orders.');
  }

  return data.orders || [];
};

/**
 * Cancel a pending order
 * @param {string} orderId - e.g. 'CC-363654' or _id
 */
export const cancelMyOrder = async (orderId) => {
  const headers = {};
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/${orderId}/cancel`, {
    method: 'PUT',
    headers
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to cancel order.');
  }

  return data.order;
};

/**
 * Fetch all orders for Admin / Master Admin
 * @param {string} [status] - pending, processing, shipped, completed, cancelled, all
 * @param {string} [search]
 */
export const fetchAllOrders = async (status = 'all', search = '') => {
  const query = new URLSearchParams();
  if (status && status !== 'all') query.append('status', status);
  if (search) query.append('search', search);

  const headers = {};
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}?${query.toString()}`, { headers });
  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch all orders.');
  }

  return data.orders || [];
};

/**
 * Update order status (Admin / Master Admin)
 * @param {string} orderId - e.g. 'CC-363654' or _id
 * @param {string} status - pending, processing, shipped, completed, cancelled
 * @param {string} [note]
 */
export const updateOrderStatus = async (orderId, status, note = '') => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/${orderId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status, note })
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update order status.');
  }

  return data.order;
};

/**
 * Delete an order (Admin / Master Admin)
 * @param {string} orderId - e.g. 'CC-363654' or _id
 */
export const deleteOrder = async (orderId) => {
  const headers = {};
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE}/${orderId}`, {
    method: 'DELETE',
    headers
  });
  
  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete order.');
  }
  
  return data;
};
