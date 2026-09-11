import { PRODUCTS } from '../data/mockProducts';
import { API_BASE_URL, safeJson } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/products`;

// In-flight request deduplication & memory cache
let inFlightProductsPromise = null;
let cachedProductsData = null;
let lastFetchTime = 0;
const CLIENT_CACHE_TTL_MS = 30000; // 30s cache for catalog listing

export const clearProductCache = () => {
  cachedProductsData = null;
  lastFetchTime = 0;
  inFlightProductsPromise = null;
};

/**
 * Fetch all products from the backend database (with fallback to mock data)
 * @param {Object} [params] - Query parameters (category, search, sort, badge, page, limit)
 */
export const fetchProducts = async (params = {}) => {
  const hasFilterParams = params && Object.keys(params).some(
    k => params[k] !== undefined && params[k] !== '' && params[k] !== 'All'
  );

  // If fetching default list with no filters, serve from short memory cache
  if (!hasFilterParams) {
    const now = Date.now();
    if (cachedProductsData && (now - lastFetchTime < CLIENT_CACHE_TTL_MS)) {
      return cachedProductsData;
    }
    // Re-use currently pending in-flight promise to eliminate duplicate simultaneous calls
    if (inFlightProductsPromise) {
      return inFlightProductsPromise;
    }
  }

  const executeFetch = async () => {
    try {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'All') query.append('category', params.category);
      if (params.search) query.append('search', params.search);
      if (params.sort) query.append('sort', params.sort);
      if (params.badge) query.append('badge', params.badge);
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      if (params.full) query.append('full', params.full);

      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_BASE}${queryString}`);

      const data = await safeJson(res);
      if (res.ok && data && data.products && data.products.length > 0) {
        const payload = {
          products: data.products,
          count: data.count || data.products.length,
          total: data.total || data.count || data.products.length,
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          source: data.source || 'database'
        };

        if (!hasFilterParams) {
          cachedProductsData = payload;
          lastFetchTime = Date.now();
        }

        return payload;
      }
      return { products: PRODUCTS, count: PRODUCTS.length, source: 'fallback' };
    } catch (error) {
      console.warn('API fetch failed, using local mock data:', error.message);
      return { products: PRODUCTS, count: PRODUCTS.length, source: 'fallback' };
    } finally {
      if (!hasFilterParams) {
        inFlightProductsPromise = null;
      }
    }
  };

  if (!hasFilterParams) {
    inFlightProductsPromise = executeFetch();
    return inFlightProductsPromise;
  }

  return executeFetch();
};

/**
 * Fetch a single product by MongoDB ID or SKU
 * @param {string} id
 */
export const fetchProductById = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await safeJson(res);
    if (res.ok && data && data.product) {
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
  const effectiveToken = token || localStorage.getItem('upvolt_token') || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(productData)
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to save product to database');
  }

  clearProductCache();
  return data.product;
};

/**
 * Update an existing product in MongoDB (Protected: Admin only)
 * @param {string} id
 * @param {Object} productData
 * @param {string} [token]
 */
export const updateProduct = async (id, productData, token) => {
  const headers = { 'Content-Type': 'application/json' };
  const effectiveToken = token || localStorage.getItem('upvolt_token') || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }
  
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(productData)
  });
  
  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update product in database');
  }
  
  clearProductCache();
  return data.product;
};

/**
 * Delete a product by ID or SKU (Protected: Admin only)
 * @param {string} id
 * @param {string} [token]
 */
export const deleteProduct = async (id, token) => {
  const headers = {};
  const effectiveToken = token || localStorage.getItem('upvolt_token') || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete product');
  }

  clearProductCache();
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
  clearProductCache();
  return safeJson(res);
};
