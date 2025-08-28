// Environment configuration
export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3005/api/v1',
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,
} as const

export default env