// API Configuration
// In development: Vite proxy handles /api -> http://localhost:5000/api
// In production: Direct connection to backend
const isElectron = typeof window !== 'undefined' && window.electron;
const isDev = import.meta.env.DEV;

export const API_BASE_URL = isDev ? '/api' : 'http://localhost:5000/api';

export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (isDev) {
    // In dev mode, use /api prefix (Vite proxy will handle it)
    return `/api/${cleanEndpoint}`;
  } else {
    // In production, use full URL
    const url = `http://localhost:5000/api/${cleanEndpoint}`;
    console.log('[API] Calling:', url);
    return url;
  }
};

