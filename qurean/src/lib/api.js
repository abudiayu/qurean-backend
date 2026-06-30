/**
 * src/lib/api.js
 *
 * Thin fetch wrapper that:
 *  - Prefixes all requests with the backend base URL
 *  - Automatically attaches the Supabase JWT (Authorization header)
 *  - Throws consistent errors on non-2xx responses
 *  - Handles network failures with a clear message
 */

import { supabase } from './supabase.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

/**
 * Get the current user's JWT from the Supabase session.
 * Returns null if not logged in.
 */
async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token ?? null
}

/**
 * Core request helper.
 * @param {string} path     — e.g. '/api/students'
 * @param {RequestInit} opts — standard fetch options
 */
async function request(path, opts = {}) {
  const token = await getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...opts, headers })
  } catch {
    throw new Error('Network error — check your internet connection and try again.')
  }

  // Parse JSON body (even for error responses so we get the message)
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    const err = new Error(body.message || `Request failed with status ${response.status}`)
    err.status = response.status
    throw err
  }

  return body.data ?? body
}

// ── Convenience methods ────────────────────────────────────────────────────
export const api = {
  get:    (path)         => request(path, { method: 'GET' }),
  post:   (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (path, body)   => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: 'DELETE' }),
}

export default api
