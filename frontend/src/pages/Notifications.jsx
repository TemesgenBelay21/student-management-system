import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'read'

  useEffect(() => {
    if (user?.id) fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/user/${user.id}`)
      setNotifications(res.data)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
      setError('Could not load notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read)
    await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`).catch(() => {})))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <h1>Notifications</h1>
        </header>

        {/* Summary bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
        }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 18px', borderRadius: '20px', border: 'none',
                  cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                  background: filter === f ? '#1565c0' : '#e3eaf7',
                  color: filter === f ? '#fff' : '#444',
                  transition: 'all 0.2s'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' && unreadCount > 0 && (
                  <span style={{
                    marginLeft: '6px', background: '#fff', color: '#1565c0',
                    borderRadius: '10px', padding: '1px 6px', fontSize: '11px', fontWeight: 700
                  }}>{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '7px 18px', borderRadius: '20px', border: '1px solid #1565c0',
                cursor: 'pointer', background: 'transparent', color: '#1565c0',
                fontWeight: 600, fontSize: '13px'
              }}
            >
              ✓ Mark all as read
            </button>
          )}
        </div>

        {/* Notification list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Loading...</div>
          ) : error ? (
            <div style={{
              textAlign: 'center', padding: '60px', color: '#c62828',
              background: '#fff', borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px', color: '#999',
              background: '#fff', borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
              <p style={{ margin: 0, fontSize: '15px' }}>No {filter !== 'all' ? filter : ''} notifications</p>
            </div>
          ) : (
            filtered.map(n => (
              <div
                key={n.id}
                style={{
                  background: n.read ? '#fff' : '#e8f0fe',
                  borderRadius: '12px', padding: '18px 22px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  borderLeft: n.read ? '4px solid transparent' : '4px solid #1565c0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  gap: '16px', transition: 'background 0.2s'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '15px', color: '#1a237e' }}>{n.title}</strong>
                    {!n.read && (
                      <span style={{
                        background: '#1565c0', color: '#fff', fontSize: '10px',
                        padding: '2px 8px', borderRadius: '10px', fontWeight: 700
                      }}>NEW</span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 8px', color: '#444', fontSize: '14px', lineHeight: '1.5' }}>{n.message}</p>
                  <span style={{ fontSize: '12px', color: '#999' }}>{formatDate(n.createdAt)}</span>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px',
                      border: '1px solid #1565c0', background: 'transparent',
                      color: '#1565c0', cursor: 'pointer', fontSize: '12px',
                      fontWeight: 600, whiteSpace: 'nowrap'
                    }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
