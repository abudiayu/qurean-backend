import { createContext, useContext, useState } from 'react'

const StudentsContext = createContext(null)

export function StudentsProvider({ children }) {
  const [students, setStudents] = useState([])       // list of registered students
  const [payments, setPayments] = useState([])        // list of payment records

  const addStudent = (student) => {
    const id = Date.now().toString()
    setStudents(prev => [...prev, { ...student, id, registeredAt: new Date().toISOString() }])
    return id
  }

  const addPayment = (payment) => {
    setPayments(prev => [
      ...prev,
      { ...payment, id: Date.now().toString(), paidAt: new Date().toISOString() }
    ])
  }

  const getStudentPayments = (studentId) =>
    payments.filter(p => p.studentId === studentId)

  return (
    <StudentsContext.Provider value={{ students, payments, addStudent, addPayment, getStudentPayments }}>
      {children}
    </StudentsContext.Provider>
  )
}

export const useStudents = () => useContext(StudentsContext)
