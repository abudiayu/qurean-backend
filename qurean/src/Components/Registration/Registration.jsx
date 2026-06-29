import { useState } from 'react'
import { useStudents } from '../../context/StudentsContext'
import { useNavigate } from 'react-router-dom'
import './Registration.css'

const JUZZ_OPTIONS  = Array.from({ length: 30 }, (_, i) => `Juz' ${i + 1}`)
const SURAH_OPTIONS = [
  'Al-Fatiha','Al-Baqarah','Al-Imran','An-Nisa','Al-Maidah',
  'Al-Anam','Al-Araf','Al-Anfal','At-Tawbah','Yunus',
  'Hud','Yusuf',"Ar-Ra'd",'Ibrahim','Al-Hijr',
  'An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha',
]
const LEVELS  = ['Beginner','Intermediate','Advanced','Hafiz Track']
const GENDERS = ['Male','Female']
const DAYS    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const PAYMENT_METHODS = ['Cash','Bank Transfer','Mobile Money']
const MONTHS  = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December']

const INITIAL = {
  fullName:'', arabicName:'', dateOfBirth:'', gender:'',
  phone:'', parentName:'', parentPhone:'', email:'',
  address:'', level:'', startingSurah:'', startingJuz:'',
  classDays:[], teacherNotes:'', photo: null,
}

const PAY_INITIAL = {
  amount:'', method:'Cash', month: MONTHS[new Date().getMonth()],
  year: String(new Date().getFullYear()), note:'',
}

