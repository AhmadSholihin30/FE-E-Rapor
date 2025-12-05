"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authApi } from "./api"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "guru" | "siswa"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ================================
  // FIX: CEK AUTH DENGAN BACKEND
  // ================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getProfile()
        setUser(res.user)        // <-- user diset dari backend
      } catch (err) {
        setUser(null)            // token invalid / expired
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // ================================
  // LOGIN
  // ================================
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const { user: loginUser } = await authApi.login(email, password)
      setUser(loginUser) // <-- FE dapat user dari response, bukan dari token FE
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ================================
  // LOGOUT
  // ================================
  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authApi.logout()
      setUser(null)
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
