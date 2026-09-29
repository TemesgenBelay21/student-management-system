import React, { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sms_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { token, ...userData } = response.data
    localStorage.setItem('sms_token', token)
    localStorage.setItem('sms_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('sms_token')
    localStorage.removeItem('sms_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
