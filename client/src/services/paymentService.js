import { API_BASE_URL, safeJson } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/payments`;

// Helper to load Razorpay Checkout SDK script dynamically if needed
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Fetch public key ID
export const fetchRazorpayKey = async () => {
  try {
    const res = await fetch(`${API_BASE}/razorpay/key`);
    const data = await safeJson(res);
    return data.keyId || 'rzp_test_CampusCircuitDev';
  } catch (err) {
    console.warn('Failed to fetch Razorpay key from API, using default:', err);
    return 'rzp_test_CampusCircuitDev';
  }
};

// Create a Razorpay order on backend
export const createRazorpayOrder = async (amount, currency = 'INR', receipt = null) => {
  const res = await fetch(`${API_BASE}/razorpay/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, receipt })
  });
  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to initialize payment gateway.');
  }
  return data;
};

// Verify payment signature and place confirmed order
export const verifyRazorpayPayment = async (verificationPayload) => {
  const token = localStorage.getItem('campuscircuit_token') || localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/razorpay/verify`, {
    method: 'POST',
    headers,
    body: JSON.stringify(verificationPayload)
  });
  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Payment signature verification failed.');
  }
  return data;
};
