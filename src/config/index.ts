const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const config = {
    apiUrl: API_BASE_URL,
} as const;
