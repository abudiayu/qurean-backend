/**
 * src/routes/auth.js
 *
 * POST   /api/auth/users           — admin: create user
 * GET    /api/auth/users           — admin: list users
 * GET    /api/auth/users/:id       — admin: get user
 * PATCH  /api/auth/users/:id       — admin: update user
 * DELETE /api/auth/users/:id       — admin: delete user
 *
 * Note: Sign-up / login / logout happen entirely on the frontend
 * using the Supabase JS client — no backend route needed for those.
 */

import { Router } from 'express'
import { authService } from '../services/authService.js'
import { requireAuth } from '../middleware/auth.js'
import { ok, created, noContent } from '../utils/response.js'

const router = Router()
router.use(requireAuth)   // all auth admin routes require a valid JWT

// List users
router.get('/users', async (req, res) => {
  const { page = 1, perPage = 50 } = req.query
  const data = await authService.listUsers({ page: Number(page), perPage: Number(perPage) })
  ok(res, data)
})

// Get one user
router.get('/users/:id', async (req, res) => {
  const data = await authService.getUser(req.params.id)
  ok(res, data)
})

// Create user (admin)
router.post('/users', async (req, res) => {
  const { email, password, metadata } = req.body
  const data = await authService.createUser({ email, password, metadata })
  created(res, data)
})

// Update user
router.patch('/users/:id', async (req, res) => {
  const data = await authService.updateUser(req.params.id, req.body)
  ok(res, data)
})

// Delete user
router.delete('/users/:id', async (req, res) => {
  await authService.deleteUser(req.params.id)
  noContent(res)
})

export default router
