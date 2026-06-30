
import supabase from '../lib/supabase.js'
import { assertSupabase, ApiError } from '../utils/errors.js'

export const authService = {
  /**
   * Create a new user account (admin-initiated, no email confirmation needed).
   * @param {{ email, password, metadata? }} opts
   */
  async createUser({ email, password, metadata = {} }) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: metadata,
      email_confirm: true, // skip confirmation email for admin-created accounts
    })
    if (error) assertSupabase({ data, error }, 'auth.createUser')
    return data.user
  },

  /**
   * List all users (admin only).
   * @param {{ page?, perPage? }} opts
   */
  async listUsers({ page = 1, perPage = 50 } = {}) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    })
    if (error) assertSupabase({ data, error }, 'auth.listUsers')
    return data
  },

  /**
   * Get a single user by their UUID.
   * @param {string} userId
   */
  async getUser(userId) {
    const { data, error } = await supabase.auth.admin.getUserById(userId)
    if (error) assertSupabase({ data, error }, 'auth.getUser')
    return data.user
  },

  /**
   * Update a user's email, password, or metadata.
   * @param {string} userId
   * @param {object} attrs  — { email?, password?, user_metadata? }
   */
  async updateUser(userId, attrs) {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, attrs)
    if (error) assertSupabase({ data, error }, 'auth.updateUser')
    return data.user
  },

  /**
   * Permanently delete a user.
   * @param {string} userId
   */
  async deleteUser(userId) {
    const { data, error } = await supabase.auth.admin.deleteUser(userId)
    if (error) assertSupabase({ data, error }, 'auth.deleteUser')
    return data
  },

  /**
   * Verify a JWT from the Authorization header and return the user.
   * Use this in middleware to protect routes.
   * @param {string} token — the raw JWT (without "Bearer ")
   */
  async verifyToken(token) {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) {
      throw new ApiError('Invalid or expired token', 401)
    }
    return data.user
  },
}
