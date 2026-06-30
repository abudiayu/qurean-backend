/**
 * src/hooks/useStudents.js
 *
 * Fetches students from the backend API with loading + error state.
 * Automatically re-fetches when `deps` change.
 *
 * Usage:
 *   const { students, loading, error, refetch } = useStudents()
 */

import { useState, useEffect, useCallback } from 'react'
import { studentsService } from '../services/studentsService.js'

export function useStudents({ page = 1, pageSize = 50, search, level } = {}) {
  const [students, setStudents] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let result
      if (search) {
        result = await studentsService.search(search)
        setStudents(result)
        setTotal(result.length)
      } else if (level) {
        result = await studentsService.getByLevel(level)
        setStudents(result)
        setTotal(result.length)
      } else {
        result = await studentsService.getAll(page, pageSize)
        setStudents(result.rows || result)
        setTotal(result.total ?? (result.rows?.length ?? 0))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, level])

  useEffect(() => { fetch() }, [fetch])

  return { students, total, loading, error, refetch: fetch }
}
