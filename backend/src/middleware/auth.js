/**
 * src/middleware/auth.js
 *
 * Express middleware that verifies the Supabase JWT from the
 * Authorization header and attaches the user to req.user.
 *
 * Usage:
 *   import { requireAuth } from '../middleware/auth.js'
 *   router.get('/protected', requireAuth, handler)
 */

import { authService } from '../services/authService.js'

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  try {
    req.user = await authService.verifyToken(token)
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}
