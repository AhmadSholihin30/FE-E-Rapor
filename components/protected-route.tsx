"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (loading) return

    // 1️⃣ Belum login → ke login
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    // 2️⃣ Cek Role → kalau tidak cocok → unauthorized
    if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
      router.replace("/unauthorized")
      return
    }
  }, [loading, isAuthenticated, user, requiredRoles, router])

  // Jangan render apapun saat loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  // Jika belum login atau role salah, jangan render halaman
  if (!isAuthenticated) return null
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) return null

  return <>{children}</>
}
