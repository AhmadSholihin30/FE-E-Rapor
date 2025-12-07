"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { authApi } from "@/lib/api"
import { Lock, ArrowRight, AlertCircle, LogOut, KeyRound, Eye, EyeOff } from "lucide-react"

// --- KOMPONEN JAM DIGITAL (Update: Ada Detik) ---
function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    // Update setiap detik
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      {/* Jam Besar dengan Detik */}
      <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight drop-shadow-2xl font-mono">
        {time.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' // Menambahkan detik
        }).replace(/\./g, ':')} 
      </h1>
      <p className="text-lg text-slate-300 font-medium mt-2 drop-shadow-md">
        {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  )
}

export default function LockedPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // State untuk Toggle Password (Mata)
  const [showPassword, setShowPassword] = useState(false)

  // Cegah Back Button
  useEffect(() => {
    window.history.pushState(null, "", window.location.href)
    const handlePopState = () => window.history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setLoading(true)
    setError("")

    try {
      await authApi.unlock(user.id, password)
      
      // Redirect sesuai role
      if (user.role === 'admin') router.push("/admin/dashboard")
      else if (user.role === 'guru') router.push("/guru/dashboard")
      else if (user.role === 'siswa') router.push("/siswa/dashboard")
      else router.push("/")
      
    } catch (err: any) {
      setError(err?.message || "Password salah.")
      setPassword("") 
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (!user) return null 

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U"

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

      {/* --- CONTENT --- */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        {/* 1. JAM DIGITAL (Update) */}
        <LiveClock />

        {/* 2. CARD GLASSMORPHISM */}
        <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/5 animate-in zoom-in-95 duration-500">
          
          {/* Header Card */}
          <div className="pt-10 pb-6 flex flex-col items-center px-8">
            {/* Avatar */}
            <div className="relative mb-4 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl">
                    <span className="text-3xl font-bold text-white">{initial}</span>
                    <div className="absolute bottom-0 right-0 bg-yellow-500 text-slate-900 p-1.5 rounded-full ring-4 ring-slate-900">
                        <Lock className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-white tracking-wide">{user.name}</h2>
            <p className="text-sm text-blue-400 font-medium uppercase tracking-wider mt-1 border border-blue-500/20 bg-blue-500/10 px-3 py-0.5 rounded-full">
                {user.role}
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8">
            <form onSubmit={handleUnlock} className="space-y-4">
              
              {/* Input Password dengan Icon Mata (Update) */}
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none">
                    <KeyRound className="w-5 h-5" />
                </div>
                
                {/* Tombol Mata / Toggle Password */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors focus:outline-none p-1"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>

                <input
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Password..."
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-xl py-3.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
                  autoFocus
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg animate-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tombol Unlock */}
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Membuka...
                    </span>
                ) : (
                    <>Buka Akses <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Tombol Ganti Akun (Update Style) */}
            <div className="mt-6 pt-6 border-t border-white/5">
                <button 
                    onClick={handleLogout}
                    className="w-full bg-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-transparent text-xs text-slate-400 transition-all py-3 rounded-lg flex items-center justify-center gap-2 group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Bukan akun Anda? <strong>Logout</strong></span>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}