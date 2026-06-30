/**
 * src/services/studentsService.js  (frontend)
 *
 * All student-related API calls.
 * Components import these functions — never call fetch() directly.
 */

import api from '../lib/api.js'

export const studentsService = {
  /** Get all students (paginated) */
  getAll: (page = 1, pageSize = 50) =>
    api.get(`/api/students?page=${page}&pageSize=${pageSize}`),

  /** Search by name */
  search: (q) => api.get(`/api/students?q=${encodeURIComponent(q)}`),

  /** Filter by Hifz level */
  getByLevel: (level) => api.get(`/api/students?level=${encodeURIComponent(level)}`),

  /** Get one student */
  getById: (id) => api.get(`/api/students/${id}`),

  /** Get one student with full payment history */
  getWithPayments: (id) => api.get(`/api/students/${id}/payments`),

  /** Register a new student */
  create: (data) => api.post('/api/students', data),

  /** Update a student */
  update: (id, data) => api.patch(`/api/students/${id}`, data),

  /** Delete a student */
  delete: (id) => api.delete(`/api/students/${id}`),
}
