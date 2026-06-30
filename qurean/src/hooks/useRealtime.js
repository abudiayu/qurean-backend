/**
 * src/hooks/useRealtime.js
 *
 * Subscribe to Supabase Realtime for a given table.
 * The callback fires whenever a row is inserted, updated, or deleted.
 * The UI can call `refetch()` from useStudents / usePayments in response.
 *
 * Usage:
 *   useRealtime('students', () => refetch())
 *   useRealtime('payments', () => refetch(), { event: 'INSERT' })
 */

import { useEffect } from 'react'
import { supabase }  from '../lib/supabase.js'

/**
 * @param {string}   table    — Supabase table name to listen to
 * @param {Function} callback — called when a realtime event fires
 * @param {{ event?, schema? }} opts
 */
export function useRealtime(table, callback, { event = '*', schema = 'public' } = {}) {
  useEffect(() => {
    if (!table || !callback) return

    // Create a unique channel name per table+event
    const channel = supabase
      .channel(`realtime:${table}:${event}`)
      .on(
        'postgres_changes',
        { event, schema, table },
        (payload) => callback(payload)
      )
      .subscribe()

    // Unsubscribe when the component unmounts
    return () => { supabase.removeChannel(channel) }
  }, [table, event, schema, callback])
}
