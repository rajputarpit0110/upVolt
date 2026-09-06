import { PRODUCTS } from '../data/mockProducts';

const API_BASE = '/api/products';

/**
 * Fetch all products from the backend database (with fallback to mock data)
 * @param {Object} [params] - Query parameters (category, search, sort, badge)
 */
export const fetchProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    if (params.badge) query.append('badge', params.badge);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}${queryString}`);

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data && data.products && data.products.length > 0) {
      return {
        products: data.products,
        count: data.count || data.products.length,
        source: data.source || 'database'
      };
    }
    return { products: PRODUCTS, count: PRODUCTS.length, source: 'fallback' };
  } catch (error) {
    console.warn('API fetch failed, using local mock data:', error.message);
    return { products: PRODUCTS, count: PRODUCTS.length, source: 'fallback' };
  }
};

/**
 * Fetch a single product by MongoDB ID or SKU
 * @param {string} id
 */
export const fetchProductById = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    if (data && data.product) {
      return data.product;
    }
    return PRODUCTS.find(p => p._id === id || p.id === id || p.sku === id) || null;
  } catch (error) {
    console.warn('API fetch single product failed, checking fallback:', error.message);
    return PRODUCTS.find(p => p._id === id || p.id === id || p.sku === id) || null;
  }
};

/**
 * Create a new product and save it into MongoDB (Protected: Admin only)
 * @param {Object} productData
 * @param {string} [token] - JWT token for Admin authorization
 */
export const createProduct = async (productData, token) => {
  const headers = { 'Content-Type': 'application/json' };
  const effectiveToken = token || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(productData)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to save product to database');
  }

  return data.product;
};

/**
 * Delete a product by ID or SKU (Protected: Admin only)
 * @param {string} id
 * @param {string} [token]
 */
export const deleteProduct = async (id, token) => {
  const headers = {};
  const effectiveToken = token || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete product');
  }

  return data;
};

/**
 * Trigger catalog synchronization / seed
 */
export const syncProductsCatalog = async (token) => {
  const headers = { 'Content-Type': 'application/json' };
  const effectiveToken = token || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(`${API_BASE}/seed`, {
    method: 'POST',
    headers
  });
  return res.json();
};
