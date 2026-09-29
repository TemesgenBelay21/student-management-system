import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

export default function ParentPortal() {
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  
  // Since we don't have a full parent auth role setup in backend yet, we mock fetching students
  // In a real app, you'd fetch `/api/parents/my-children` based on logged in Parent ID.
  useEffect(() => {
    api.get('/students').then(res => {
      setChildren(res.data)
      if (res.data.length > 0) handleSelectChild(res.data[0])
    })
  }, [])

  const [grades, setGrades] = useState([])
  const [attendance, setAttendance] = useState([])

  const handleSelectChild = async (child) => {
    setSelectedChild(child)
    try {
      const [gradesRes, attRes] = await Promise.all([
        api.get(`/academic/grades/student/${child.id}`),
        api.get(`/attendance/student/${child.id}`)
      ])
      setGrades(gradesRes.data)
      setAttendance(attRes.data)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1>Parent Portal</h1>
        </header>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Select Child:</label>
          <select className="form-control" onChange={e => handleSelectChild(children.find(c => c.id == e.target.value))} style={{ maxWidth: '300px' }}>
            {children.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
          </select>
        </div>

        {selectedChild && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Financial Status */}
            <div className="stat-card" style={{ background: '#fff', borderLeft: selectedChild.balance > 0 ? '5px solid #ef4444' : '5px solid #22c55e' }}>
              <h3>Financial Status</h3>
              <p>Total Outstanding Balance:</p>
              <h2 style={{ color: selectedChild.balance > 0 ? '#ef4444' : '#22c55e' }}>
                ${(selectedChild.balance || 0).toFixed(2)}
              </h2>
              {selectedChild.balance > 0 && <button className="btn-primary" style={{marginTop: '10px'}}>Pay Now</button>}
            </div>

            {/* Recent Grades */}
            <div className="stat-card" style={{ background: '#fff' }}>
              <h3>Recent Grades</h3>
              {grades.length === 0 ? <p>No grades found.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {grades.slice(0, 5).map(g => (
                    <li key={g.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <strong>{g.subject?.name}</strong>: {g.marks} {g.letterGrade && `(${g.letterGrade})`}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Attendance Overview */}
            <div className="stat-card" style={{ background: '#fff' }}>
              <h3>Attendance Overview</h3>
              {attendance.length === 0 ? <p>No attendance records found.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {attendance.slice(0, 5).map(a => (
                    <li key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{a.date}</span>
                      <span className={`badge ${a.status === 'PRESENT' ? 'badge-green' : 'badge-red'}`}>{a.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
