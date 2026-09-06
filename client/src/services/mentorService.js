import { MENTORS } from '../data/mentorsData';

const API_BASE = '/api/mentors';

/**
 * Fetch all mentors from the backend database (with fallback to local mentor data)
 */
export const fetchMentors = async () => {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data && data.mentors && data.mentors.length > 0) {
      return {
        mentors: data.mentors,
        count: data.count || data.mentors.length,
        source: 'database'
      };
    }
    return { mentors: MENTORS, count: MENTORS.length, source: 'fallback' };
  } catch (error) {
    console.warn('API fetch mentors failed, using local fallback:', error.message);
    return { mentors: MENTORS, count: MENTORS.length, source: 'fallback' };
  }
};

/**
 * Create a new mentor (Protected: Admin only)
 * @param {Object} mentorData
 * @param {string} [token]
 */
export const createMentor = async (mentorData, token) => {
  const headers = { 'Content-Type': 'application/json' };
  const effectiveToken = token || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(mentorData)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to save mentor to database');
  }

  return data.mentor;
};

/**
 * Delete a mentor by ID (Protected: Admin only)
 * @param {string} id
 * @param {string} [token]
 */
export const deleteMentor = async (id, token) => {
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
    throw new Error(data.message || 'Failed to delete mentor');
  }

  return data;
};
