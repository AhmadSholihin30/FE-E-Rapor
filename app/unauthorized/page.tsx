"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LockKeyhole, ShieldX, ArrowLeft, LayoutDashboard, AlertTriangle } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden isolate">
      
      {/* GRID PATTERN BACKGROUND */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      
      {/* AMBIENT GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[600px] h-[600px] bg-red-600/20 opacity-40 blur-[130px] rounded-full -z-10 pointer-events-none mix-blend-multiply" />

      {/* MAIN CARD */}
      <Card className="w-full max-w-lg relative z-10 border-0 shadow-2xl bg-white/80 backdrop-blur-xl p-8 overflow-hidden ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-500 ease-out">
        
        {/* DECORATIVE TOP BORDER */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

        <div className="flex flex-col items-center text-center">
          
          {/* HERO GRAPHIC SECTION */}
          <div className="relative mb-8 mt-4 group">
            {/* Pulsing Effect */}
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping blur-sm"></div>
            
            {/* Main Icon Container */}
            <div className="relative bg-gradient-to-br from-white to-slate-50 p-6 rounded-full border-4 border-white shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] z-20 flex items-center justify-center">
              <LockKeyhole className="w-20 h-20 text-red-600 drop-shadow-sm relative z-10" strokeWidth={1.5} />
              <ShieldX className="w-12 h-12 text-slate-200 absolute bottom-4 right-4 -z-0 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </div>

            {/* Floating Alert Icon */}
            <div className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full shadow-sm border-2 border-white z-30 animate-bounce">
               <AlertTriangle className="w-5 h-5" fill="currentColor" />
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="space-y-3 mb-8">
            <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-800 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Security Alert: 403 Forbidden
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Akses Dibatasi
            </h1>
            
            {/* TEKS UTAMA SESUAI REQUEST */}
            <p className="text-lg text-slate-600 max-w-sm mx-auto leading-relaxed font-medium">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
            <p className="text-sm text-slate-400">
              Silahkan hubungi administrator jika ini kesalahan.
            </p>
          </div>

          {/* BUTTON ACTIONS - SUDAH DIPERBAIKI (GRID) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full animate-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-backwards">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </Button>
            
            <Link href="/" className="w-full block">
              <Button size="lg" className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all font-semibold">
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Button>
            </Link>
          </div>

        </div>
      </Card>

      {/* FOOTER */}
      <p className="absolute bottom-8 text-center text-sm text-slate-500 opacity-60">
        Sistem Keamanan E-Rapor &copy; 2025
      </p>
    </div>
  )
}