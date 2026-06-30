/**
 * src/hooks/usePayments.js
 *
 * Fetches payment data from the backend API.
 *
 * Usage:
 *   const { payments, loading, error, refetch } = usePayments({ studentId })
 *   const { payments, loading, error, refetch } = usePayments({ month, year })
 */

import { useState, useEffect, useCallback } from 'react'
import { paymentsService } from '../services/paymentsService.js'

export function usePayments({ studentId, month, year, page = 1, pageSize = 50 } = {}) {
  const [payments, setPayments] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let result
      if (studentId) {
        result = await paymentsService.getByStudent(studentId)
        setPayments(result)
        setTotal(result.length)
      } else if (month && year) {
        result = await paymentsService.getByPeriod(month, year)
        setPayments(result)
        setTotal(result.length)
      } else {
        result = await paymentsService.getAll(page, pageSize)
        setPayments(result.rows || result)
        setTotal(result.total ?? 0)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [studentId, month, year, page, pageSize])

  useEffect(() => { fetch() }, [fetch])

  return { payments, total, loading, error, refetch: fetch }
}