export default function Registration() {
  const { addStudent, addPayment } = useStudents()
  const navigate = useNavigate()

  const [form, setForm]           = useState(INITIAL)
  const [errors, setErrors]       = useState({})
  const [photoPreview, setPhotoPreview] = useState(null)
  const [step, setStep]           = useState(1)   // 1 Personal | 2 Academic | 3 Review | 4 Payment
  const [payForm, setPayForm]     = useState(PAY_INITIAL)
  const [payErrors, setPayErrors] = useState({})
  const [done, setDone]           = useState(false)
  const [skipPay, setSkipPay]     = useState(false)

  // ── form helpers ───────────────────────────────────────
  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }
  const setPay = (field, value) => {
    setPayForm(f => ({ ...f, [field]: value }))
    setPayErrors(e => ({ ...e, [field]: '' }))
  }
  const toggleDay = (day) =>
    setForm(f => ({
      ...f,
      classDays: f.classDays.includes(day)
        ? f.classDays.filter(d => d !== day)
        : [...f.classDays, day],
    }))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(f => ({ ...f, photo: file }))
    setPhotoPreview(URL.createObjectURL(file))
  }

  // ── validation ─────────────────────────────────────────
  const validate = (s) => {
    const e = {}
    if (s === 1) {
      if (!form.fullName.trim())    e.fullName    = 'Full name is required'
      if (!form.dateOfBirth)        e.dateOfBirth = 'Date of birth is required'
      if (!form.gender)             e.gender      = 'Select a gender'
      if (!form.phone.trim())       e.phone       = 'Phone number is required'
      if (!form.parentName.trim())  e.parentName  = 'Parent/guardian name is required'
      if (!form.parentPhone.trim()) e.parentPhone = 'Parent phone is required'
    }
    if (s === 2) {
      if (!form.level)                   e.level        = 'Select a level'
      if (!form.startingSurah)           e.startingSurah= 'Select starting surah'
      if (!form.startingJuz)             e.startingJuz  = "Select starting juz'"
      if (form.classDays.length === 0)   e.classDays    = 'Select at least one class day'
    }
    return e
  }

  const validatePay = () => {
    const e = {}
    if (!payForm.amount || isNaN(payForm.amount) || Number(payForm.amount) <= 0)
      e.amount = 'Enter a valid amount'
    if (!payForm.method) e.method = 'Select payment method'
    return e
  }

  const nextStep = () => {
    const e = validate(step)
    if (Object.keys(e).length) { setErrors(e); return }
    setStep(s => s + 1)
  }
  const prevStep = () => setStep(s => s - 1)

  // ── submit registration (step 3 → 4) ──────────────────
  const handleRegister = (e) => {
    e.preventDefault()
    const e2 = validate(2)
    if (Object.keys(e2).length) { setErrors(e2); setStep(2); return }
    setStep(4)
  }

  // ── submit payment ─────────────────────────────────────
  const handlePaySubmit = () => {
    const e = validatePay()
    if (Object.keys(e).length) { setPayErrors(e); return }

    const studentId = addStudent({ ...form, photoPreview })
    addPayment({
      studentId,
      studentName: form.fullName,
      amount: Number(payForm.amount),
      method: payForm.method,
      month: payForm.month,
      year: payForm.year,
      note: payForm.note,
    })
    setDone(true)
  }

  // ── skip payment (register without paying) ─────────────
  const handleSkip = () => {
    addStudent({ ...form, photoPreview })
    setSkipPay(true)
    setDone(true)
  }

  const handleReset = () => {
    setForm(INITIAL); setPayForm(PAY_INITIAL)
    setErrors({}); setPayErrors({})
    setPhotoPreview(null); setStep(1)
    setDone(false); setSkipPay(false)
  }

  // ── STEP LABELS (4 steps now) ──────────────────────────
  const STEP_LABELS = ['Personal Info','Academic Info','Review','Payment']

  // ══════════════════════════════════════════════════════
  // SUCCESS SCREEN
  // ══════════════════════════════════════════════════════
  if (done) {
    return (
      <div className="reg-success">
        <div className="reg-success-inner">
          <div className="reg-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="reg-success-arabic">جَزَاكُمُ اللَّهُ خَيْرًا</p>
          <h2>Student Registered!</h2>
          <p className="reg-success-name">{form.fullName}</p>
          {!skipPay && (
            <p className="reg-success-sub">
              Payment of <strong>{Number(payForm.amount).toLocaleString()} ETB</strong> recorded via <strong>{payForm.method}</strong>
            </p>
          )}
          {skipPay && (
            <p className="reg-success-sub reg-success-warn">⚠️ No payment recorded yet</p>
          )}
          <div className="reg-success-actions">
            <button className="reg-btn-primary" onClick={handleReset}>
              Register Another Student
            </button>
            <button className="reg-btn-secondary" onClick={() => navigate('/dashboard/students')}>
              View Students List
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div className="reg-root">

      {/* ── Header ── */}
      <div className="reg-header">
        <div className="reg-header-left">
          <p className="reg-eyebrow">القرآن الكريم</p>
          <h1 className="reg-title">Student Registration</h1>
          <p className="reg-subtitle">Enroll a new student in the Quran Hifz programme</p>
        </div>
        <div className="reg-header-right">
          <div className="reg-step-pills">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className={`reg-step-pill ${step === i+1 ? 'active' : step > i+1 ? 'done' : ''}`}>
                <span className="reg-step-num">
                  {step > i+1
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    : i+1}
                </span>
                <span className="reg-step-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="reg-card">
        <div className="reg-arch">
          <svg viewBox="0 0 600 28" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 28 Q150 0 300 0 Q450 0 600 28" fill="none" stroke="#D4AF37" strokeWidth="1.5"/>
            <circle cx="300" cy="0" r="5" fill="#D4AF37"/>
            <circle cx="0"   cy="28" r="3" fill="rgba(212,175,55,0.35)"/>
            <circle cx="600" cy="28" r="3" fill="rgba(212,175,55,0.35)"/>
          </svg>
        </div>

        <form onSubmit={handleRegister} noValidate>

          {/* ════ STEP 1 — PERSONAL ════ */}
          {step === 1 && (
            <div className="reg-section">
              <div className="reg-section-title">
                <span className="reg-section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </span>
                Personal Information
              </div>

              <div className="reg-photo-row">
                <label className="reg-photo-upload" htmlFor="photo-input">
                  {photoPreview
                    ? <img src={photoPreview} alt="Preview" className="reg-photo-preview"/>
                    : <div className="reg-photo-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="3"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>Upload Photo</span>
                      </div>
                  }
                  <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} hidden/>
                </label>
                <div className="reg-photo-hint">
                  <p>Student passport photo</p>
                  <p>JPG or PNG, max 2MB</p>
                </div>
              </div>

              <div className="reg-grid-2">
                <div className="reg-field">
                  <label>Full Name <span className="req">*</span></label>
                  <input type="text" placeholder="e.g. Abdullah Hassan"
                    value={form.fullName} onChange={e => set('fullName', e.target.value)}
                    className={errors.fullName ? 'error' : ''}/>
                  {errors.fullName && <span className="reg-err">{errors.fullName}</span>}
                </div>
                <div className="reg-field">
                  <label>Arabic Name</label>
                  <input type="text" placeholder="الاسم بالعربية" dir="rtl"
                    value={form.arabicName} onChange={e => set('arabicName', e.target.value)}/>
                </div>
              </div>

              <div className="reg-grid-2">
                <div className="reg-field">
                  <label>Date of Birth <span className="req">*</span></label>
                  <input type="date" value={form.dateOfBirth}
                    onChange={e => set('dateOfBirth', e.target.value)}
                    className={errors.dateOfBirth ? 'error' : ''}/>
                  {errors.dateOfBirth && <span className="reg-err">{errors.dateOfBirth}</span>}
                </div>
                <div className="reg-field">
                  <label>Gender <span className="req">*</span></label>
                  <div className="reg-radio-group">
                    {GENDERS.map(g => (
                      <label key={g} className={`reg-radio ${form.gender === g ? 'selected' : ''}`}>
                        <input type="radio" name="gender" value={g}
                          checked={form.gender === g} onChange={() => set('gender', g)} hidden/>
                        {g === 'Male' ? '👦' : '👧'} {g}
                      </label>
                    ))}
                  </div>
                  {errors.gender && <span className="reg-err">{errors.gender}</span>}
                </div>
              </div>

              <div className="reg-grid-2">
                <div className="reg-field">
                  <label>Student Phone <span className="req">*</span></label>
                  <input type="tel" placeholder="+251 9XX XXX XXX"
                    value={form.phone} onChange={e => set('phone', e.target.value)}
                    className={errors.phone ? 'error' : ''}/>
                  {errors.phone && <span className="reg-err">{errors.phone}</span>}
                </div>
                <div className="reg-field">
                  <label>Email Address</label>
                  <input type="email" placeholder="student@email.com"
                    value={form.email} onChange={e => set('email', e.target.value)}/>
                </div>
              </div>

              <div className="reg-grid-2">
                <div className="reg-field">
                  <label>Parent / Guardian Name <span className="req">*</span></label>
                  <input type="text" placeholder="Parent full name"
                    value={form.parentName} onChange={e => set('parentName', e.target.value)}
                    className={errors.parentName ? 'error' : ''}/>
                  {errors.parentName && <span className="reg-err">{errors.parentName}</span>}
                </div>
                <div className="reg-field">
                  <label>Parent Phone <span className="req">*</span></label>
                  <input type="tel" placeholder="+251 9XX XXX XXX"
                    value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)}
                    className={errors.parentPhone ? 'error' : ''}/>
                  {errors.parentPhone && <span className="reg-err">{errors.parentPhone}</span>}
                </div>
              </div>

              <div className="reg-field reg-field-full">
                <label>Home Address</label>
                <input type="text" placeholder="City, Neighbourhood"
                  value={form.address} onChange={e => set('address', e.target.value)}/>
              </div>
            </div>
          )}

          {/* ════ STEP 2 — ACADEMIC ════ */}
          {step === 2 && (
            <div className="reg-section">
              <div className="reg-section-title">
                <span className="reg-section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </span>
                Academic Information
              </div>

              <div className="reg-grid-2">
                <div className="reg-field">
                  <label>Hifz Level <span className="req">*</span></label>
                  <select value={form.level} onChange={e => set('level', e.target.value)}
                    className={errors.level ? 'error' : ''}>
                    <option value="">Select level…</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.level && <span className="reg-err">{errors.level}</span>}
                </div>
                <div className="reg-field">
                  <label>Starting Juz' <span className="req">*</span></label>
                  <select value={form.startingJuz} onChange={e => set('startingJuz', e.target.value)}
                    className={errors.startingJuz ? 'error' : ''}>
                    <option value="">Select Juz'…</option>
                    {JUZZ_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                  {errors.startingJuz && <span className="reg-err">{errors.startingJuz}</span>}
                </div>
              </div>

              <div className="reg-field">
                <label>Starting Surah <span className="req">*</span></label>
                <select value={form.startingSurah} onChange={e => set('startingSurah', e.target.value)}
                  className={errors.startingSurah ? 'error' : ''}>
                  <option value="">Select surah…</option>
                  {SURAH_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.startingSurah && <span className="reg-err">{errors.startingSurah}</span>}
              </div>

              <div className="reg-field reg-field-full">
                <label>Class Days <span className="req">*</span></label>
                <div className="reg-days-grid">
                  {DAYS.map(day => (
                    <label key={day} className={`reg-day-chip ${form.classDays.includes(day) ? 'selected' : ''}`}>
                      <input type="checkbox" hidden
                        checked={form.classDays.includes(day)} onChange={() => toggleDay(day)}/>
                      <span className="reg-day-short">{day.slice(0,3)}</span>
                      <span className="reg-day-full">{day}</span>
                    </label>
                  ))}
                </div>
                {errors.classDays && <span className="reg-err">{errors.classDays}</span>}
              </div>

              <div className="reg-field reg-field-full">
                <label>Teacher Notes</label>
                <textarea rows="3" placeholder="Any special notes about the student…"
                  value={form.teacherNotes} onChange={e => set('teacherNotes', e.target.value)}/>
              </div>
            </div>
          )}

          {/* ════ STEP 3 — REVIEW ════ */}
          {step === 3 && (
            <div className="reg-section">
              <div className="reg-section-title">
                <span className="reg-section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </span>
                Review & Confirm
              </div>

              <div className="reg-review-grid">
                <div className="reg-review-hero">
                  <div className="reg-review-avatar">
                    {photoPreview
                      ? <img src={photoPreview} alt={form.fullName}/>
                      : <span>{form.fullName ? form.fullName[0].toUpperCase() : '?'}</span>}
                  </div>
                  <div>
                    <h3 className="reg-review-name">{form.fullName}</h3>
                    {form.arabicName && <p className="reg-review-arabic" dir="rtl">{form.arabicName}</p>}
                    <span className={`reg-level-badge level-${form.level?.toLowerCase().replace(' ','')}`}>
                      {form.level}
                    </span>
                  </div>
                </div>

                <div className="reg-review-block">
                  <p className="reg-review-block-title">Personal</p>
                  <div className="reg-review-rows">
                    <ReviewRow label="Date of Birth" value={form.dateOfBirth}/>
                    <ReviewRow label="Gender"        value={form.gender}/>
                    <ReviewRow label="Phone"         value={form.phone}/>
                    <ReviewRow label="Email"         value={form.email || '—'}/>
                    <ReviewRow label="Address"       value={form.address || '—'}/>
                  </div>
                </div>

                <div className="reg-review-block">
                  <p className="reg-review-block-title">Guardian</p>
                  <div className="reg-review-rows">
                    <ReviewRow label="Parent Name"  value={form.parentName}/>
                    <ReviewRow label="Parent Phone" value={form.parentPhone}/>
                  </div>
                </div>

                <div className="reg-review-block">
                  <p className="reg-review-block-title">Academic</p>
                  <div className="reg-review-rows">
                    <ReviewRow label="Starting Surah" value={form.startingSurah}/>
                    <ReviewRow label="Starting Juz'"  value={form.startingJuz}/>
                    <ReviewRow label="Class Days"     value={form.classDays.join(', ')}/>
                    {form.teacherNotes && <ReviewRow label="Notes" value={form.teacherNotes}/>}
                  </div>
                </div>
              </div>

              <div className="reg-confirm-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Review all details before continuing to payment.
              </div>
            </div>
          )}

          {/* ── Nav buttons (steps 1-3) ── */}
          {step <= 3 && (
            <div className="reg-actions">
              {step > 1 && (
                <button type="button" className="reg-btn-secondary" onClick={prevStep}>← Back</button>
              )}
              <div className="reg-actions-right">
                {step < 3 && (
                  <button type="button" className="reg-btn-primary" onClick={nextStep}>Next Step →</button>
                )}
                {step === 3 && (
                  <button type="submit" className="reg-btn-primary">
                    Continue to Payment →
                  </button>
                )}
              </div>
            </div>
          )}
        </form>

        {/* ════ STEP 4 — PAYMENT ════ */}
        {step === 4 && (
          <div className="reg-section">
            <div className="reg-section-title">
              <span className="reg-section-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </span>
              Payment Registration
            </div>

            {/* Student recap */}
            <div className="pay-student-recap">
              <div className="pay-recap-avatar">
                {photoPreview
                  ? <img src={photoPreview} alt={form.fullName}/>
                  : <span>{form.fullName[0]?.toUpperCase()}</span>}
              </div>
              <div>
                <p className="pay-recap-name">{form.fullName}</p>
                <p className="pay-recap-sub">{form.level} · {form.startingJuz}</p>
              </div>
            </div>

            <div className="reg-grid-2">
              <div className="reg-field">
                <label>Amount (ETB) <span className="req">*</span></label>
                <input type="number" placeholder="e.g. 500" min="0"
                  value={payForm.amount} onChange={e => setPay('amount', e.target.value)}
                  className={payErrors.amount ? 'error' : ''}/>
                {payErrors.amount && <span className="reg-err">{payErrors.amount}</span>}
              </div>

              <div className="reg-field">
                <label>Payment Method <span className="req">*</span></label>
                <select value={payForm.method} onChange={e => setPay('method', e.target.value)}
                  className={payErrors.method ? 'error' : ''}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {payErrors.method && <span className="reg-err">{payErrors.method}</span>}
              </div>
            </div>

            <div className="reg-grid-2">
              <div className="reg-field">
                <label>For Month</label>
                <select value={payForm.month} onChange={e => setPay('month', e.target.value)}>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="reg-field">
                <label>Year</label>
                <input type="number" value={payForm.year} min="2020" max="2100"
                  onChange={e => setPay('year', e.target.value)}/>
              </div>
            </div>

            <div className="reg-field reg-field-full">
              <label>Note (optional)</label>
              <input type="text" placeholder="e.g. First month fee"
                value={payForm.note} onChange={e => setPay('note', e.target.value)}/>
            </div>

            <div className="reg-actions">
              <button type="button" className="reg-btn-secondary" onClick={() => setStep(3)}>← Back</button>
              <div className="reg-actions-right" style={{ display:'flex', gap:'12px' }}>
                <button type="button" className="reg-btn-skip" onClick={handleSkip}>
                  Skip Payment
                </button>
                <button type="button" className="reg-btn-submit" onClick={handlePaySubmit}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Register &amp; Save Payment
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="reg-review-row">
      <span className="reg-review-label">{label}</span>
      <span className="reg-review-value">{value}</span>
    </div>
  )
}
