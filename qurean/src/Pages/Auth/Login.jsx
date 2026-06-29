import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// ── Decorative SVG Components ──────────────────────────────

const GeometricPattern = () => (
  <svg className="geo-pattern" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="star8" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <polygon
          points="40,5 47,28 70,28 52,43 59,66 40,52 21,66 28,43 10,28 33,28"
          fill="none" stroke="rgba(212,175,55,0.18)" strokeWidth="1"
        />
        <rect x="20" y="20" width="40" height="40" transform="rotate(45 40 40)"
          fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="0.8" />
        <circle cx="40" cy="40" r="3" fill="rgba(212,175,55,0.12)" />
      </pattern>
      <pattern id="hexGrid" x="0" y="0" width="60" height="104" patternUnits="userSpaceOnUse">
        <polygon points="30,2 58,17 58,47 30,62 2,47 2,17"
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <polygon points="30,54 58,69 58,99 30,114 2,99 2,69"
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#star8)" />
    <rect width="400" height="400" fill="url(#hexGrid)" />
  </svg>
);

const MosqueIcon = () => (
  <svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" className="mosque-icon">
    <ellipse cx="40" cy="20" rx="18" ry="18" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
    <line x1="40" y1="2" x2="40" y2="8" stroke="#D4AF37" strokeWidth="1.5" />
    <circle cx="40" cy="1" r="2" fill="#D4AF37" />
    <rect x="22" y="36" width="36" height="18" rx="2" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
    <path d="M30 36 Q30 28 40 24 Q50 28 50 36" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
    <rect x="10" y="42" width="12" height="12" rx="1" fill="none" stroke="#D4AF37" strokeWidth="1.2" />
    <path d="M10 42 Q16 37 22 42" fill="none" stroke="#D4AF37" strokeWidth="1.2" />
    <rect x="58" y="42" width="12" height="12" rx="1" fill="none" stroke="#D4AF37" strokeWidth="1.2" />
    <path d="M58 42 Q64 37 70 42" fill="none" stroke="#D4AF37" strokeWidth="1.2" />
    <line x1="0" y1="54" x2="80" y2="54" stroke="#D4AF37" strokeWidth="1" />
  </svg>
);

// ── Demo Credentials (replace with real API) ───────────────
const CREDENTIALS = {
  admin:   { username: "admin@noor.edu",   password: "admin123" },
  manager: { username: "manager@noor.edu", password: "manager123" },
};

// ── Login Component ────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [role, setRole]               = useState("admin");
  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const cred = CREDENTIALS[role];
      if (username === cred.username && password === cred.password) {
        sessionStorage.setItem("noor_auth", "true");
        sessionStorage.setItem("noor_role", role);
        sessionStorage.setItem("noor_user", username);
        navigate("/dashboard", { replace: true });
      } else {
        setLoading(false);
        setError("Invalid credentials. Please try again.");
      }
    }, 1200);
  };

  return (
    <div className="login-root">

      {/* ── LEFT PANEL ── */}
      <div className="login-panel-left">
        <GeometricPattern />
        <div className="left-content">
          <div className="brand-mark"><MosqueIcon /></div>

          <div className="arabic-verse">
            <p className="arabic-text">اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</p>
            <p className="arabic-ref">سورة العلق ٩٦:١</p>
          </div>

          <div className="brand-name">
            <h1 className="brand-title">Hidaya Academy</h1>
            <p className="brand-subtitle">Quran Learning & Registration System</p>
          </div>

          <div className="left-stats">
            <div className="stat-pill">
              <span className="stat-num">٣٠</span>
              <span className="stat-label">Juz' Covered</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">١١٤</span>
              <span className="stat-label">Surahs</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">٦٢٣٦</span>
              <span className="stat-label">Ayahs</span>
            </div>
          </div>
        </div>
        <div className="left-footer">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-panel-right">
        <div className="login-card">

          <div className="card-arch">
            <svg viewBox="0 0 300 36" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 36 Q75 0 150 0 Q225 0 300 36" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
              <circle cx="150" cy="0" r="4" fill="#D4AF37" />
              <circle cx="0" cy="36" r="3" fill="rgba(212,175,55,0.4)" />
              <circle cx="300" cy="36" r="3" fill="rgba(212,175,55,0.4)" />
            </svg>
          </div>

          <div className="card-header">
            <h2 className="card-title">Welcome Back</h2>
            <p className="card-desc">Sign in to manage your Quran school</p>
          </div>

          {/* Role switcher */}
          <div className="role-switcher">
            <button type="button"
              className={`role-btn ${role === "admin" ? "active" : ""}`}
              onClick={() => { setRole("admin"); setError(""); }}>
              <span className="role-icon">🛡️</span> Admin
            </button>
            <button type="button"
              className={`role-btn ${role === "manager" ? "active" : ""}`}
              onClick={() => { setRole("manager"); setError(""); }}>
              <span className="role-icon">📋</span> Manager
            </button>
          </div>

          <form className="login-form" onSubmit={handleLogin} noValidate>

            {/* Username */}
            <div className="field-group">
              <label className="field-label" htmlFor="username">Username</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </span>
                <input id="username" type="text" className="field-input"
                  placeholder={role === "admin" ? "admin@noor.edu" : "manager@noor.edu"}
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username" />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input id="password" type={showPassword ? "text" : "password"}
                  className="field-input" placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" />
                <button type="button" className="toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="options-row">
              <label className="remember-label">
                <input type="checkbox" className="remember-check" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#forgot" className="forgot-link">Forgot password?</a>
            </div>

            {/* Error */}
            {error && (
              <div className="error-msg" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className={`login-btn ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? (
                <span className="spinner-wrap">
                  <span className="spinner" /> Signing in…
                </span>
              ) : (
                <>
                  Sign In as {role === "admin" ? "Admin" : "Manager"}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-arrow">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>

          </form>

          <div className="card-divider">
            <span>أَوَّلُ الْعِلْمِ الصَّمْت</span>
          </div>
          <p className="card-footer-text">Noor Academy · Quran Registration System v2.0</p>

          <div className="card-arch bottom-arch">
            <svg viewBox="0 0 300 36" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0 Q75 36 150 36 Q225 36 300 0" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
              <circle cx="150" cy="36" r="4" fill="#D4AF37" />
            </svg>
          </div>

        </div>
      </div>
    </div>
  );
}