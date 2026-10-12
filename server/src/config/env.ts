import 'dotenv/config'

const nodeEnv = process.env.NODE_ENV ?? 'development'
const isProduction = nodeEnv === 'production'

function required(name: string): string {
  const value = process.env[name]
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return value === 'true' || value === '1'
}

const sameSite = (process.env.COOKIE_SAME_SITE ??
  (isProduction ? 'none' : 'lax')) as 'lax' | 'strict' | 'none'

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT ?? 4000),
  // Local development falls back to a local MongoDB; production must be explicit.
  mongodbUri: isProduction
    ? required('MONGODB_URI')
    : process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/nsangiza_hub',
  jwtAccessSecret: isProduction
    ? required('JWT_ACCESS_SECRET')
    : process.env.JWT_ACCESS_SECRET ?? 'nsangiza-dev-access-secret-change-me',
  jwtRefreshSecret: isProduction
    ? required('JWT_REFRESH_SECRET')
    : process.env.JWT_REFRESH_SECRET ?? 'nsangiza-dev-refresh-secret-change-me',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  // Comma-separated allowlist of trusted frontend origins.
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  // Cross-site cookie settings. When the frontend (Vercel) and API (Render) are
  // on different sites, refresh cookies must be SameSite=None and Secure.
  cookieSameSite: sameSite,
  cookieSecure: bool(process.env.COOKIE_SECURE, isProduction),
  cookieDomain: process.env.COOKIE_DOMAIN,
} as const
