const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? '') as string

// Fallback used for production builds if VITE_API_BASE_URL is not provided at
// build time. Local development still uses the Vite proxy (/api/v1).
const PRODUCTION_API_BASE_URL = 'https://nsangiza-hub.onrender.com/api/v1'

export const env = {
  apiBaseUrl: API_BASE_URL || (import.meta.env.PROD ? PRODUCTION_API_BASE_URL : '/api/v1'),
  appName: 'Nsangiza Hub',
  appShortName: 'Nsangiza',
  isProduction: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
} as const
