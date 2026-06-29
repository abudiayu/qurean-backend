import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login     from './Pages/Auth/Login'
import Dashbord  from './Pages/Dashbord/Dashbord'
import './App.css'

// ── Auth Guard ─────────────────────────────────────────────
function PrivateRoute({ children }) {
  const isLoggedIn = sessionStorage.getItem('noor_auth') === 'true'
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

// ── App ────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root → Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected — nested routes rendered via <Outlet /> in Dashbord.jsx */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashbord />
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App