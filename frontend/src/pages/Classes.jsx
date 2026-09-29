import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', section: '', classTeacher: null })

  const loadData = async () => {
    const [classesRes, teachersRes] = await Promise.all([
      api.get('/classes'),
      api.get('/teachers')
    ])
    setClasses(classesRes.data)
    setTeachers(teachersRes.data)
  }

  useEffect(() => { loadData() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleTeacherChange = (e) => {
    const id = e.target.value
    setForm({ ...form, classTeacher: id ? { id: Number(id) } : null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/classes', form)
    setShowForm(false)
    setForm({ name: '', section: '', classTeacher: null })
    loadData()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this class?')) return
    await api.delete(`/classes/${id}`)
    loadData()
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Classes</h1>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Class'}
          </button>
        </div>

        {showForm && (
          <form className="inline-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input name="name" placeholder="Class Name (e.g. Grade 9)" value={form.name} onChange={handleChange} required />
              <input name="section" placeholder="Section (e.g. A)" value={form.section} onChange={handleChange} />
            </div>
            <div className="form-row">
              <select onChange={handleTeacherChange} defaultValue="">
                <option value="">Assign Class Teacher (optional)</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary">Save Class</button>
          </form>
        )}

        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Class Name</th><th>Section</th><th>Class Teacher</th><th>Action</th></tr>
          </thead>
          <tbody>
            {classes.map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td>
                <td>{c.name}</td>
                <td>{c.section || '—'}</td>
                <td>{c.classTeacher?.fullName || '—'}</td>
                <td><button className="btn-delete" onClick={() => handleDelete(c.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  )
}
