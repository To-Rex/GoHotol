import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import type { User, LoginResponse } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<string[]>([])

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
      try {
        const perms = await api.get(`/users/${data.id}/permissions`)
        setPermissions(perms.data?.map((p: { slug: string }) => p.slug) ?? [])
      } catch {
        setPermissions([])
      }
    } catch {
      setUser(null)
      setPermissions([])
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
    setPermissions([])
  }

  const hasPermission = useCallback(
    (slug: string) => {
      if (user?.is_super_admin) return true
      return permissions.includes(slug)
    },
    [user, permissions],
  )

  return { user, loading, login, logout, hasPermission }
}
