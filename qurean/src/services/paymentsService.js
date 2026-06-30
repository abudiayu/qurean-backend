/**
 * src/services/paymentsService.js  (frontend)
 */

import api from '../lib/api.js'

export const paymentsService = {
  /** All payments (paginated) */
  getAll: (page = 1, pageSize = 50) =>
    api.get(`/api/payments?page=${page}&pageSize=${pageSize}`),

  /** Payments for one student */
  getByStudent: (studentId) =>
    api.get(`/api/payments?student_id=${studentId}`),

  /** Payments for a month/year */
  getByPeriod: (month, year) =>
    api.get(`/api/payments/period?month=${month}&year=${year}`),

  /** Total collected, optionally filtered */
  getTotal: (month, year) => {
    const q = new URLSearchParams()
    if (month) q.set('month', month)
    if (year)  q.set('year',  year)
    return api.get(`/api/payments/total?${q}`)
  },

  /** Students who haven't paid for a period */
  getUnpaid: (month, year) =>
    api.get(`/api/payments/unpaid?month=${month}&year=${year}`),

  /** Get one payment */
  getById: (id) => api.get(`/api/payments/${id}`),

  /** Record a new payment */
  create: (data) => api.post('/api/payments', data),

  /** Update a payment */
  update: (id, data) => api.patch(`/api/payments/${id}`, data),

  /** Delete a payment */
  delete: (id) => api.delete(`/api/payments/${id}`),
}
