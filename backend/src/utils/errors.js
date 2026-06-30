
export function assertSupabase({ data, error }, label = 'Supabase') {
  if (error) {
    const err = new Error(error.message || `${label} error`)
    err.status = mapSupabaseCode(error.code)
    err.code   = error.code
    throw err
  }
  return data
}

function mapSupabaseCode(code) {
  switch (code) {
    case '23505': return 409   // unique_violation
    case '23503': return 409   // foreign_key_violation
    case 'PGRST116': return 404 // row not found (single row expected)
    default: return 500
  }
}

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.status = status
  }
}
