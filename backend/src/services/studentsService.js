
import supabase from '../lib/supabase.js'
import { makeService } from './baseService.js'
import { assertSupabase } from '../utils/errors.js'

// Inherit create / getAll / getById / update / remove
const base = makeService('students')

export const studentsService = {
  ...base,

  /**
   * Search students by full name (case-insensitive partial match).
   * @param {string} query
   */
  async search(query) {
    const result = await supabase
      .from('students')
      .select('*')
      .ilike('full_name', `%${query}%`)
      .order('full_name')
    return assertSupabase(result, 'students.search')
  },

  /**
   * Get all students for a given Hifz level.
   * @param {string} hizLevel  e.g. 'Beginner'
   */
  async getByLevel(hizLevel) {
    const result = await supabase
      .from('students')
      .select('*')
      .eq('hiz_level', hizLevel)
      .order('full_name')
    return assertSupabase(result, 'students.getByLevel')
  },

  /**
   * Get a student together with their full payment history.
   * @param {string|number} id
   */
  async getWithPayments(id) {
    const result = await supabase
      .from('students')
      .select(`
        *,
        payments (
          id, amount, method, month, year, note, paid_at
        )
      `)
      .eq('id', id)
      .single()
    return assertSupabase(result, 'students.getWithPayments')
  },
}
