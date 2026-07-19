// In dev, go through Vite's own proxy (see vite.config.js) using a relative
// path — the browser only ever talks to whatever address already loaded the
// page (already working, or this wouldn't have rendered), and Vite's dev
// server process (on the same machine as the backend) forwards to
// localhost:8082 internally over loopback, which sidesteps two real
// problems with calling the backend directly by host:port from the browser:
// (1) CORS entirely, since it's then same-origin from the browser's view,
// and (2) Windows Firewall rules that often allow the dev server's own port
// through but block a separate Java process's port on the same network
// interface even though the loopback (localhost-to-localhost) hop never hits
// that restriction. For a production build (no dev server proxy available),
// set VITE_API_URL to the real backend URL at build time.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('token');

const buildHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// Safely parse a response body whether it's JSON or plain text,
// and whether the request succeeded or failed.
const parseBody = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Backend sent plain text (e.g. a raw String or an error page) — don't crash
    return { message: text };
  }
};

const request = async (method, path, body) => {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: buildHeaders(),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (err) {
    // Network error — server down, wrong port, CORS block, etc.
    throw new Error('Cannot reach the server. Please check your connection or try again later.');
  }

  const data = await parseBody(res);

  if (res.status === 401 || res.status === 403) {
    // Token missing/expired/invalid, or role not allowed for this endpoint
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
    }
    throw new Error(data?.message || (res.status === 401 ? 'Session expired. Please log in again.' : 'You do not have permission to do this.'));
  }

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
};

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

// File uploads go through Cloudinary via the backend's /api/upload endpoint.
// Kept separate from `request()` above because a multipart body must NOT
// have a JSON Content-Type header — the browser sets its own with the
// multipart boundary, so only the Authorization header is added here.
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  let res;
  try {
    res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      body: formData,
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Please check your connection or try again later.');
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Upload failed (HTTP ${res.status})`);
  }
  return text; // backend returns the Cloudinary URL as a plain string
};