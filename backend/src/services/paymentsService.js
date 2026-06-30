

import supabase from '../lib/supabase.js'
import { makeService } from './baseService.js'
import { assertSupabase } from '../utils/errors.js'

const base = makeService('payments')

export const paymentsService = {
  ...base,

  /**
   * Get all payments for a specific student.
   * @param {string|number} studentId
   */
  async getByStudent(studentId) {
    const result = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('paid_at', { ascending: false })
    return assertSupabase(result, 'payments.getByStudent')
  },

  /**
   * Get payments for a specific month/year across all students.
   * @param {string} month  e.g. 'January'
   * @param {string} year   e.g. '2025'
   */
  async getByPeriod(month, year) {
    const result = await supabase
      .from('payments')
      .select('*, students(full_name, hiz_level)')
      .eq('month', month)
      .eq('year', year)
      .order('paid_at', { ascending: false })
    return assertSupabase(result, 'payments.getByPeriod')
  },

  /**
   * Get the total amount collected, optionally filtered by period.
   * @param {{ month?, year? }} opts
   */
  async getTotal({ month, year } = {}) {
    let query = supabase
      .from('payments')
      .select('amount')

    if (month) query = query.eq('month', month)
    if (year)  query = query.eq('year', year)

    const { data, error } = await query
    if (error) assertSupabase({ data, error }, 'payments.getTotal')

    const total = (data || []).reduce((sum, p) => sum + (p.amount || 0), 0)
    return { total }
  },

  /**
   * Get IDs of students who have NOT paid for a given month/year.
   * @param {string} month
   * @param {string} year
   */
  async getUnpaidStudents(month, year) {
    // Students who paid this period
    const { data: paid, error: e1 } = await supabase
      .from('payments')
      .select('student_id')
      .eq('month', month)
      .eq('year', year)

    if (e1) assertSupabase({ data: paid, error: e1 }, 'payments.getUnpaid.paid')

    const paidIds = (paid || []).map(p => p.student_id)

    // All students not in that list
    let q = supabase.from('students').select('id, full_name, hiz_level, parent1_phone')
    if (paidIds.length > 0) q = q.not('id', 'in', `(${paidIds.join(',')})`)

    const result = await q.order('full_name')
    return assertSupabase(result, 'payments.getUnpaid.students')
  },
}
