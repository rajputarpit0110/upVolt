import { API_BASE_URL, safeJson } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/reviews`;

export const getEligibleProducts = async (token) => {
  const res = await fetch(`${API_BASE}/user/eligible`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return safeJson(res);
};

export const createReview = async (token, reviewData) => {
  const res = await fetch(`${API_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
  return safeJson(res);
};

export const getProductReviews = async (productId, page = 1, limit = 10) => {
  const res = await fetch(`${API_BASE}/${productId}?page=${page}&limit=${limit}`);
  return safeJson(res);
};
