/**
 * src/index.js
 *
 * Express application entry point.
 * - Loads environment variables
 * - Configures middleware (CORS, JSON, error handling)
 * - Mounts all route modules
 * - Starts the HTTP server
 */

import 'dotenv/config'                   // load .env before anything else
import 'express-async-errors'            // patches Express so async errors propagate

import express  from 'express'
import cors     from 'cors'

import studentsRouter from './routes/students.js'
import paymentsRouter from './routes/payments.js'
import authRouter     from './routes/auth.js'
import storageRouter  from './routes/storage.js'
import { errorHandler } from './middleware/errorHandler.js'

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware ─────────────────────────────────────────────────────────────

// CORS: allow only the configured frontend origin
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-File-Path'],
  credentials: true,
}))

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }))

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/students', studentsRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/auth',     authRouter)
app.use('/api/storage',  storageRouter)

// 404 for unknown routes
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ── Global error handler (must be last) ───────────────────────────────────
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Hidaya Academy API running on http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log(`   Students: http://localhost:${PORT}/api/students`)
  console.log(`   Payments: http://localhost:${PORT}/api/payments`)
})
