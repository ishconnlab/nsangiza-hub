const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? '') as string

export const env = {
  apiBaseUrl: API_BASE_URL || '/api/v1',
  appName: 'Nsangiza Hub',
  appShortName: 'Nsangiza',
  isProduction: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
} as const