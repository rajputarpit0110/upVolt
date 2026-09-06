import { API_BASE_URL, safeJson } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/settings`;

/**
 * Fetch delivery configuration and pricing
 */
export const fetchDeliverySettings = async () => {
  try {
    const res = await fetch(`${API_BASE}/delivery`);
    const data = await safeJson(res);
    if (res.ok && data.success) {
      return data.deliverySettings;
    }
  } catch (err) {
    console.warn('Could not load delivery settings, using default configuration:', err);
  }

  // Fallback defaults
  return {
    normalDeliveryFee: 40,
    fastDeliveryFee: 99,
    freeDeliveryThreshold: 499,
    normalDeliveryNote: 'Standard Delivery (2-3 Days across Delhi)',
    fastDeliveryNote: 'Express Superfast Delivery (Within 24 Hours)'
  };
};

/**
 * Update delivery settings (Admin only)
 * @param {Object} settingsData
 */
export const updateDeliverySettings = async (settingsData) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/delivery`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(settingsData)
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update delivery settings');
  }

  return data.deliverySettings;
};

// Fallback default stats matching user's exact specification
export const DEFAULT_STATS = [
  { id: 'stat-1', icon: 'users', number: '5000+', label: 'Students Trust Us' },
  { id: 'stat-2', icon: 'graduation', number: '100+', label: 'Colleges Reached' },
  { id: 'stat-3', icon: 'package', number: '1000+', label: 'Products Delivered' },
  { id: 'stat-4', icon: 'heart', number: '4.8/5', label: 'Student Satisfaction' }
];

/**
 * Fetch homepage trust metrics & stats
 */
export const fetchStatsSettings = async () => {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await safeJson(res);
    if (res.ok && data.success && Array.isArray(data.stats) && data.stats.length > 0) {
      return data.stats;
    }
  } catch (err) {
    console.warn('Could not load stats settings, using default configuration:', err);
  }

  return DEFAULT_STATS;
};

/**
 * Update homepage stats (Admin only)
 * @param {Array} stats
 */
export const updateStatsSettings = async (stats) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('campuscircuit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/stats`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ stats })
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update homepage stats');
  }

  return data.stats;
};
