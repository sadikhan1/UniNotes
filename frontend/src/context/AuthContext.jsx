import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => {
        setUser(data.user)
        setSession({ access_token: token })
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  function login(token, userData) {
    localStorage.setItem('token', token)
    setUser(userData)
    setSession({ access_token: token })
  }

  function logout() {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).catch(() => {})
    localStorage.removeItem('token')
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
