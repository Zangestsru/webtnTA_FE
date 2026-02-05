// API Base URL configuration
// In development: uses proxy defined in vite.config.ts (/api -> localhost:5073)
// In production: uses VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const config = {
    apiUrl: API_BASE_URL,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
} as const;
