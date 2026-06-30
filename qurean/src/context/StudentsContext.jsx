/**
 * StudentsContext.jsx
 *
 * Replaces the old in-memory state with real Supabase calls.
 * Every add/update/delete writes directly to the database.
 * Realtime subscriptions keep the UI in sync automatically.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const StudentsContext = createContext(null)

// ── helpers: map camelCase form fields ↔ snake_case DB columns ──────────────

function toDbStudent(form) {
  return {
    full_name:       form.fullName,
    gender:          form.gender,
    age:             Number(form.age),
    place_of_birth:  form.placeOfBirth  || null,
    class_level:     form.classLevel    || null,
    hiz_level:       form.hizLevel,
    parent1_name:    form.parent1Name,
    parent1_phone:   form.parent1Phone,
    parent2_name:    form.parent2Name   || null,
    parent2_phone:   form.parent2Phone  || null,
    monthly_fee:     Number(form.monthlyFee) || 0,
    student_area:    form.studentArea   || null,
    correction_area: form.correctionArea || null,
    special_needs:   form.specialNeeds  || null,
    transport:       form.transport     || null,
    starting_surah:  form.startingSurah || null,
    starting_juz:    form.startingJuz   || null,
    class_days:      form.classDays     || [],
    teacher_notes:   form.teacherNotes  || null,
    photo_url:       form.photoUrl      || null,
  }
}

function fromDbStudent(row) {
  return {
    id:              row.id,
    fullName:        row.full_name,
    gender:          row.gender,
    age:             row.age,
    placeOfBirth:    row.place_of_birth,
    classLevel:      row.class_level,
    hizLevel:        row.hiz_level,
    parent1Name:     row.parent1_name,
    parent1Phone:    row.parent1_phone,
    parent2Name:     row.parent2_name,
    parent2Phone:    row.parent2_phone,
    monthlyFee:      row.monthly_fee,
    studentArea:     row.student_area,
    correctionArea:  row.correction_area,
    specialNeeds:    row.special_needs,
    transport:       row.transport,
    startingSurah:   row.starting_surah,
    startingJuz:     row.starting_juz,
    classDays:       row.class_days || [],
    teacherNotes:    row.teacher_notes,
    photoUrl:        row.photo_url,
    photoPreview:    row.photo_url,   // used by existing UI
    registeredAt:    row.registered_at,
  }
}

function toDbPayment(payment) {
  return {
    student_id:   payment.studentId,
    student_name: payment.studentName,
    amount:       Number(payment.amount),
    method:       payment.method,
    month:        payment.month,
    year:         payment.year,
    note:         payment.note || null,
  }
}

function fromDbPayment(row) {
  return {
    id:          row.id,
    studentId:   row.student_id,
    studentName: row.student_name,
    amount:      row.amount,
    method:      row.method,
    month:       row.month,
    year:        row.year,
    note:        row.note,
    paidAt:      row.paid_at,
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function StudentsProvider({ children }) {
  const [students,  setStudents]  = useState([])
  const [payments,  setPayments]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // ── Initial load ──────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ data: sData, error: sErr }, { data: pData, error: pErr }] =
        await Promise.all([
          supabase.from('students').select('*').order('registered_at', { ascending: false }),
          supabase.from('payments').select('*').order('paid_at',       { ascending: false }),
        ])

      if (sErr) throw sErr
      if (pErr) throw pErr

      setStudents((sData || []).map(fromDbStudent))
      setPayments((pData || []).map(fromDbPayment))
    } catch (err) {
      console.error('[StudentsContext] load error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    const studentChannel = supabase
      .channel('realtime-students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, loadAll)
      .subscribe()

    const paymentChannel = supabase
      .channel('realtime-payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, loadAll)
      .subscribe()

    return () => {
      supabase.removeChannel(studentChannel)
      supabase.removeChannel(paymentChannel)
    }
  }, [loadAll])

  // ── Photo upload ──────────────────────────────────────────────────────────
  const uploadPhoto = async (file, studentId) => {
    if (!file) return null
    const ext  = file.name.split('.').pop()
    const path = `students/${studentId}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('student-photos')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (upErr) throw upErr

    const { data } = supabase.storage.from('student-photos').getPublicUrl(path)
    return data.publicUrl
  }

  // ── addStudent ────────────────────────────────────────────────────────────
  const addStudent = async (formData) => {
    try {
      // 1. Insert student row (no photo_url yet)
      const dbRow = toDbStudent({ ...formData, photoUrl: null })
      const { data, error: insErr } = await supabase
        .from('students')
        .insert(dbRow)
        .select()
        .single()

      if (insErr) throw insErr

      // 2. Upload photo if provided
      let photoUrl = null
      if (formData.photo instanceof File) {
        photoUrl = await uploadPhoto(formData.photo, data.id)
        // 3. Update row with the photo URL
        await supabase.from('students').update({ photo_url: photoUrl }).eq('id', data.id)
      }

      const student = fromDbStudent({ ...data, photo_url: photoUrl })
      setStudents(prev => [student, ...prev])
      return student.id

    } catch (err) {
      console.error('[addStudent]', err.message)
      throw err
    }
  }

  // ── addPayment ────────────────────────────────────────────────────────────
  const addPayment = async (paymentData) => {
    try {
      const { data, error: insErr } = await supabase
        .from('payments')
        .insert(toDbPayment(paymentData))
        .select()
        .single()

      if (insErr) throw insErr

      const payment = fromDbPayment(data)
      setPayments(prev => [payment, ...prev])
      return payment.id

    } catch (err) {
      console.error('[addPayment]', err.message)
      throw err
    }
  }

  // ── getStudentPayments ────────────────────────────────────────────────────
  const getStudentPayments = (studentId) =>
    payments.filter(p => p.studentId === studentId)

  return (
    <StudentsContext.Provider value={{
      students, payments, loading, error,
      addStudent, addPayment, getStudentPayments,
      reload: loadAll,
    }}>
      {children}
    </StudentsContext.Provider>
  )
}

export const useStudents = () => useContext(StudentsContext)
