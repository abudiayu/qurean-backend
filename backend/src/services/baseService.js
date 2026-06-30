
import supabase from '../lib/supabase.js'
import { assertSupabase } from '../utils/errors.js'

/**
 * @param {string} table  — Supabase table name
 * @returns service object with create / getAll / getById / update / remove
 */
export function makeService(table) {
  return {
    /**
     * Insert one row and return it.
     * @param {object} payload  — columns to insert
     */
    async create(payload) {
      const result = await supabase
        .from(table)
        .insert(payload)
        .select()
        .single()
      return assertSupabase(result, `${table}.create`)
    },

    /**
     * Fetch all rows, with optional filters, ordering, and pagination.
     * @param {{ filters?, orderBy?, ascending?, page?, pageSize? }} opts
     */
    async getAll({ filters = {}, orderBy = 'created_at', ascending = false, page = 1, pageSize = 50 } = {}) {
      let query = supabase.from(table).select('*', { count: 'exact' })

      for (const [col, val] of Object.entries(filters)) {
        if (val !== undefined && val !== null && val !== '') {
          query = query.eq(col, val)
        }
      }

      // Ordering
      query = query.order(orderBy, { ascending })

      // Pagination
      const from = (page - 1) * pageSize
      const to   = from + pageSize - 1
      query      = query.range(from, to)

      const { data, error, count } = await query
      if (error) assertSupabase({ data, error }, `${table}.getAll`)

      return { rows: data, total: count, page, pageSize }
    },

    /**
     * Fetch a single row by its primary key (id).
     * Throws a 404-style error if not found.
     * @param {string|number} id
     */
    async getById(id) {
      const result = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()
      return assertSupabase(result, `${table}.getById`)
    },

    /**
     * Update a row by id and return the updated row.
     * @param {string|number} id
     * @param {object} payload  — columns to update
     */
    async update(id, payload) {
      const result = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      return assertSupabase(result, `${table}.update`)
    },

    /**
     * Delete a row by id. Returns the deleted row.
     * @param {string|number} id
     */
    async remove(id) {
      const result = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select()
        .single()
      return assertSupabase(result, `${table}.remove`)
    },
  }
}
