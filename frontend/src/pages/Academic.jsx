import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

export default function Academic() {
  const [subjects, setSubjects] = useState([])
  const [exams, setExams] = useState([])
  const [students, setStudents] = useState([])

  const [newSubject, setNewSubject] = useState({ name: '', code: '' })
  const [newExam, setNewExam] = useState({ name: '', term: '', examDate: '' })

  const [gradeForm, setGradeForm] = useState({ studentId: '', subjectId: '', examId: '', marks: '', letterGrade: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [subRes, examRes, stuRes] = await Promise.all([
        api.get('/academic/subjects'),
        api.get('/academic/exams'),
        api.get('/students')
      ])
      setSubjects(subRes.data)
      setExams(examRes.data)
      setStudents(stuRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddSubject = async (e) => {
    e.preventDefault()
    await api.post('/academic/subjects', newSubject)
    setNewSubject({ name: '', code: '' })
    loadData()
  }

  const handleAddExam = async (e) => {
    e.preventDefault()
    await api.post('/academic/exams', newExam)
    setNewExam({ name: '', term: '', examDate: '' })
    loadData()
  }

  const handleRecordGrade = async (e) => {
    e.preventDefault()
    try {
      await api.post('/academic/grades', gradeForm)
      alert('Grade saved!')
      setGradeForm({ ...gradeForm, marks: '', letterGrade: '' })
    } catch (err) {
      alert('Failed to save grade')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <h1>Academic Records</h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          
          <div className="form-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3>Add Subject</h3>
            <form onSubmit={handleAddSubject} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input placeholder="Subject Name (e.g. Mathematics)" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} required className="form-control" />
              <input placeholder="Subject Code (e.g. MATH101)" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} required className="form-control" />
              <button type="submit" className="btn-primary">Add Subject</button>
            </form>
            <ul style={{ marginTop: '15px' }}>
              {subjects.map(s => <li key={s.id}>{s.name} ({s.code})</li>)}
            </ul>
          </div>

          <div className="form-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3>Add Exam</h3>
            <form onSubmit={handleAddExam} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input placeholder="Exam Name (e.g. Midterm)" value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} required className="form-control" />
              <input placeholder="Term (e.g. Fall 2024)" value={newExam.term} onChange={e => setNewExam({...newExam, term: e.target.value})} required className="form-control" />
              <input type="date" value={newExam.examDate} onChange={e => setNewExam({...newExam, examDate: e.target.value})} required className="form-control" />
              <button type="submit" className="btn-primary">Add Exam</button>
            </form>
            <ul style={{ marginTop: '15px' }}>
              {exams.map(ex => <li key={ex.id}>{ex.name} - {ex.term}</li>)}
            </ul>
          </div>
        </div>

        <div className="form-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3>Record Grade</h3>
          <form onSubmit={handleRecordGrade} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
            <select value={gradeForm.studentId} onChange={e => setGradeForm({...gradeForm, studentId: e.target.value})} required className="form-control">
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.admissionNumber})</option>)}
            </select>

            <select value={gradeForm.subjectId} onChange={e => setGradeForm({...gradeForm, subjectId: e.target.value})} required className="form-control">
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select value={gradeForm.examId} onChange={e => setGradeForm({...gradeForm, examId: e.target.value})} required className="form-control">
              <option value="">Select Exam</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>

            <input type="number" step="0.1" placeholder="Marks" value={gradeForm.marks} onChange={e => setGradeForm({...gradeForm, marks: e.target.value})} required className="form-control" />
            <input placeholder="Letter Grade (optional)" value={gradeForm.letterGrade} onChange={e => setGradeForm({...gradeForm, letterGrade: e.target.value})} className="form-control" />

            <button type="submit" className="btn-primary">Save Grade</button>
          </form>
        </div>

      </main>
    </div>
  )
}
