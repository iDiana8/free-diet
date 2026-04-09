const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(url, options = {}) {
  const response = await fetch(`${API_URL}${url}`, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `HTTP ${response.status}`);
  }

  return data;
}

function createAuthHeaders(token, extraHeaders = {}) {
  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}

export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(token) {
  return request('/auth/me', {
    headers: createAuthHeaders(token),
  });
}

export function updateCurrentUser(payload, token) {
  return request('/auth/me', {
    method: 'PUT',
    headers: createAuthHeaders(token, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });
}

export function getDailyJournal(date, token) {
  return request(`/daily/${date}`, {
    headers: createAuthHeaders(token),
  });
}

export function saveDailyJournal(date, payload, token) {
  return request(`/daily/${date}`, {
    method: 'PUT',
    headers: createAuthHeaders(token, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });
}
