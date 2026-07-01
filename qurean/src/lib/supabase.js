/**
 * src/lib/supabase.js
 * Supabase client — reads credentials from .env variables.
 * Only the publishable/anon key belongs here. Secret key = backend only.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Support both key names (new format and classic anon key)
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('[Supabase] VITE_SUPABASE_URL is missing from .env')
}

if (!supabaseKey) {
  throw new Error(
    '[Supabase] VITE_SUPABASE_PUBLISHABLE_KEY is missing from .env\n' +
    'Go to: Supabase Dashboard → Project Settings → API → anon/public key'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})

export default supabase
