"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/alert"
import { auditApi, usersApi } from "@/lib/api"
import { toWIB } from "@/lib/utils"

import { 
  FileText, X, RefreshCw, Eye, Activity, Globe, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, User,
  MessageSquare, Laptop 
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // State Modal: HANYA SATU MODAL UNTUK SEMUA
  const [selected, setSelected] = useState<any>(null) 
  const [descriptionModal, setDescriptionModal] = useState<string | null>(null)

  const [users, setUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => { fetchLogs() }, [selectedUserId])

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (err) {
      console.error("Gagal mengambil data user untuk filter", err)
    }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await auditApi.getLogs(selectedUserId || undefined)
      setLogs(data)
      setCurrentPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs")
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase()
    return (
      log.user_nama?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term) ||
      log.endpoint?.toLowerCase().includes(term) ||
      log.method?.toLowerCase().includes(term) ||
      log.ip_address?.toLowerCase().includes(term) ||
      log.user_email?.toLowerCase().includes(term)
    );
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Helper warna badge
  const getMethodBadge = (method: string, action: string) => {
    if (action === "LOGIN_FAILED") {
      return "bg-red-100 text-red-700 border-red-200 animate-pulse";
    }
    const styles: Record<string, string> = {
      GET: "bg-blue-100 text-blue-700 border-blue-200",
      POST: "bg-green-100 text-green-700 border-green-200",
      PUT: "bg-amber-100 text-amber-700 border-amber-200",
      DELETE: "bg-red-100 text-red-700 border-red-200",
      PATCH: "bg-purple-100 text-purple-700 border-purple-200",
    }
    return styles[method] || "bg-slate-100 text-slate-700 border-slate-200"
  }

  // Helper parse JSON message
  const handleViewDescription = (rawDescription: any) => {
    try {
      let parsed = rawDescription;
      if (typeof rawDescription === 'string') {
        try {
          parsed = JSON.parse(rawDescription);
        } catch {
          parsed = rawDescription;
        }
      }
      if (typeof parsed === 'object' && parsed !== null && parsed.message) {
        setDescriptionModal(parsed.message);
      } else if (typeof parsed === 'object') {
        setDescriptionModal(JSON.stringify(parsed, null, 2));
      } else {
        setDescriptionModal(String(parsed));
      }
    } catch (e) {
      setDescriptionModal("Gagal memproses deskripsi.");
    }
  }

  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50 relative">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                   <Activity className="h-8 w-8 text-blue-600" /> Audit Logs
                </h1>
                <p className="text-slate-500 mt-1">
                  Riwayat aktivitas sistem ({logs.length} Records Loaded).
                </p>
              </div>
              <Button onClick={fetchLogs} variant="outline" size="sm" className="bg-white border-slate-200 shadow-sm">
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
              </Button>
            </div>

            {/* Search & Filter */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                      type="text"
                      placeholder="Cari cepat (User, Endpoint, Method, IP)..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-md"
                  />
              </div>

              <div className="relative w-full md:w-64">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-md"
                  >
                      <option value="">Semua User</option>
                      {users.map(user => (
                          <option key={user.id} value={user.id}>{user.nama}</option>
                      ))}
                  </select>
              </div>
            </div>

            {error && <Alert message={error} type="error" />}

            {/* TABLE */}
            {loading ? (
              <div className="flex justify-center h-40 items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Card className="overflow-hidden border shadow-sm bg-white">

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs text-slate-500">Waktu</th>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Endpoint</th>
                        <th className="px-6 py-4">IP Addr</th>
                        <th className="px-6 py-4 text-center">Detail</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {currentLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                            <Search className="h-10 w-10 mx-auto opacity-20 mb-2" />
                            {searchTerm ? (
                              <>Tidak ada log cocok: {searchTerm}</>
                            ) : (
                              <>Belum ada riwayat aktivitas.</>
                            )}
                          </td>
                        </tr>
                      ) : currentLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition">

                          <td className="px-6 py-4 font-mono text-xs text-slate-500">
                            {toWIB(log.created_at)}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <User size={16} />
                              </div>
                              <div>
                                <p className="font-semibold">{log.user_nama || "System / Unknown"}</p>
                                <p className="text-xs text-slate-400">{log.user_email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* METHOD BADGE */}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodBadge(log.method, log.action)}`}>
                                {log.method}
                              </span>
                              
                              <span className={log.action === 'LOGIN_FAILED' ? 'text-red-600 font-medium' : ''}>
                                {log.action}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-mono text-xs text-slate-500 truncate max-w-[150px]">
                            {log.endpoint}
                          </td>

                          <td className="px-6 py-4 font-mono text-xs text-slate-400">
                            {log.ip_address}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center items-center gap-1">
                              
                              {/* TOMBOL DETAIL: SEMUA SERAGAM (BIRU & TEXT "DETAIL") */}
                              {/* Selalu buka modal 'selected' biasa */}
                              <Button
                                onClick={() => setSelected(log)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4 md:mr-1.5" /> <span className="hidden md:inline">Detail</span>
                              </Button>

                              {/* TOMBOL DESKRIPSI (Hanya jika LOGIN_FAILED) */}
                              {log.action === 'LOGIN_FAILED' && log.description && (
                                <Button
                                  onClick={() => handleViewDescription(log.description)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-amber-600 hover:bg-amber-50"
                                  title="Lihat Alasan Error"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              )}

                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
                  {filteredLogs.length > 0 && (
                    <p className="text-xs text-slate-500">
                      Menampilkan <b>{indexOfFirstItem + 1}</b> - <b>{Math.min(indexOfLastItem, filteredLogs.length)}</b> dari <b>{filteredLogs.length}</b>
                    </p>
                  )}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {/* Pagination buttons code kept same for brevity */}
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => paginate(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                      <div className="mx-2 text-xs font-medium bg-white border px-3 py-1 rounded-md">Hal {currentPage} / {totalPages}</div>
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>

              </Card>
            )}

            {/* ===================================================== */}
            {/* MODAL 1: DESKRIPSI ERROR (Khusus LOGIN_FAILED) */}
            {/* ===================================================== */}
            {descriptionModal && (
              <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[80] p-4">
                <Card className="w-full max-w-md bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Login Failed Reason</h3>
                    <div className="bg-slate-50 border rounded-lg p-4 text-sm text-slate-600 font-mono break-words text-left max-h-[300px] overflow-y-auto">
                      {descriptionModal}
                    </div>
                    <div className="mt-6">
                      <Button onClick={() => setDescriptionModal(null)} className="w-full bg-slate-900 hover:bg-slate-800">
                        Tutup
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}


            {/* ===================================================== */}
            {/* MODAL 2: DETAIL UTAMA (SATU UNTUK SEMUA) */}
            {/* ===================================================== */}
            {selected && (
              <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[60] p-4">
                <Card className="w-full max-w-4xl bg-white shadow-2xl overflow-hidden">

                  <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600"/> Detail Audit Log
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setSelected(null)}
                      className="text-slate-400 hover:text-red-500 rounded-full h-8 w-8 p-0">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="p-6">
                    {/* INFO UTAMA */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">

                      <div className="p-3 bg-slate-50 rounded-lg border">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">User</p>
                        <p className="font-semibold">{selected.user_nama || "Guest/System"}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status Code</p>
                        <p className={`font-mono font-bold ${selected.status_code >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                           {selected.status_code}
                        </p>
                      </div>

                      {/* Saya tambahkan IP Addr disini agar info login tidak hilang */}
                      <div className="p-3 bg-slate-50 rounded-lg border">
                         <p className="text-xs text-slate-400 uppercase font-bold mb-1">IP Addr</p>
                         <p className="font-mono text-xs">{selected.ip_address}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Endpoint</p>
                        <p className="font-mono text-xs truncate" title={selected.endpoint}>{selected.endpoint}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border col-span-4">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                           <Globe className="w-3 h-3" /> User Agent
                        </p>
                        <p className="font-mono text-xs break-all">{selected.user_agent}</p>
                      </div>

                    </div>

                    {/* DATA SEBELUM / SESUDAH */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-2 h-2 rounded-full bg-red-400"></div>
                           <span className="font-bold text-sm">Data Sebelum</span>
                        </div>
                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono max-h-[400px] overflow-auto">
                          {selected.before_data ? <pre>{JSON.stringify(selected.before_data, null, 2)}</pre> :
                            <i className="text-slate-500">Tidak ada data (Create/Login)</i>}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-2 h-2 rounded-full bg-green-400"></div>
                           <span className="font-bold text-sm">Data Sesudah</span>
                        </div>
                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono max-h-[400px] overflow-auto">
                          {selected.after_data ? <pre>{JSON.stringify(selected.after_data, null, 2)}</pre> :
                            <i className="text-slate-500">Tidak ada data (Delete/Failed)</i>}
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
                    <Button onClick={() => setSelected(null)} variant="outline">Tutup</Button>
                  </div>

                </Card>
              </div>
            )}

          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}