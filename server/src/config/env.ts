import 'dotenv/config'

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  // Key components of a Mongo URI may come from individual variables.
  mongodbUri:
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/nsangiza_hub',
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ?? 'nsangiza-dev-access-secret-change-me',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? 'nsangiza-dev-refresh-secret-change-me',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
} as const

export const isProduction = env.nodeEnv === 'production'