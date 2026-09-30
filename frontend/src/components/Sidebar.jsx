import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/user/${user.id}`)
      setNotifications(res.data)
    } catch (err) {
      // silently fail — notifications are non-critical
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read)
    await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`).catch(() => {})))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNotificationClick = (n) => {
    if (!n.read) markAsRead(n.id)
    setShowDropdown(false)
    navigate('/notifications')
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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
        <NavLink to="/parent-portal" className={({ isActive }) => isActive ? 'active' : ''}>Parent Portal</NavLink>
        <NavLink to="/notifications" className={({ isActive }) => isActive ? 'active' : ''}>Notifications</NavLink>
      </nav>

      {/* Notification Bell */}
      <div ref={dropdownRef} style={{ position: 'relative', padding: '10px 20px' }}>
        <button
          id="notification-bell"
          onClick={() => setShowDropdown(prev => !prev)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'inherit', width: '100%', padding: 0
          }}
        >
          <span style={{ fontSize: '20px' }}>🔔</span>
          {unreadCount > 0 && (
            <span style={{
              fontSize: '12px', background: 'var(--danger)', color: '#fff',
              padding: '2px 7px', borderRadius: '10px', fontWeight: 'bold'
            }}>
              {unreadCount} New
            </span>
          )}
          {unreadCount === 0 && (
            <span style={{ fontSize: '13px', opacity: 0.6 }}>Notifications</span>
          )}
        </button>

        {showDropdown && (
          <div style={{
            position: 'absolute', bottom: '48px', left: '10px', right: '10px',
            background: '#fff', color: '#333', borderRadius: '10px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)', zIndex: 9999,
            minWidth: '280px', maxHeight: '340px', overflowY: 'auto',
            border: '1px solid #e0e0e0'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0,
              background: '#fff'
            }}>
              <strong style={{ fontSize: '14px' }}>Notifications</strong>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={{
                  fontSize: '12px', background: 'none', border: 'none',
                  color: '#1565c0', cursor: 'pointer', fontWeight: 600
                }}>
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            {notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '12px 16px', borderBottom: '1px solid #f5f5f5',
                    cursor: 'pointer', background: n.read ? '#fff' : '#e8f0fe',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? '#fff' : '#e8f0fe'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px' }}>{n.title}</strong>
                    {!n.read && (
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: '#1565c0', display: 'inline-block', flexShrink: 0
                      }} />
                    )}
                  </div>
                  <p style={{ margin: '4px 0 4px', fontSize: '12px', color: '#555' }}>{n.message}</p>
                  <span style={{ fontSize: '11px', color: '#aaa' }}>{formatTime(n.createdAt)}</span>
                </div>
              ))
            )}

            {/* Footer link */}
            <div
              onClick={() => { setShowDropdown(false); navigate('/notifications') }}
              style={{
                padding: '10px', textAlign: 'center', fontSize: '13px',
                color: '#1565c0', cursor: 'pointer', fontWeight: 600,
                borderTop: '1px solid #eee', position: 'sticky', bottom: 0, background: '#fff'
              }}
            >
              View all notifications →
            </div>
          </div>
        )}
      </div>

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
