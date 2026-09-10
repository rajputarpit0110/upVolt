import { CATEGORIES } from '../data/mockProducts';
import { API_BASE_URL, safeJson } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/categories`;

/**
 * Fetch all categories from backend (with live productCount)
 * @param {Object} [params] - optional query params { all: 'true' } for admin to see inactive ones
 */
export const fetchCategories = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.all) query.append('all', 'true');
    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`${API_BASE}${queryString}`);
    const data = await safeJson(res);

    if (res.ok && data && data.categories && data.categories.length > 0) {
      return {
        categories: data.categories,
        count: data.categories.length,
        source: 'database'
      };
    }
    return { categories: CATEGORIES, count: CATEGORIES.length, source: 'fallback' };
  } catch (error) {
    console.warn('Category fetch failed, using fallback:', error.message);
    return { categories: CATEGORIES, count: CATEGORIES.length, source: 'fallback' };
  }
};

/**
 * Create a new category (Protected: Admin only)
 * @param {Object} categoryData - { name, description, image, order, isActive }
 * @param {string} [token]
 */
export const createCategory = async (categoryData, token) => {
  const headers = { 'Content-Type': 'application/json' };
  const effectiveToken = token || localStorage.getItem('upvolt_token') || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(categoryData)
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to create category');
  }

  return data.category;
};

/**
 * Update a category (Protected: Admin only)
 * @param {string} id
 * @param {Object} categoryData
 * @param {string} [token]
 */
export const updateCategory = async (id, categoryData, token) => {
  const headers = { 'Content-Type': 'application/json' };
  const effectiveToken = token || localStorage.getItem('upvolt_token') || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(categoryData)
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update category');
  }

  return data.category;
};

/**
 * Delete a category (Protected: Admin only)
 * @param {string} id
 * @param {string} [reassignTo] - optional category name to reassign existing products to
 * @param {string} [token]
 */
export const deleteCategory = async (id, reassignTo = '', token) => {
  const headers = { 'Content-Type': 'application/json' };
  const effectiveToken = token || localStorage.getItem('upvolt_token') || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const query = reassignTo ? `?reassignTo=${encodeURIComponent(reassignTo)}` : '';
  const res = await fetch(`${API_BASE}/${id}${query}`, {
    method: 'DELETE',
    headers
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete category');
  }

  return data;
};
