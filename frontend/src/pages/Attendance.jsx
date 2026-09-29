import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

export default function Attendance() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [report, setReport] = useState(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass && date) {
      fetchAttendance()
      fetchReport()
    }
  }, [selectedClass, date])

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes')
      setClasses(res.data)
      if (res.data.length > 0) {
        setSelectedClass(res.data[0].id)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load classes')
    }
  }

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/attendance/class/${selectedClass}?date=${date}`)
      setAttendanceRecords(res.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const fetchReport = async () => {
    try {
      const res = await api.get(`/attendance/reports/class/${selectedClass}`)
      setReport(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceRecords(records => 
      records.map(record => 
        record.studentId === studentId 
          ? { ...record, status: newStatus } 
          : record
      )
    )
  }

  const handleRemarksChange = (studentId, newRemarks) => {
    setAttendanceRecords(records => 
      records.map(record => 
        record.studentId === studentId 
          ? { ...record, remarks: newRemarks } 
          : record
      )
    )
  }

  const saveAttendance = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        classId: selectedClass,
        date: date,
        attendanceList: attendanceRecords.map(r => ({
          studentId: r.studentId,
          status: r.status || 'PRESENT', // default to PRESENT if not set
          remarks: r.remarks || ''
        }))
      }
      
      await api.post('/attendance', payload)
      fetchReport() // Refresh report after saving
      alert('Attendance saved successfully')
    } catch (err) {
      console.error(err)
      setError('Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <h1>Daily Attendance</h1>
        </header>

        {error && <div className="error-message">{error}</div>}

        <div className="attendance-controls" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label>Class: </label>
            <select 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
              className="form-control"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.section ? `(${c.section})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Date: </label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="form-control"
            />
          </div>
          <div>
            <button className="btn btn-primary" onClick={saveAttendance} disabled={saving || loading}>
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {report && (
          <div className="attendance-report" style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Class Report Overview</h3>
            <p>Total Records: {report.totalRecords}</p>
            <p>Present: {report.present} ({report.presentPercentage?.toFixed(2)}%)</p>
            <p>Absent: {report.absent}</p>
            <p>Late: {report.late}</p>
            <p>Excused: {report.excused}</p>
          </div>
        )}

        <div className="table-container">
          {loading ? (
            <p>Loading students...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="4">No students found for this class.</td>
                  </tr>
                ) : (
                  attendanceRecords.map(record => (
                    <tr key={record.studentId}>
                      <td>{record.admissionNumber}</td>
                      <td>{record.studentName}</td>
                      <td>
                        <select 
                          value={record.status || 'PRESENT'} 
                          onChange={(e) => handleStatusChange(record.studentId, e.target.value)}
                          className="form-control"
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="LATE">Late</option>
                          <option value="EXCUSED">Excused</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={record.remarks || ''} 
                          onChange={(e) => handleRemarksChange(record.studentId, e.target.value)}
                          placeholder="Optional notes"
                          className="form-control"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
