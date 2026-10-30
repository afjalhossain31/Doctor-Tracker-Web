import axios from 'axios';

export const TOKEN_KEY = 'dt_token';
export const USER_KEY = 'dt_user';

export const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Cookie line-ti fix ba remove kore dewa holo jate syntax error na hoy
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 3600}; samesite=lax`;
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((cfg) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined' && !location.pathname.startsWith('/login')) {
      clearSession();
      location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e.response?.data?.message || (e.request ? 'Cannot reach the server. Check your connection.' : e.message) || 'Something went wrong';

/** Turns the API's validation errors into { field: message } for inline display. */
export const fieldErrors = (e) =>
  Object.fromEntries((e.response?.data?.errors || []).map((x) => [x.field, x.message]));

export default api;