import { env } from '../config/env'
import type { ApiEnvelope } from '../types'

export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const TOKEN_KEY = 'nsangiza_access_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

type RefreshResult = { accessToken: string } | null

async function refreshAccessToken(): Promise<RefreshResult> {
  try {
    const res = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) return null
    const body = (await res.json()) as ApiEnvelope<{ accessToken: string; user?: unknown }>
    if (!body.success || !body.data?.accessToken) return null
    return { accessToken: body.data.accessToken }
  } catch {
    return null
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  retry?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { method = 'GET', body, query, retry = true } = options

  const url = new URL(env.apiBaseUrl + path, window.location.origin)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
    }
  }

  const headers: Record<string, string> = {}
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('There was a problem reaching the network. Check your connection and try again.', 0, 'NETWORK')
  }

  let payload: ApiEnvelope<T> | null = null
  try {
    payload = (await res.json()) as ApiEnvelope<T>
  } catch {
    payload = null
  }

  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      setAccessToken(refreshed.accessToken)
      return apiRequest<T>(path, { ...options, retry: false })
    }
    setAccessToken(null)
  }

  if (!res.ok || !payload?.success) {
    throw new ApiError(payload?.message ?? 'Something went wrong. Please try again.', res.status, payload?.code)
  }

  return payload
}

export const get = <T>(path: string, query?: RequestOptions['query']) => apiRequest<T>(path, { method: 'GET', query })
export const post = <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'POST', body })
export const patch = <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PATCH', body })
export const del = <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' })