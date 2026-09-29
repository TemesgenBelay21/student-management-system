import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

export default function Finance() {
  const [students, setStudents] = useState([])
  
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students')
      setStudents(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCharge = async (id) => {
    const amount = prompt('Enter charge amount to add to balance:')
    if (!amount || isNaN(amount)) return
    try {
      await api.post(`/finance/charge/${id}`, { amount: parseFloat(amount) })
      fetchStudents()
    } catch (err) {
      alert('Failed to add charge')
    }
  }

  const handlePayment = async (id) => {
    const amount = prompt('Enter payment amount:')
    if (!amount || isNaN(amount)) return
    try {
      await api.post(`/finance/pay/${id}`, { amount: parseFloat(amount), paymentDate: new Date().toISOString().split('T')[0] })
      fetchStudents()
      alert('Payment recorded successfully')
    } catch (err) {
      alert('Failed to record payment')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <h1>Finance & Payments</h1>
        </header>

        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Admission No</th>
              <th>Outstanding Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.fullName}</td>
                <td>{s.admissionNumber}</td>
                <td style={{ color: s.balance > 0 ? '#d32f2f' : '#2e7d32', fontWeight: 'bold' }}>
                  ${(s.balance || 0).toFixed(2)}
                </td>
                <td>
                  <button className="btn-primary" onClick={() => handleCharge(s.id)} style={{marginRight: '10px', fontSize: '0.85rem', padding: '5px 10px'}}>Add Charge</button>
                  <button className="btn-secondary" onClick={() => handlePayment(s.id)} style={{fontSize: '0.85rem', padding: '5px 10px'}}>Record Payment</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  )
}
