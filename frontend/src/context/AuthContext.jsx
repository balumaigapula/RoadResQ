import { createContext, useContext, useEffect, useState } from 'react'
import authService from '../services/authService'
import storage from '../utils/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) storage.set(storage.keys.authUser, user)
  }, [user])

  async function login(credentials) {
    setLoading(true)
    try {
      const { user: loggedInUser } = await authService.login(credentials)
      setUser(loggedInUser)
      return loggedInUser
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
