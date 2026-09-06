import { API_BASE_URL, safeJson } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/coupons`;

/**
 * Fetch all coupons (Admin protected)
 * @param {string} [token]
 */
export const fetchCoupons = async (token) => {
  const headers = {};
  const effectiveToken = token || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(API_BASE, { headers });
  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch coupons');
  }
  return data;
};

/**
 * Create a new coupon (Admin protected)
 * @param {Object} couponData
 * @param {string} [token]
 */
export const createCoupon = async (couponData, token) => {
  const headers = { 'Content-Type': 'application/json' };
  const effectiveToken = token || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(couponData)
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to create coupon');
  }
  return data;
};

/**
 * Delete a coupon by ID or code (Admin protected)
 * @param {string} id
 * @param {string} [token]
 */
export const deleteCoupon = async (id, token) => {
  const headers = {};
  const effectiveToken = token || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete coupon');
  }
  return data;
};

/**
 * Validate a coupon code for Cart or Checkout (Public)
 * @param {string} code
 * @param {number} cartSubtotal
 */
export const validateCouponCode = async (code, cartSubtotal) => {
  const res = await fetch(`${API_BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, cartSubtotal })
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Invalid coupon');
  }
  return data;
};
