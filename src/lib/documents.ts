import { env } from '../config/env'
import { ApiError, getAccessToken } from './api'

function nameFromPath(filePath: string): string {
  const clean = filePath.split('/').filter(Boolean).pop() ?? filePath
  return clean
}

/**
 * Opens a verification document through the authenticated API. Uploaded
 * documents are never publicly addressable, so the bearer token must be sent
 * and the response turned into a short-lived blob URL.
 */
export async function openSecureDocument(filePath: string): Promise<void> {
  const name = nameFromPath(filePath)
  const token = getAccessToken()
  const res = await fetch(`${env.apiBaseUrl}/documents/${encodeURIComponent(name)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  })
  if (!res.ok) {
    throw new ApiError('This document could not be opened.', res.status)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  // Revoke after the new tab has had a chance to load it.
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
