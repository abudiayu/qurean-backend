/**
 * src/routes/students.js
 *
 * GET    /api/students              — list all (paginated, filterable)
 * GET    /api/students/:id          — get one
 * GET    /api/students/:id/payments — get one with payment history
 * GET    /api/students/search?q=    — search by name
 * POST   /api/students              — create
 * PATCH  /api/students/:id          — update
 * DELETE /api/students/:id          — delete
 */

import { Router } from 'express'
import { studentsService } from '../services/studentsService.js'
import { requireAuth }      from '../middleware/auth.js'
import { ok, created, noContent } from '../utils/response.js'

const router = Router()

// All student routes require a valid JWT
router.use(requireAuth)

// List / search
router.get('/', async (req, res) => {
  const { q, level, page = 1, pageSize = 50 } = req.query

  if (q) {
    const rows = await studentsService.search(q)
    return ok(res, rows)
  }
  if (level) {
    const rows = await studentsService.getByLevel(level)
    return ok(res, rows)
  }

  const result = await studentsService.getAll({
    page: Number(page),
    pageSize: Number(pageSize),
  })
  ok(res, result)
})

// Get one with payments
router.get('/:id/payments', async (req, res) => {
  const data = await studentsService.getWithPayments(req.params.id)
  ok(res, data)
})

// Get one
router.get('/:id', async (req, res) => {
  const data = await studentsService.getById(req.params.id)
  ok(res, data)
})

// Create
router.post('/', async (req, res) => {
  const data = await studentsService.create(req.body)
  created(res, data)
})

// Update
router.patch('/:id', async (req, res) => {
  const data = await studentsService.update(req.params.id, req.body)
  ok(res, data)
})

// Delete
router.delete('/:id', async (req, res) => {
  await studentsService.remove(req.params.id)
  noContent(res)
})

export default router
