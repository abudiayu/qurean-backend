import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login    from './Pages/Auth/Login'
import Dashbord from './Pages/Dashbord/Dashbord'
import { supabase } from './lib/supabase.js'
import './App.css'

// ── Auth Guard ──────────────────────────────────────────────────────────────
// Reads the real Supabase session instead of sessionStorage.
function PrivateRoute({ children }) {
  const [checking, setChecking] = useState(true)
  const [authed,   setAuthed]   = useState(false)

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
      setChecking(false)
    })

    // Keep in sync if the user logs out in another tab
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (checking) return null   // avoid flash — render nothing until we know
  return authed ? children : <Navigate to="/login" replace />
}

// ── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<Navigate to="/login" replace />} />
        <Route path="/login"  element={<Login />} />

        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashbord />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
