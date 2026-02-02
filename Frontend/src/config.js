// API Configuration
// Detect if running in Electron
const isElectron = () => {
  if (typeof window === 'undefined') return false;
  return window.electron !== undefined || window.navigator.userAgent.includes('Electron');
};

const isDev = import.meta.env.DEV;
const inElectron = isElectron();

console.log('[Config] Environment:', { isDev, inElectron });

// Always use direct localhost connection in Electron or production
export const API_BASE_URL = (isDev && !inElectron) ? '/api' : 'http://localhost:5000/api';

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (isDev && !inElectron) {
    // Dev mode with Vite proxy
    return `/api/${cleanEndpoint}`;
  } else {
    // Production or Electron - direct connection
    const url = `http://localhost:5000/api/${cleanEndpoint}`;
    console.log('[API] →', url);
    return url;
  }
};

