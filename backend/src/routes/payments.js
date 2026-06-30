/**
 * src/routes/payments.js
 *
 * GET    /api/payments                   — list all (paginated)
 * GET    /api/payments/total             — total collected (optional ?month=&year=)
 * GET    /api/payments/unpaid            — students without payment ?month=&year=
 * GET    /api/payments/period            — by period ?month=&year=
 * GET    /api/payments/:id              — get one
 * POST   /api/payments                  — create
 * PATCH  /api/payments/:id              — update
 * DELETE /api/payments/:id              — delete
 */

import { Router } from 'express'
import { paymentsService } from '../services/paymentsService.js'
import { requireAuth }      from '../middleware/auth.js'
import { ok, created, noContent } from '../utils/response.js'
import { ApiError } from '../utils/errors.js'

const router = Router()
router.use(requireAuth)

// Total collected
router.get('/total', async (req, res) => {
  const { month, year } = req.query
  const data = await paymentsService.getTotal({ month, year })
  ok(res, data)
})

// Unpaid students for a period
router.get('/unpaid', async (req, res) => {
  const { month, year } = req.query
  if (!month || !year) throw new ApiError('month and year are required', 400)
  const data = await paymentsService.getUnpaidStudents(month, year)
  ok(res, data)
})

// By period
router.get('/period', async (req, res) => {
  const { month, year } = req.query
  if (!month || !year) throw new ApiError('month and year are required', 400)
  const data = await paymentsService.getByPeriod(month, year)
  ok(res, data)
})

// List all
router.get('/', async (req, res) => {
  const { page = 1, pageSize = 50, student_id } = req.query

  if (student_id) {
    const data = await paymentsService.getByStudent(student_id)
    return ok(res, data)
  }

  const result = await paymentsService.getAll({ page: Number(page), pageSize: Number(pageSize) })
  ok(res, result)
})

// Get one
router.get('/:id', async (req, res) => {
  const data = await paymentsService.getById(req.params.id)
  ok(res, data)
})

// Create
router.post('/', async (req, res) => {
  const data = await paymentsService.create(req.body)
  created(res, data)
})

// Update
router.patch('/:id', async (req, res) => {
  const data = await paymentsService.update(req.params.id, req.body)
  ok(res, data)
})

// Delete
router.delete('/:id', async (req, res) => {
  await paymentsService.remove(req.params.id)
  noContent(res)
})

export default router
