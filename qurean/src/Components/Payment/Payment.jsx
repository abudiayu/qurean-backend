import { useState } from 'react'
import { useStudents } from '../../context/StudentsContext'
import { useNavigate } from 'react-router-dom'
import './Payment.css'

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Mobile Money']
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

export default function Payment() {
  const { students, payments, addPayment, getStudentPayments } = useStudents()
  const navigate = useNavigate()

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showForm, setShowForm]               = useState(false)
  const [search, setSearch]                   = useState('')

  const [form, setForm]     = useState({
    amount: '', method: 'Cash',
    month: MONTHS[new Date().getMonth()],
    year: String(new Date().getFullYear()),
    note: '',
  })
  const [errors, setErrors] = useState({})
  const [flash, setFlash]   = useState(false)

  const setF = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      e.amount = 'Enter a valid amount'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    addPayment({
      studentId:   selectedStudent.id,
      studentName: selectedStudent.fullName,
      amount:      Number(form.amount),
      method:      form.method,
      month:       form.month,
      year:        form.year,
      note:        form.note,
    })
    setForm({ amount:'', method:'Cash', month: MONTHS[new Date().getMonth()],
              year: String(new Date().getFullYear()), note:'' })
    setShowForm(false)
    setFlash(true)
    setTimeout(() => setFlash(false), 2500)
  }

  const [statusFilter, setStatusFilter] = useState('All')

  const totalAllPayments = payments.reduce((s, p) => s + p.amount, 0)
  const paidCount   = students.filter(s => getStudentPayments(s.id).length > 0).length
  const unpaidCount = students.filter(s => getStudentPayments(s.id).length === 0).length

  const filteredStudents = students.filter(s => {
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
                        s.phone.includes(search)
    const hasPaid = getStudentPayments(s.id).length > 0
    const matchStatus =
      statusFilter === 'All'    ? true :
      statusFilter === 'Paid'   ? hasPaid :
      statusFilter === 'Unpaid' ? !hasPaid : true
    return matchSearch && matchStatus
  })

  // ── per-student payments view ──────────────────────────
  if (selectedStudent) {
    const pays = getStudentPayments(selectedStudent.id)
    const total = pays.reduce((s, p) => s + p.amount, 0)

    return (
      <div className="pay-root">

        <div className="pay-header">
          <button className="pay-back-btn" onClick={() => { setSelectedStudent(null); setShowForm(false) }}>
            ← Back to All Students
          </button>
          <div className="pay-header-right">
            <button className="pay-add-btn" onClick={() => setShowForm(v => !v)}>
              {showForm ? 'Cancel' : '+ Add Payment'}
            </button>
          </div>
        </div>

        {/* Student info banner */}
        <div className="pay-student-banner">
          <div className="pay-banner-avatar">
            {selectedStudent.photoPreview
              ? <img src={selectedStudent.photoPreview} alt={selectedStudent.fullName}/>
              : <span>{selectedStudent.fullName[0]?.toUpperCase()}</span>}
          </div>
          <div className="pay-banner-info">
            <h2>{selectedStudent.fullName}</h2>
            {selectedStudent.arabicName && <p className="pay-banner-arabic" dir="rtl">{selectedStudent.arabicName}</p>}
            <p>{selectedStudent.hizLevel} · {selectedStudent.startingJuz} · 📞 {selectedStudent.parent1Phone || selectedStudent.phone || '—'}</p>
          </div>
          <div className="pay-banner-total">
            <span className="pay-banner-total-label">Total Paid</span>
            <span className="pay-banner-total-amount">{total.toLocaleString()} ETB</span>
          </div>
        </div>

        {/* Flash */}
        {flash && (
          <div className="pay-flash">✅ Payment recorded successfully</div>
        )}

        {/* Add payment form */}
        {showForm && (
          <div className="pay-form-card">
            <p className="pay-form-title">New Payment</p>
            <div className="pay-form-grid">
              <div className="pay-field">
                <label>Amount (ETB) <span className="req">*</span></label>
                <input type="number" placeholder="e.g. 500" min="0"
                  value={form.amount} onChange={e => setF('amount', e.target.value)}
                  className={errors.amount ? 'error' : ''}/>
                {errors.amount && <span className="pay-err">{errors.amount}</span>}
              </div>
              <div className="pay-field">
                <label>Method</label>
                <select value={form.method} onChange={e => setF('method', e.target.value)}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="pay-field">
                <label>Month</label>
                <select value={form.month} onChange={e => setF('month', e.target.value)}>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="pay-field">
                <label>Year</label>
                <input type="number" value={form.year} min="2020" max="2100"
                  onChange={e => setF('year', e.target.value)}/>
              </div>
              <div className="pay-field pay-field-full">
                <label>Note</label>
                <input type="text" placeholder="Optional note…"
                  value={form.note} onChange={e => setF('note', e.target.value)}/>
              </div>
            </div>
            <div className="pay-form-actions">
              <button className="pay-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="pay-submit-btn" onClick={handleSubmit}>Save Payment</button>
            </div>
          </div>
        )}

        {/* Payments table */}
        {pays.length === 0 ? (
          <div className="pay-empty">
            <div className="pay-empty-icon">💳</div>
            <h3>No payments yet</h3>
            <p>Click "Add Payment" to record the first payment.</p>
          </div>
        ) : (
          <div className="pay-table-wrap">
            <table className="pay-table">
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
                {[...pays].reverse().map((p, i) => (
                  <tr key={p.id}>
                    <td>{pays.length - i}</td>
                    <td>{p.month} {p.year}</td>
                    <td>
                      <span className={`pay-method-chip method-${p.method.replace(' ','-').toLowerCase()}`}>
                        {p.method}
                      </span>
                    </td>
                    <td className="pay-note">{p.note || '—'}</td>
                    <td>{new Date(p.paidAt).toLocaleDateString('en-GB')}</td>
                    <td className="pay-amount-cell">{p.amount.toLocaleString()} ETB</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="pay-tfoot-label">Total</td>
                  <td className="pay-tfoot-total">{total.toLocaleString()} ETB</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    )
  }

  // ── ALL STUDENTS PAYMENT OVERVIEW ──────────────────────
  return (
    <div className="pay-root">

      <div className="pay-header">
        <div>
          <p className="pay-eyebrow">القرآن الكريم</p>
          <h1 className="pay-title">Payments</h1>
          <p className="pay-subtitle">Select a student to view or add payments</p>
        </div>
        <div className="pay-summary-chip">
          <span className="pay-summary-label">Total Collected</span>
          <span className="pay-summary-amount">{totalAllPayments.toLocaleString()} ETB</span>
        </div>
      </div>

      {/* Search + Filter tabs */}
      <div className="pay-controls">
        <div className="pay-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="pay-search"
            placeholder="Search student…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="pay-status-tabs">
          {[
            { key: 'All',    label: 'All',     count: students.length },
            { key: 'Paid',   label: 'Paid',    count: paidCount },
            { key: 'Unpaid', label: 'Unpaid',  count: unpaidCount },
          ].map(tab => (
            <button
              key={tab.key}
              className={`pay-status-tab ${statusFilter === tab.key ? 'active' : ''} tab-${tab.key.toLowerCase()}`}
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label}
              <span className="pay-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {students.length === 0 && (
        <div className="pay-empty">
          <div className="pay-empty-icon">👥</div>
          <h3>No students registered</h3>
          <p>Register a student first.</p>
          <button className="pay-submit-btn" onClick={() => navigate('/dashboard/registration')}>
            Go to Registration
          </button>
        </div>
      )}

      {/* Student list */}
      {filteredStudents.length > 0 && (
        <div className="pay-students-list">
          {filteredStudents.map(student => {
            const pays  = getStudentPayments(student.id)
            const total = pays.reduce((s, p) => s + p.amount, 0)
            const last  = pays.length ? pays[pays.length - 1] : null

            return (
              <div
                className="pay-student-row"
                key={student.id}
                onClick={() => { setSelectedStudent(student); setShowForm(false) }}
              >
                <div className="pay-row-avatar">
                  {student.photoPreview
                    ? <img src={student.photoPreview} alt={student.fullName}/>
                    : <span>{student.fullName[0]?.toUpperCase()}</span>}
                </div>
                <div className="pay-row-info">
                  <p className="pay-row-name">{student.fullName}</p>
                  <p className="pay-row-sub">{student.hizLevel} · {student.parent1Phone || student.phone || '—'}</p>
                </div>
                <div className="pay-row-right">
                  <span className={`pay-status-badge ${pays.length > 0 ? 'badge-paid' : 'badge-unpaid'}`}>
                    {pays.length > 0 ? '✓ Paid' : '✗ Unpaid'}
                  </span>
                  <p className="pay-row-total">{total.toLocaleString()} ETB</p>
                  <p className="pay-row-count">
                    {pays.length} payment{pays.length !== 1 ? 's' : ''}
                    {last ? ` · last: ${last.month}` : ''}
                  </p>
                </div>
                <svg className="pay-row-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
