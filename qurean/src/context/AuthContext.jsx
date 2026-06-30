/**
 * src/context/AuthContext.jsx
 *
 * Provides authentication state to the entire app.
 * Wraps the existing StudentsProvider so all contexts live together.
 *
 * What it does:
 *  - Listens to Supabase auth state changes (login / logout / token refresh)
 *  - Exposes: user, session, loading, signUp, signIn, signOut, resetPassword
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)  // true until first session check

  useEffect(() => {
    // 1. Grab the current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // 2. Subscribe to future auth events (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)
      }
    )

    // Cleanup listener on unmount
    return () => subscription.unsubscribe()
  }, [])

  // ── Auth actions ───────────────────────────────────────────────────────

  /** Sign up with email + password */
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  /** Sign in with email + password */
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  /** Sign out */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  /** Send a password reset email */
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      signUp, signIn, signOut, resetPassword,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
