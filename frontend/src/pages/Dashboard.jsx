import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0, totalTeachers: 0, totalClasses: 0, totalOutstandingBalance: 0, totalCollected: 0
  })
  const [gradeData, setGradeData] = useState([])
  const [attendanceData, setAttendanceData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, gradesRes, attendanceRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/grades-distribution'),
        api.get('/dashboard/attendance-trends')
      ])
      setStats(statsRes.data)
      setGradeData(gradesRes.data)
      setAttendanceData(attendanceRes.data)
    } catch (error) {
      console.error("Error fetching dashboard data", error)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <h1>Admin Overview</h1>
        </header>

        {/* STAT CARDS */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div className="stat-card" style={{ flex: '1', minWidth: '150px', background: '#e3f2fd', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#1565c0' }}>Students</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{stats.totalStudents}</p>
          </div>
          <div className="stat-card" style={{ flex: '1', minWidth: '150px', background: '#e8f5e9', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#2e7d32' }}>Teachers</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{stats.totalTeachers}</p>
          </div>
          <div className="stat-card" style={{ flex: '1', minWidth: '150px', background: '#fff3e0', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#ef6c00' }}>Classes</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{stats.totalClasses}</p>
          </div>
          <div className="stat-card" style={{ flex: '1', minWidth: '150px', background: '#ffebee', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#c62828' }}>Unpaid Fees</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0 0 0' }}>${stats.totalOutstandingBalance?.toFixed(2)}</p>
          </div>
          <div className="stat-card" style={{ flex: '1', minWidth: '150px', background: '#e0f7fa', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#00838f' }}>Collected Fees</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0 0 0' }}>${stats.totalCollected?.toFixed(2)}</p>
          </div>
        </div>

        {/* CHARTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
          
          {/* Grade Distribution */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ textAlign: 'center' }}>Grade Distribution</h3>
            <div style={{ height: '300px' }}>
              {gradeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {gradeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>No grades recorded yet.</div>
              )}
            </div>
          </div>

          {/* Attendance Trends */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ textAlign: 'center' }}>Attendance Trends (Last 7 Days)</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#4caf50" name="Present" />
                  <Bar dataKey="absent" fill="#f44336" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fee Collection Overview */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
            <h3 style={{ textAlign: 'center' }}>Fee Collection Overview</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Collected vs Unpaid', collected: stats.totalCollected, unpaid: stats.totalOutstandingBalance }
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="collected" fill="#00838f" name="Total Collected" />
                  <Bar dataKey="unpaid" fill="#c62828" name="Total Unpaid" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </main>
    </div>
  )
}
