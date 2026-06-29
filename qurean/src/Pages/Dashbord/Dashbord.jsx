import Registration from "../../Components/Registration/Registration"
import Students from "../../Components/StudentsList/Students"
import Payment from "../../Components/Payment/Payment"
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './Dashbord.css'

// ── Nav config ─────────────────────────────────────────────
const NAV_ITEMS = [
  {
    to: '/dashboard/registration',
    label: 'Registration',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
  },
  {
    to: '/dashboard/students',
    label: 'Students List',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    to: '/dashboard/payment',
    label: 'Payment',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
]

// ── Dashboard ──────────────────────────────────────────────
export default function Dashbord() {
  const navigate = useNavigate()
  const role     = sessionStorage.getItem('noor_role') || 'admin'
  const user     = sessionStorage.getItem('noor_user') || 'User'
  const initials = user.split('@')[0].slice(0, 2).toUpperCase()

  const handleLogout = () => {
    sessionStorage.clear()
    navigate('/login', { replace: true })
  }

  return (
    <div className="db-root">

      {/* ── SIDEBAR ── */}
      <aside className="db-sidebar">
        {/* Brand */}
        <div className="db-brand">
          <div className="db-brand-icon">
            <svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="40" cy="20" rx="18" ry="18" fill="none" stroke="#D4AF37" strokeWidth="1.5"/>
              <line x1="40" y1="2" x2="40" y2="8" stroke="#D4AF37" strokeWidth="1.5"/>
              <circle cx="40" cy="1" r="2" fill="#D4AF37"/>
              <rect x="22" y="36" width="36" height="18" rx="2" fill="none" stroke="#D4AF37" strokeWidth="1.5"/>
              <path d="M30 36 Q30 28 40 24 Q50 28 50 36" fill="none" stroke="#D4AF37" strokeWidth="1.5"/>
              <rect x="10" y="42" width="12" height="12" rx="1" fill="none" stroke="#D4AF37" strokeWidth="1.2"/>
              <path d="M10 42 Q16 37 22 42" fill="none" stroke="#D4AF37" strokeWidth="1.2"/>
              <rect x="58" y="42" width="12" height="12" rx="1" fill="none" stroke="#D4AF37" strokeWidth="1.2"/>
              <path d="M58 42 Q64 37 70 42" fill="none" stroke="#D4AF37" strokeWidth="1.2"/>
              <line x1="0" y1="54" x2="80" y2="54" stroke="#D4AF37" strokeWidth="1"/>
            </svg>
          </div>
          <div>
            <p className="db-brand-name">Noor Academy</p>
            <p className="db-brand-sub">Quran Hifz System</p>
          </div>
        </div>

        {/* Arabic divider */}
        <div className="db-arabic-divider">
          <span>بِسْمِ اللَّهِ</span>
        </div>

        {/* Nav */}
        <nav className="db-nav">
          <p className="db-nav-label">Main Menu</p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="db-nav-icon">{item.icon}</span>
              <span className="db-nav-text">{item.label}</span>
              <span className="db-nav-arrow">›</span>
            </NavLink>
          ))}
        </nav>

        <div className="db-sidebar-spacer" />

        {/* User card */}
        <div className="db-user-card">
          <div className="db-user-avatar">{initials}</div>
          <div className="db-user-info">
            <p className="db-user-name">{user.split('@')[0]}</p>
            <p className="db-user-role">{role === 'admin' ? '🛡️ Admin' : '📋 Manager'}</p>
          </div>
          <button className="db-logout-btn" onClick={handleLogout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h1 className="db-page-title">Dashboard</h1>
            <p className="db-page-sub">Quran Registration Management</p>
          </div>
          <div className="db-topbar-right">
            <div className="db-date-chip">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
              })}
            </div>
            <div className="db-role-chip">
              {role === 'admin' ? '🛡️ Admin' : '📋 Manager'}
            </div>
          </div>
        </header>

        <div className="db-content">
          {/* Nested routes — swap placeholders with real imports when ready */}
          <Routes>
            <Route index element={<Navigate to="/dashboard/registration" replace />} />
            <Route path="registration" element={<Registration />} />
            <Route path="students"     element={<Students />} />
            <Route path="payment"      element={<Payment />} />
          </Routes>
        </div>
      </main>

    </div>
  )
}