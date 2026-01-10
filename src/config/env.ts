export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
