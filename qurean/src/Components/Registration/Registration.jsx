import { useState } from 'react'
import { useStudents } from '../../context/StudentsContext'
import { useNavigate } from 'react-router-dom'
import './Registration.css'

// ── Field options ──────────────────────────────────────────
const JUZZ_OPTIONS  = Array.from({ length: 30 }, (_, i) => `Juz' ${i + 1}`)
const SURAH_OPTIONS = [
  'Al-Fatiha','Al-Baqarah','Al-Imran','An-Nisa','Al-Maidah',
  'Al-Anam','Al-Araf','Al-Anfal','At-Tawbah','Yunus',
  'Hud','Yusuf',"Ar-Ra'd",'Ibrahim','Al-Hijr',
  'An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha',
]
const CLASS_LEVELS  = ['1','2','3','4','5','6','7','8','9','10','11','12']
const HIZ_LEVELS    = ['Beginner','Intermediate','Advanced','Hafiz Track']
const GENDERS       = ['ወንድ (Male)','ሴት (Female)']
const DAYS          = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const PAYMENT_METHODS = ['Cash','Bank Transfer','Mobile Money']
const MONTHS        = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December']
const TRANSPORT_OPT = ['Yes — ትራንስፖርት አለ','No — ትራንስፖርት የለም']

// ── Initial state ──────────────────────────────────────────
const INITIAL = {
  // Step 1 — Personal (from Amharic form)
  fullName: '',          // የተማሪ ስም አስከ አያት
  gender: '',            // ፆታ
  age: '',               // ዕድሜ
  placeOfBirth: '',      // የመጠ-ቦት ስፈ.ር
  classLevel: '',        // የክፍል ደረጃ
  hizLevel: '',          // የቤርዐት ደረጃ (Hifz level)
  parent1Name: '',       // የወላጅ ስም 1
  parent1Phone: '',      // የወላጅ ስልክ 1
  parent2Name: '',       // የወላጅ ስም 2
  parent2Phone: '',      // የወላጅ ስልክ 2
  monthlyFee: '',        // የወርሀዊ ክፍያ
  studentArea: '',       // የተማሪዉ ጥሩ ቦታ (kebele/area)
  correctionArea: '',    // የተማሪዉ የሚስተካከል ቦታ
  specialNeeds: '',      // የተለየ ኒዝ ካለዉ
  transport: '',         // ትራንስፖርት
  photo: null,
  // Step 2 — Academic
  startingSurah: '',
  startingJuz: '',
  classDays: [],
  teacherNotes: '',
}

const PAY_INITIAL = {
  amount: '', method: 'Cash',
  month: MONTHS[new Date().getMonth()],
  year: String(new Date().getFullYear()),
  note: '',
}

