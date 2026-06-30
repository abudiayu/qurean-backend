import { useState } from 'react'
import { useStudents } from '../../context/StudentsContext'
import { useNavigate } from 'react-router-dom'
import './Students.css'

const LEVEL_COLORS = {
  'Beginner':     { bg: '#e8f5e9', color: '#2e7d32' },
  'Intermediate': { bg: '#fff3e0', color: '#e65100' },
  'Advanced':     { bg: '#e3f2fd', color: '#1565c0' },
  'Hafiz Track':  { bg: '#f3e5f5', color: '#6a1b9a' },
}

const METHOD_COLORS = {
  'Cash':           { bg: '#e8f5e9', color: '#2e7d32' },
  'Bank Transfer':  { bg: '#e3f2fd', color: '#1565c0' },
  'Mobile Money':   { bg: '#fff3e0', color: '#e65100' },
}

// ── Student Detail Modal ───────────────────────────────────
function StudentModal({ student, onClose }) {
  const { getStudentPayments } = useStudents()
  const pays  = getStudentPayments(student.id)
  const total = pays.reduce((s, p) => s + p.amount, 0)
  const lvColor = LEVEL_COLORS[student.hizLevel] || { bg: '#f0f0f0', color: '#333' }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* ── Hero banner ── */}
        <div className="modal-hero">
          <div className="modal-avatar">
            {student.photoPreview
              ? <img src={student.photoPreview} alt={student.fullName}/>
              : <span>{student.fullName[0]?.toUpperCase()}</span>}
          </div>
          <div className="modal-hero-info">
            <h2 className="modal-name">{student.fullName}</h2>
            {student.arabicName && (
              <p className="modal-arabic" dir="rtl">{student.arabicName}</p>
            )}
            <span className="modal-level-badge"
              style={{ background: lvColor.bg, color: lvColor.color }}>
              {student.hizLevel}
            </span>
          </div>
          <div className="modal-total-box">
            <span className="modal-total-label">Total Paid</span>
            <span className="modal-total-val">{total.toLocaleString()} ETB</span>
            <span className="modal-pay-count">{pays.length} payment{pays.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="modal-body">

          {/* ── Personal info ── */}
          <div className="modal-section">
            <p className="modal-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              Personal — የግል መረጃ
            </p>
            <div className="modal-info-grid">
              <InfoRow icon="⚧"  label="ፆታ / Gender"          value={student.gender}/>
              <InfoRow icon="🎂" label="ዕድሜ / Age"              value={student.age || '—'}/>
              <InfoRow icon="🏠" label="የመጠ-ቦት ስፈ.ር"           value={student.placeOfBirth || '—'}/>
              <InfoRow icon="🏫" label="የክፍል ደረጃ"              value={student.classLevel || '—'}/>
              <InfoRow icon="📍" label="ቦታ / Area"              value={student.studentArea || '—'}/>
              <InfoRow icon="🚌" label="ትራንስፖርት"               value={student.transport || '—'}/>
              {student.specialNeeds && <InfoRow icon="⭐" label="ልዩ ፍላጎት" value={student.specialNeeds}/>}
            </div>
          </div>

          {/* ── Parents ── */}
          <div className="modal-section">
            <p className="modal-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              Parents — ወላጆች
            </p>
            <div className="modal-info-grid">
              <InfoRow icon="👨‍👧" label="ወላጅ 1 ስም"    value={student.parent1Name || '—'}/>
              <InfoRow icon="📞" label="ወላጅ 1 ስልክ"    value={student.parent1Phone || '—'}/>
              {student.parent2Name && <>
                <InfoRow icon="👩‍👧" label="ወላጅ 2 ስም"  value={student.parent2Name}/>
                <InfoRow icon="📞" label="ወላጅ 2 ስልክ"  value={student.parent2Phone || '—'}/>
              </>}
              <InfoRow icon="💰" label="የወርሀዊ ክፍያ"   value={student.monthlyFee ? `${Number(student.monthlyFee).toLocaleString()} ETB` : '—'}/>
            </div>
          </div>

          {/* ── Academic info ── */}
          <div className="modal-section">
            <p className="modal-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Academic Information
            </p>
            <div className="modal-info-grid">
              <InfoRow icon="📖" label="Starting Surah" value={student.startingSurah}/>
              <InfoRow icon="📚" label="Starting Juz'"  value={student.startingJuz}/>
              <InfoRow icon="🗓" label="Class Days"     value={student.classDays?.join(', ')}/>
              {student.teacherNotes && (
                <InfoRow icon="📝" label="Teacher Notes" value={student.teacherNotes}/>
              )}
              <InfoRow icon="🕐" label="Registered"
                value={new Date(student.registeredAt).toLocaleDateString('en-GB', {
                  day:'numeric', month:'short', year:'numeric'
                })}/>
            </div>
          </div>

          {/* ── Payment history ── */}
          <div className="modal-section">
            <p className="modal-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Payment History
            </p>

            {pays.length === 0 ? (
              <div className="modal-no-pay">
                <span>⚠️</span>
                <p>No payments recorded yet</p>
              </div>
            ) : (
              <div className="modal-pay-table-wrap">
                <table className="modal-pay-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Period</th>
                      <th>Method</th>
                      <th>Note</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...pays].reverse().map((p, i) => {
                      const mc = METHOD_COLORS[p.method] || { bg:'#f0f0f0', color:'#333' }
                      return (
                        <tr key={p.id}>
                          <td className="modal-td-num">{pays.length - i}</td>
                          <td>{p.month} {p.year}</td>
                          <td>
                            <span className="modal-method-chip"
                              style={{ background: mc.bg, color: mc.color }}>
                              {p.method}
                            </span>
                          </td>
                          <td className="modal-td-note">{p.note || '—'}</td>
                          <td className="modal-td-date">
                            {new Date(p.paidAt).toLocaleDateString('en-GB')}
                          </td>
                          <td className="modal-td-amount">{p.amount.toLocaleString()} ETB</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="5" className="modal-tfoot-label">Total</td>
                      <td className="modal-tfoot-total">{total.toLocaleString()} ETB</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="modal-info-row">
      <span className="modal-info-icon">{icon}</span>
      <span className="modal-info-label">{label}</span>
      <span className="modal-info-value">{value}</span>
    </div>
  )
}

// ── Main Students Component ────────────────────────────────
export default function Students() {
  const { students, getStudentPayments, loading, error } = useStudents()
  const navigate = useNavigate()
  const [search, setSearch]           = useState('')
  const [filterLevel, setFilterLevel] = useState('All')
  const [activeStudent, setActiveStudent] = useState(null)

  const filtered = students.filter(s => {
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
                        (s.parent1Phone || '').includes(search)
    const matchLevel  = filterLevel === 'All' || s.hizLevel === filterLevel
    return matchSearch && matchLevel
  })

  // Loading state
  if (loading) {
    return (
      <div className="sl-root">
        <div className="sl-empty">
          <div className="sl-empty-icon" style={{fontSize:'2rem'}}>⏳</div>
          <h3>Loading students…</h3>
          <p>Fetching data from the database</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="sl-root">
        <div className="sl-empty">
          <div className="sl-empty-icon">⚠️</div>
          <h3>Failed to load students</h3>
          <p style={{color:'#c0392b'}}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sl-root">

      {/* Header */}
      <div className="sl-header">
        <div>
          <p className="sl-eyebrow">القرآن الكريم</p>
          <h1 className="sl-title">Students List</h1>
          <p className="sl-subtitle">
            {students.length} student{students.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <button className="sl-add-btn" onClick={() => navigate('/dashboard/registration')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="sl-filters">
        <div className="sl-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="sl-search" placeholder="Search by name or phone…"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="sl-level-tabs">
          {['All','Beginner','Intermediate','Advanced','Hafiz Track'].map(l => (
            <button key={l}
              className={`sl-tab ${filterLevel === l ? 'active' : ''}`}
              onClick={() => setFilterLevel(l)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {students.length === 0 && (
        <div className="sl-empty">
          <div className="sl-empty-icon">👥</div>
          <h3>No students yet</h3>
          <p>Register a student to see them here.</p>
          <button className="sl-add-btn" onClick={() => navigate('/dashboard/registration')}>
            Register First Student
          </button>
        </div>
      )}

      {students.length > 0 && filtered.length === 0 && (
        <div className="sl-empty">
          <div className="sl-empty-icon">🔍</div>
          <h3>No match found</h3>
          <p>Try a different name or filter.</p>
        </div>
      )}

      {/* Cards grid */}
      {filtered.length > 0 && (
        <div className="sl-grid">
          {filtered.map(student => {
            const pays    = getStudentPayments(student.id)
            const total   = pays.reduce((s, p) => s + p.amount, 0)
            const lastPay = pays.length ? pays[pays.length - 1] : null
            const lvColor = LEVEL_COLORS[student.hizLevel] || { bg:'#f0f0f0', color:'#333' }

            return (
              <div className="sl-card" key={student.id}>
                <div className="sl-card-top">
                  <div className="sl-avatar">
                    {student.photoPreview
                      ? <img src={student.photoPreview} alt={student.fullName}/>
                      : <span>{student.fullName[0]?.toUpperCase()}</span>}
                  </div>
                  <span className="sl-level-badge"
                    style={{ background: lvColor.bg, color: lvColor.color }}>
                    {student.hizLevel}
                  </span>
                </div>

                <div className="sl-card-body">
                  <h3 className="sl-card-name">{student.fullName}</h3>
                  {student.arabicName && (
                    <p className="sl-card-arabic" dir="rtl">{student.arabicName}</p>
                  )}
                  <div className="sl-card-meta">
                    <span>👨‍👧 {student.parent1Name || '—'}</span>
                    <span>📖 {student.startingJuz}</span>
                    <span>🗓 {student.classDays?.slice(0,2).join(', ')}{student.classDays?.length > 2 ? '…' : ''}</span>
                  </div>
                </div>

                <div className="sl-card-pay">
                  <div className="sl-pay-row">
                    <span className="sl-pay-label">Total Paid</span>
                    <span className="sl-pay-amount">{total.toLocaleString()} ETB</span>
                  </div>
                  {lastPay && (
                    <div className="sl-pay-row">
                      <span className="sl-pay-label">Last Payment</span>
                      <span className="sl-pay-last">{lastPay.month} {lastPay.year}</span>
                    </div>
                  )}
                  {pays.length === 0 && (
                    <p className="sl-pay-none">⚠️ No payment recorded</p>
                  )}
                </div>

                {/* ── Changed: opens modal instead of navigating ── */}
                <button
                  className="sl-card-pay-btn"
                  onClick={() => setActiveStudent(student)}
                >
                  View Details
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {activeStudent && (
        <StudentModal
          student={activeStudent}
          onClose={() => setActiveStudent(null)}
        />
      )}
    </div>
  )
}
