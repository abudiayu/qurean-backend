/**
 * src/lib/supabase.js
 *
 * Server-side Supabase admin client.
 * Uses the SERVICE ROLE (secret) key — bypasses Row Level Security.
 * NEVER import this file into any frontend / browser code.
 */

import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error(
    '[Supabase] Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env'
  )
}

/**
 * Admin client — full database access, no RLS restrictions.
 * Use only for trusted server-side operations.
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    // Disable session persistence — server is stateless
    persistSession: false,
    autoRefreshToken: false,
  },
})

export default supabaseAdmin
