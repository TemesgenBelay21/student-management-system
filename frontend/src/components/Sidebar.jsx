import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">SMS</div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/students" className={({ isActive }) => isActive ? 'active' : ''}>Students</NavLink>
        <NavLink to="/teachers" className={({ isActive }) => isActive ? 'active' : ''}>Teachers</NavLink>
        <NavLink to="/classes" className={({ isActive }) => isActive ? 'active' : ''}>Classes</NavLink>
        <NavLink to="/attendance" className={({ isActive }) => isActive ? 'active' : ''}>Attendance</NavLink>
        <NavLink to="/academic" className={({ isActive }) => isActive ? 'active' : ''}>Academics</NavLink>
        <NavLink to="/finance" className={({ isActive }) => isActive ? 'active' : ''}>Finance</NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{user?.fullName?.charAt(0) || '?'}</div>
          <div>
            <div className="user-name">{user?.fullName}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  )
}
