/**
 * src/middleware/errorHandler.js
 *
 * Global Express error handler — catches anything thrown inside
 * route handlers (works with express-async-errors).
 */

export function errorHandler(err, req, res, _next) {
  const status  = err.status  || 500
  const message = err.message || 'Internal server error'

  // Log full stack in development, just the message in production
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${status}] ${message}`, err.stack)
  } else {
    console.error(`[${status}] ${message}`)
  }

  res.status(status).json({ success: false, message })
}
