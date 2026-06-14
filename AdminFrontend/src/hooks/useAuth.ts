import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import type { User, LoginResponse } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [fetchMe])

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', { username, password })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    await fetchMe()
    return data
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return { user, loading, login, logout }
}
