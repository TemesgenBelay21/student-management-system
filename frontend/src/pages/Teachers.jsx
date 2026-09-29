import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', subjectSpecialty: '' })
  const [error, setError] = useState('')

  const loadData = async () => {
    const res = await api.get('/teachers')
    setTeachers(res.data)
  }

  useEffect(() => { loadData() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/teachers', form)
      setShowForm(false)
      setForm({ fullName: '', email: '', phone: '', subjectSpecialty: '' })
      loadData()
    } catch (err) {
      setError(err.response?.data || 'Failed to add teacher')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this teacher?')) return
    await api.delete(`/teachers/${id}`)
    loadData()
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Teachers</h1>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Teacher'}
          </button>
        </div>

        {showForm && (
          <form className="inline-form" onSubmit={handleSubmit}>
            {error && <div className="error-banner">{JSON.stringify(error)}</div>}
            <div className="form-row">
              <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
              <input name="subjectSpecialty" placeholder="Subject Specialty" value={form.subjectSpecialty} onChange={handleChange} />
            </div>
            <button type="submit" className="btn-primary">Save Teacher</button>
          </form>
        )}

        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Subject</th><th>Action</th></tr>
          </thead>
          <tbody>
            {teachers.map((t, i) => (
              <tr key={t.id}>
                <td>{i + 1}</td>
                <td>{t.fullName}</td>
                <td>{t.email}</td>
                <td>{t.phone || '—'}</td>
                <td>{t.subjectSpecialty || '—'}</td>
                <td><button className="btn-delete" onClick={() => handleDelete(t.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  )
}
