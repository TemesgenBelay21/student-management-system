import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

export default function Students() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    admissionNumber: '', fullName: '', dateOfBirth: '', gender: '',
    guardianName: '', guardianPhone: '', address: '', schoolClass: null
  })
  const [error, setError] = useState('')
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [studentAttendanceHistory, setStudentAttendanceHistory] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)

  const loadData = async () => {
    const [studentsRes, classesRes] = await Promise.all([
      api.get('/students'),
      api.get('/classes')
    ])
    setStudents(studentsRes.data)
    setClasses(classesRes.data)
  }

  useEffect(() => { loadData() }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleClassChange = (e) => {
    const classId = e.target.value
    setForm({ ...form, schoolClass: classId ? { id: Number(classId) } : null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/students', form)
      setShowForm(false)
      setForm({ admissionNumber: '', fullName: '', dateOfBirth: '', gender: '', guardianName: '', guardianPhone: '', address: '', schoolClass: null })
      loadData()
    } catch (err) {
      setError(err.response?.data || 'Failed to add student')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return
    await api.delete(`/students/${id}`)
    loadData()
  }

  const handleViewAttendance = async (student) => {
    setSelectedStudent(student)
    try {
      const res = await api.get(`/attendance/student/${student.id}`)
      setStudentAttendanceHistory(res.data)
      setShowAttendanceModal(true)
    } catch (err) {
      console.error(err)
      alert('Failed to load attendance history')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Students</h1>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Student'}
          </button>
        </div>

        {showForm && (
          <form className="inline-form" onSubmit={handleSubmit}>
            {error && <div className="error-banner">{JSON.stringify(error)}</div>}
            <div className="form-row">
              <input name="admissionNumber" placeholder="Admission Number" value={form.admissionNumber} onChange={handleChange} required />
              <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-row">
              <input name="guardianName" placeholder="Guardian Name" value={form.guardianName} onChange={handleChange} />
              <input name="guardianPhone" placeholder="Guardian Phone" value={form.guardianPhone} onChange={handleChange} />
            </div>
            <div className="form-row">
              <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
              <select onChange={handleClassChange} defaultValue="">
                <option value="">Assign Class (optional)</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary">Save Student</button>
          </form>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>#</th><th>Admission No.</th><th>Name</th><th>Class</th><th>Guardian</th><th>Balance</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.admissionNumber}</td>
                <td>{s.fullName}</td>
                <td>{s.schoolClass?.name || '—'}</td>
                <td>{s.guardianName || '—'}</td>
                <td>${s.balance || 0}</td>
                <td><span className={`badge ${s.active ? 'badge-green' : 'badge-red'}`}>{s.active ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <button className="btn-secondary" onClick={() => handleViewAttendance(s)} style={{marginRight: '10px', padding: '4px 8px', fontSize: '0.85rem'}}>Attendance</button>
                  <button className="btn-delete" onClick={() => handleDelete(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAttendanceModal && selectedStudent && (
          <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div className="modal-content" style={{background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto'}}>
              <h2>Attendance History - {selectedStudent.fullName}</h2>
              <button onClick={() => setShowAttendanceModal(false)} style={{float: 'right', marginBottom: '10px'}}>Close</button>
              
              {studentAttendanceHistory.length === 0 ? (
                <p>No attendance records found.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentAttendanceHistory.map(record => (
                      <tr key={record.id}>
                        <td>{record.date}</td>
                        <td>{record.status}</td>
                        <td>{record.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