// ── Component ──────────────────────────────────────────────
export default function Registration() {
  const { addStudent, addPayment } = useStudents()
  const navigate = useNavigate()

  const [form, setForm]                 = useState(INITIAL)
  const [errors, setErrors]             = useState({})
  const [photoPreview, setPhotoPreview] = useState(null)
  const [step, setStep]                 = useState(1)
  const [payForm, setPayForm]           = useState(PAY_INITIAL)
  const [payErrors, setPayErrors]       = useState({})
  const [done, setDone]                 = useState(false)
  const [skipPay, setSkipPay]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [saveError, setSaveError]       = useState(null)

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

  // ── Validation ─────────────────────────────────────────
  const validate = (s) => {
    const e = {}
    if (s === 1) {
      if (!form.fullName.trim())    e.fullName    = 'ስም ያስፈልጋል / Full name required'
      if (!form.gender)             e.gender      = 'ፆታ ይምረጡ / Select gender'
      if (!form.age.toString().trim())            e.age         = 'ዕድሜ ያስፈልጋል / Age required'
      if (!form.parent1Name.trim())               e.parent1Name = 'የወላጅ ስም ያስፈልጋል / Parent name required'
      if (!form.parent1Phone.trim())              e.parent1Phone= 'የወላጅ ስልክ ያስፈልጋል / Parent phone required'
      if (!form.monthlyFee.toString().trim())     e.monthlyFee  = 'የወርሀዊ ክፍያ ያስፈልጋል / Monthly fee required'
    }
    if (s === 2) {
      if (!form.hizLevel)                  e.hizLevel    = 'Select Hifz level'
      if (!form.startingSurah)             e.startingSurah = 'Select starting surah'
      if (!form.startingJuz)               e.startingJuz = "Select starting juz'"
      if (form.classDays.length === 0)     e.classDays   = 'Select at least one class day'
    }
    return e
  }

  const validatePay = () => {
    const e = {}
    if (!payForm.amount || isNaN(payForm.amount) || Number(payForm.amount) <= 0)
      e.amount = 'Enter a valid amount'
    return e
  }

  const nextStep = () => {
    const e = validate(step)
    if (Object.keys(e).length) { setErrors(e); return }
    setStep(s => s + 1)
  }
  const prevStep = () => setStep(s => s - 1)

  const handleRegister = (e) => {
    e.preventDefault()
    const e2 = validate(2)
    if (Object.keys(e2).length) { setErrors(e2); setStep(2); return }
    setStep(4)
  }

  const handlePaySubmit = async () => {
    const e = validatePay()
    if (Object.keys(e).length) { setPayErrors(e); return }
    setSaving(true)
    setSaveError(null)
    try {
      const studentId = await addStudent({ ...form })
      await addPayment({
        studentId,
        studentName: form.fullName,
        amount: Number(payForm.amount),
        method: payForm.method,
        month:  payForm.month,
        year:   payForm.year,
        note:   payForm.note,
      })
      setDone(true)
    } catch (err) {
      setSaveError(err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await addStudent({ ...form })
      setSkipPay(true)
      setDone(true)
    } catch (err) {
      setSaveError(err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setForm(INITIAL); setPayForm(PAY_INITIAL)
    setErrors({}); setPayErrors({})
    setPhotoPreview(null); setStep(1)
    setDone(false); setSkipPay(false)
  }

  const STEP_LABELS = ['Personal Info','Academic Info','Review','Payment']

  // ── Success screen ─────────────────────────────────────
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
              Payment of <strong>{Number(payForm.amount).toLocaleString()} ETB</strong> via <strong>{payForm.method}</strong>
            </p>
          )}
          {skipPay && <p className="reg-success-sub reg-success-warn">⚠️ No payment recorded yet</p>}
          <div className="reg-success-actions">
            <button className="reg-btn-primary" onClick={handleReset}>Register Another Student</button>
            <button className="reg-btn-secondary" onClick={() => navigate('/dashboard/students')}>View Students List</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────
  return (
    <div className="reg-root">
      {/* Header */}
      <div className="reg-header">
        <div className="reg-header-left">
          <p className="reg-eyebrow">የቁርአን ትምህርት ፕሮግራም · القرآن الكريم</p>
          <h1 className="reg-title">Student Registration</h1>
          <p className="reg-subtitle">የቁርአን ትምህርት ፕሮግራም መመዝገቢያ ቅፅ</p>
        </div>
        <div className="reg-header-right">
          <div className="reg-step-pills">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className={`reg-step-pill ${step===i+1?'active':step>i+1?'done':''}`}>
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

      {/* Card */}
      <div className="reg-card">
        <div className="reg-arch">
          <svg viewBox="0 0 600 28" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 28 Q150 0 300 0 Q450 0 600 28" fill="none" stroke="#D4AF37" strokeWidth="1.5"/>
            <circle cx="300" cy="0" r="5" fill="#D4AF37"/>
            <circle cx="0" cy="28" r="3" fill="rgba(212,175,55,0.35)"/>
            <circle cx="600" cy="28" r="3" fill="rgba(212,175,55,0.35)"/>
          </svg>
        </div>

        <form onSubmit={handleRegister} noValidate>

          {/* ════ STEP 1 — PERSONAL (Amharic form fields) ════ */}
          {step === 1 && (
            <div className="reg-section">
              <div className="reg-section-title">
                <span className="reg-section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </span>
                Personal Information — የግል መረጃ
              </div>

              {/* Photo */}
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
                      </div>}
                  <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} hidden/>
                </label>
                <div className="reg-photo-hint">
                  <p>የተማሪ ፎቶ / Student photo</p>
                  <p>JPG or PNG, max 2MB</p>
                </div>
              </div>

              {/* የተማሪ ስም አስከ አያት — Full name to grandfather */}
              <div className="reg-field reg-field-full">
                <label>የተማሪ ስም አስከ አያት <span className="req">*</span>
                  <span className="reg-label-sub"> (Student Full Name)</span>
                </label>
                <input type="text" placeholder="ስም / አባት ስም / አያት ስም"
                  value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  className={errors.fullName ? 'error' : ''}/>
                {errors.fullName && <span className="reg-err">{errors.fullName}</span>}
              </div>

              {/* ፆታ / ዕድሜ */}
              <div className="reg-grid-2">
                <div className="reg-field">
                  <label>ፆታ <span className="req">*</span>
                    <span className="reg-label-sub"> (Gender)</span>
                  </label>
                  <div className="reg-radio-group">
                    {GENDERS.map(g => (
                      <label key={g} className={`reg-radio ${form.gender===g?'selected':''}`}>
                        <input type="radio" name="gender" value={g}
                          checked={form.gender===g} onChange={() => set('gender',g)} hidden/>
                        {g.includes('ወንድ') ? '👦' : '👧'} {g}
                      </label>
                    ))}
                  </div>
                  {errors.gender && <span className="reg-err">{errors.gender}</span>}
                </div>
                <div className="reg-field">
                  <label>ዕድሜ <span className="req">*</span>
                    <span className="reg-label-sub"> (Age)</span>
                  </label>
                  <input type="number" placeholder="e.g. 12" min="3" max="80"
                    value={form.age} onChange={e => set('age', e.target.value)}
                    className={errors.age ? 'error' : ''}/>
                  {errors.age && <span className="reg-err">{errors.age}</span>}
                </div>
              </div>

              {/* የመጠበት-ስፈር */}
              <div className="reg-field reg-field-full">
                <label>የመጠበት-ስፈር
                  <span className="reg-label-sub"> (Place of Birth / Home Address)</span>
                </label>
                <input type="text" placeholder="ከተማ / ሰፈር"
                  value={form.placeOfBirth} onChange={e => set('placeOfBirth', e.target.value)}/>
              </div>

              {/* Class level / Hifz level */}
              <div className="reg-grid-2">
                <div className="reg-field">
                  <label>የክፍል ደረጃ
                    <span className="reg-label-sub"> (Class/Grade Level)</span>
                  </label>
                  <select value={form.classLevel} onChange={e => set('classLevel', e.target.value)}>
                    <option value="">ክፍል ይምረጡ…</option>
                    {CLASS_LEVELS.map(l => <option key={l} value={l}>ክፍል {l}</option>)}
                  </select>
                </div>
                <div className="reg-field">
                  <label>Hifz ደረጃ <span className="req">*</span>
                    <span className="reg-label-sub"> (Hifz Level)</span>
                  </label>
                  <select value={form.hizLevel} onChange={e => set('hizLevel', e.target.value)}
                    className={errors.hizLevel ? 'error' : ''}>
                    <option value="">ደረጃ ይምረጡ…</option>
                    {HIZ_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.hizLevel && <span className="reg-err">{errors.hizLevel}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Continue step 1 — Parents & fees */}
          {step === 1 && (
            <div className="reg-section" style={{paddingTop:0}}>

              {/* Parents 1 & 2 */}
              <div className="reg-section-subtitle">
                የወላጅ ስም እና ስልክ ቁጥር — Parent Names &amp; Phones
              </div>

              <div className="reg-grid-2">
                <div className="reg-field">
                  <label>1. የወላጅ ስም <span className="req">*</span>
                    <span className="reg-label-sub"> (Parent 1 Name)</span>
                  </label>
                  <input type="text" placeholder="የወላጅ/አሳዳጊ ሙሉ ስም"
                    value={form.parent1Name} onChange={e => set('parent1Name', e.target.value)}
                    className={errors.parent1Name ? 'error' : ''}/>
                  {errors.parent1Name && <span className="reg-err">{errors.parent1Name}</span>}
                </div>
                <div className="reg-field">
                  <label>1. ስልክ ቁጥር <span className="req">*</span>
                    <span className="reg-label-sub"> (Phone 1)</span>
                  </label>
                  <input type="tel" placeholder="+251 9XX XXX XXX"
                    value={form.parent1Phone} onChange={e => set('parent1Phone', e.target.value)}
                    className={errors.parent1Phone ? 'error' : ''}/>
                  {errors.parent1Phone && <span className="reg-err">{errors.parent1Phone}</span>}
                </div>
              </div>

              <div className="reg-grid-2">
                <div className="reg-field">
                  <label>2. የወላጅ ስም
                    <span className="reg-label-sub"> (Parent 2 Name)</span>
                  </label>
                  <input type="text" placeholder="ሁለተኛ ወላጅ/አሳዳጊ ስም (አማራጭ)"
                    value={form.parent2Name} onChange={e => set('parent2Name', e.target.value)}/>
                </div>
                <div className="reg-field">
                  <label>2. ስልክ ቁጥር
                    <span className="reg-label-sub"> (Phone 2)</span>
                  </label>
                  <input type="tel" placeholder="+251 9.. ... XXX"
                    value={form.parent2Phone} onChange={e => set('parent2Phone', e.target.value)}/>
                </div>
              </div>

              {/* Monthly fee */}
              <div className="reg-field reg-field-full">
                <label>የወርሀዊ ክፍያ <span className="req">*</span>
                  <span className="reg-label-sub"> (Monthly Fee — ETB)</span>
                </label>
                <input type="number" placeholder="e.g. 300" min="0"
                  value={form.monthlyFee} onChange={e => set('monthlyFee', e.target.value)}
                  className={errors.monthlyFee ? 'error' : ''}/>
                {errors.monthlyFee && <span className="reg-err">{errors.monthlyFee}</span>}
              </div>

              {/* Student area / correction area */}
              <div className="reg-grid-2">
                <div className="reg-field">
                  <label>የተማሪው ጥሩ ሥነ ምግባር
                    <span className="reg-label-sub"> (Student Behaviour / Goob Behaviour)</span>
                  </label>
                  <input type="text" placeholder="ጥሩ ሥነ ምግባር"
                    value={form.studentArea} onChange={e => set('studentArea', e.target.value)}/>
                </div>
                <div className="reg-field">
                  <label>የተማሪው የሚሻሻል ሥነ ምግባር
                    <span className="reg-label-sub"> (Correction/Bad Behaviour)</span>
                  </label>
                  <input type="text" placeholder="የሚሻሻል ሥነ ምግባር"
                    value={form.correctionArea} onChange={e => set('correctionArea', e.target.value)}/>
                </div>
              </div>

              {/* Special needs */}
              <div className="reg-field reg-field-full">
                <label>የተለየ ፍላጎት
                  <span className="reg-label-sub"> (Special Needs, if any)</span>
                </label>
                <input type="text" placeholder="ካለ ያብራሩ…"
                  value={form.specialNeeds} onChange={e => set('specialNeeds', e.target.value)}/>
              </div>

              {/* Transport */}
              <div className="reg-field reg-field-full">
                <label>ትራንስፖርት
                  <span className="reg-label-sub"> (Transport)</span>
                </label>
                <div className="reg-radio-group">
                  {TRANSPORT_OPT.map(t => (
                    <label key={t} className={`reg-radio ${form.transport===t?'selected':''}`}>
                      <input type="radio" name="transport" value={t}
                        checked={form.transport===t} onChange={() => set('transport',t)} hidden/>
                      {t}
                    </label>
                  ))}
                </div>
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
                Academic Information — የትምህርት መረጃ
              </div>

              <div className="reg-grid-2">
                <div className="reg-field">
                  <label>Starting Juz' <span className="req">*</span></label>
                  <select value={form.startingJuz} onChange={e => set('startingJuz', e.target.value)}
                    className={errors.startingJuz ? 'error' : ''}>
                    <option value="">Select Juz'…</option>
                    {JUZZ_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                  {errors.startingJuz && <span className="reg-err">{errors.startingJuz}</span>}
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
              </div>

              <div className="reg-field reg-field-full">
                <label>Class Days <span className="req">*</span></label>
                <div className="reg-days-grid">
                  {DAYS.map(day => (
                    <label key={day} className={`reg-day-chip ${form.classDays.includes(day)?'selected':''}`}>
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
                <label>Teacher Notes — የመምህር ማስታወሻ</label>
                <textarea rows="3" placeholder="Any notes about the student…"
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
                  </svg>
                </span>
                Review &amp; Confirm — ማረጋገጫ
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
                    <span className={`reg-level-badge`}>{form.hizLevel}</span>
                  </div>
                </div>

                <div className="reg-review-block">
                  <p className="reg-review-block-title">Personal — የግል</p>
                  <div className="reg-review-rows">
                    <ReviewRow label="ፆታ / Gender"         value={form.gender}/>
                    <ReviewRow label="ዕድሜ / Age"            value={form.age}/>
                    <ReviewRow label="የመጠ-ቦት ስፈ.ር"         value={form.placeOfBirth || '—'}/>
                    <ReviewRow label="የክፍል ደረጃ"            value={form.classLevel || '—'}/>
                    <ReviewRow label="የቤርዐት ደረጃ"           value={form.hizLevel}/>
                    <ReviewRow label="ቦታ / Area"            value={form.studentArea || '—'}/>
                    <ReviewRow label="ትራንስፖርት"             value={form.transport || '—'}/>
                    {form.specialNeeds && <ReviewRow label="ልዩ ፍላጎት" value={form.specialNeeds}/>}
                  </div>
                </div>

                <div className="reg-review-block">
                  <p className="reg-review-block-title">Parents — ወላጆች</p>
                  <div className="reg-review-rows">
                    <ReviewRow label="ወላጅ 1" value={`${form.parent1Name} · ${form.parent1Phone}`}/>
                    {form.parent2Name && <ReviewRow label="ወላጅ 2" value={`${form.parent2Name} · ${form.parent2Phone}`}/>}
                    <ReviewRow label="የወርሀዊ ክፍያ" value={`${Number(form.monthlyFee).toLocaleString()} ETB`}/>
                  </div>
                </div>

                <div className="reg-review-block">
                  <p className="reg-review-block-title">Academic — ትምህርት</p>
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

          {/* Nav buttons steps 1-3 */}
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
                  <button type="submit" className="reg-btn-primary">Continue to Payment →</button>
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
              Payment Registration — የወርሀዊ ክፍያ
            </div>

            <div className="pay-student-recap">
              <div className="pay-recap-avatar">
                {photoPreview
                  ? <img src={photoPreview} alt={form.fullName}/>
                  : <span>{form.fullName[0]?.toUpperCase()}</span>}
              </div>
              <div>
                <p className="pay-recap-name">{form.fullName}</p>
                <p className="pay-recap-sub">{form.hizLevel} · Monthly: {Number(form.monthlyFee).toLocaleString()} ETB</p>
              </div>
            </div>

            <div className="reg-grid-2">
              <div className="reg-field">
                <label>Amount (ETB) <span className="req">*</span></label>
                <input type="number" placeholder={`e.g. ${form.monthlyFee || '500'}`} min="0"
                  value={payForm.amount} onChange={e => setPay('amount', e.target.value)}
                  className={payErrors.amount ? 'error' : ''}/>
                {payErrors.amount && <span className="reg-err">{payErrors.amount}</span>}
              </div>
              <div className="reg-field">
                <label>Payment Method <span className="req">*</span></label>
                <select value={payForm.method} onChange={e => setPay('method', e.target.value)}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
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
                {saveError && (
                  <p className="reg-save-error">⚠️ {saveError}</p>
                )}
                <button type="button" className="reg-btn-skip"
                  onClick={handleSkip} disabled={saving}>
                  {saving ? 'Saving…' : 'Skip Payment'}
                </button>
                <button type="button" className="reg-btn-submit"
                  onClick={handlePaySubmit} disabled={saving}>
                  {saving ? (
                    <>
                      <span className="reg-spinner"/> Saving…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Register &amp; Save Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Helper ─────────────────────────────────────────────────
function ReviewRow({ label, value }) {
  return (
    <div className="reg-review-row">
      <span className="reg-review-label">{label}</span>
      <span className="reg-review-value">{value}</span>
    </div>
  )
}
