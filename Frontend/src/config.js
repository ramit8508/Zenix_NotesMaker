// API Configuration
// In development: Vite proxy handles /api -> http://localhost:5000/api
// In production (Electron): Direct connection to backend on localhost:5000
const isElectron = typeof window !== 'undefined' && window.electron;
const isDev = import.meta.env.DEV;

// In packaged Electron app, always use localhost:5000
export const API_BASE_URL = (isDev && !isElectron) ? '/api' : 'http://localhost:5000/api';

export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (isDev && !isElectron) {
    // In dev mode (not electron), use /api prefix (Vite proxy will handle it)
    return `/api/${cleanEndpoint}`;
  } else {
    // In production or Electron, use full URL
    const url = `http://localhost:5000/api/${cleanEndpoint}`;
    console.log('[API] Calling:', url);
    return url;
  }
};

