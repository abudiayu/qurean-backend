/**
 * src/lib/supabase.js
 *
 * Single Supabase client instance for the entire app.
 * All credentials come from environment variables — never hardcoded.
 *
 * SECURITY:
 *   - VITE_SUPABASE_URL          → safe in browser
 *   - VITE_SUPABASE_PUBLISHABLE_KEY → safe in browser (Row Level Security enforced)
 *   - Secret key NEVER goes here — backend/edge functions only
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Fail fast at startup if env vars are missing
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY.\n' +
    'Create a .env file in the project root and add both variables.'
  )
}

/**
 * The Supabase client — import this everywhere you need DB / auth / storage.
 *
 * Options used:
 *  - auth.persistSession       : keeps the user logged in across page refreshes
 *  - auth.autoRefreshToken     : silently refreshes the JWT before it expires
 *  - auth.detectSessionInUrl   : handles OAuth / magic-link callbacks automatically
 *  - realtime.params.eventsPerSecond: throttle realtime events to avoid overload
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export default supabase
