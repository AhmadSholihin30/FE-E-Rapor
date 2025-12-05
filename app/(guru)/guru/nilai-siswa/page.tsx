"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Alert } from "@/components/alert"
// Update Import: Tambah authApi
import { nilaiApi, kelasApi, authApi } from "@/lib/api"
import { Search, GraduationCap, Filter, AlertCircle, BookOpen } from "lucide-react"
import { Card } from "@/components/ui/card"

interface NilaiData {
  id: number;
  student_name: string;
  nama_mapel: string;
  nilai_angka: string;
  semester: number;
  kkm: number;
}

export default function NilaiSiswa() {
  const [nilai, setNilai] = useState<NilaiData[]>([])
  const [kelas, setKelas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedKelas, setSelectedKelas] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch Kelas (Diperbarui menggunakan authApi.authMe)
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        // 1. Ambil data user dari server via authMe
        const userResp: any = await authApi.authMe();
        
        // 2. Ambil ID dari object user
        const guruId = userResp?.user?.id;

        if (!guruId) throw new Error("Gagal membaca ID user.");

        // 3. Fetch kelas berdasarkan ID Guru
        const data = await kelasApi.getKelasByGuruId(guruId) as any[];
        setKelas(data);
        
        // Set default selected kelas jika ada data
        if (data && data.length > 0) {
          setSelectedKelas(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching kelas:", err);
        setError(err instanceof Error ? err.message : "Gagal mengambil data kelas");
      } finally {
        setLoading(false);
      }
    }
    fetchKelas();
  }, [])

  // Fetch Nilai (Tidak berubah)
  useEffect(() => {
    if (!selectedKelas) return
    const fetchNilai = async () => {
      setLoading(true)
      try {
        const data = await nilaiApi.getNilaiByKelas(selectedKelas) as NilaiData[];
        setNilai(data);
      } catch (err) {
        console.error("Error fetching nilai:", err);
        setNilai([]); 
      } finally {
        setLoading(false);
      }
    }
    fetchNilai();
  }, [selectedKelas])

  const filteredNilai = nilai.filter((n) => 
    n.student_name ? n.student_name.toLowerCase().includes(searchQuery.toLowerCase()) : false
  )

  return (
    <ProtectedRoute requiredRoles={["guru"]}>
      <div className="min-h-screen bg-slate-50/50 relative">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8">
            
            {/* Header Page */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                   <GraduationCap className="h-8 w-8 text-blue-600" /> Data Nilai Siswa
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                  Pantau perkembangan nilai siswa di kelas yang Anda ampu.
                </p>
              </div>
            </div>

            {error && <Alert message={error} type="error" />}

            {/* FILTER CARD */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-8 animate-in slide-in-from-top-2 duration-500">
               <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                  <Filter className="w-4 h-4 text-blue-500" /> Filter Data
               </div>
               
               <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Pilih Kelas Ajar</label>
                    <div className="relative">
                       <select
                         value={selectedKelas}
                         onChange={(e) => setSelectedKelas(e.target.value)}
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer appearance-none font-medium text-slate-700"
                         disabled={loading && kelas.length === 0}
                       >
                         {kelas.length === 0 && <option>Tidak ada kelas</option>}
                         {kelas.map((k) => (
                           <option key={k.id} value={k.id}>
                             {k.nama_kelas || k.nama} {k.jurusan ? `- ${k.jurusan}` : ""}
                           </option>
                         ))}
                       </select>
                       <div className="absolute right-3 top-3 pointer-events-none">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                       </div>
                    </div>
                  </div>

                  <div className="w-full md:w-2/3 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Cari Nama Siswa</label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3 text-slate-400 h-4 w-4" />
                      <input 
                        type="text"
                        placeholder="Ketik nama siswa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
               </div>
            </div>

            {/* TABLE CONTENT */}
            {loading ? (
              <div className="flex justify-center h-40 items-center flex-col gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-sm text-slate-400 font-medium">Memuat data nilai...</p>
              </div>
            ) : (
              <Card className="overflow-hidden border border-slate-200 shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Siswa</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Mapel</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Nilai</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">KKM</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Semester</th>
                        <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredNilai.length > 0 ? (
                        filteredNilai.map((n, index) => {
                          // Logic Status Dinamis
                          const nilaiAkhir = Number(n.nilai_angka);
                          const kkm = Number(n.kkm) || 75; 
                          const isTuntas = nilaiAkhir >= kkm;

                          return (
                            <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-6 py-4">
                                 <div className="font-semibold text-slate-700">{n.student_name || "Unknown"}</div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2 text-slate-600">
                                    <BookOpen className="w-3 h-3 text-blue-400" />
                                    {n.nama_mapel || "-"}
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="font-bold text-lg text-slate-800">{n.nilai_angka}</span>
                              </td>
                              
                              <td className="px-6 py-4">
                                 <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 border border-slate-200">
                                    KKM: {kkm}
                                 </span>
                              </td>
                              
                              <td className="px-6 py-4 text-slate-500">
                                 Semester {n.semester}
                              </td>

                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                  isTuntas 
                                    ? "bg-green-50 text-green-700 border-green-200" 
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}>
                                  {isTuntas ? (
                                     <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Tuntas
                                     </>
                                  ) : (
                                     <>
                                        <AlertCircle className="w-3 h-3" /> Tidak Tuntas
                                     </>
                                  )}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-slate-400 flex flex-col items-center justify-center w-full">
                            <Search className="h-12 w-12 mb-3 opacity-20" />
                            {searchQuery ? "Siswa tidak ditemukan dalam pencarian." : "Belum ada data nilai untuk kelas ini."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}