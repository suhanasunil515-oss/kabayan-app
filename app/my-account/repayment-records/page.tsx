'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRealtimeRefresh } from '@/hooks/use-realtime-refresh'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Download, 
  ChevronDown,
  Home,
  Wallet,
  UserCircle,
  Shield,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  CreditCard,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPHP } from '@/lib/currency'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface RepaymentRecord {
  id: number
  date: string
  transactionId: string
  amount: number
  method: string
  status: 'completed' | 'pending' | 'failed'
  notes?: string
}

export default function RepaymentRecordsPage() {
  const router = useRouter()
  const [records, setRecords] = useState<RepaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [summary, setSummary] = useState({
    totalPaid: 0,
    onTimePayments: 0,
    latePayments: 0,
    remainingBalance: 0,
  })

  const fetchRecords = useCallback(async () => {
    try {
      const response = await fetch('/api/account/repayment-records')
      if (response.ok) {
        const data = await response.json()
        setRecords(data.records || [])
        setSummary(data.summary)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (err) {
      console.error('[v0] Error:', err)
      setError('Failed to load records')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  useRealtimeRefresh(fetchRecords, { refetchOnVisible: true })

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`[v0] Exporting as ${format}`)
    // Export logic would be implemented here
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return '#00A86B' // Green
      case 'pending': return '#FF6B00' // Orange
      case 'failed': return '#CE1126' // Red
      default: return '#6C757D'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch(status) {
      case 'completed': return '#E8F5E9' // Light green
      case 'pending': return '#FFF3E0' // Light orange
      case 'failed': return '#FFEBEE' // Light red
      default: return '#F5F5F5'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#0038A8] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#6C757D]">Loading records...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[#CE1126]" />
          </div>
          <p className="text-[#CE1126] mb-4">{error}</p>
          <Button 
            onClick={() => router.back()}
            className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef]">
        {/* Header */}
        <header className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()} 
                className="text-[#0038A8] hover:text-[#002c86] hover:bg-[#f0f7ff] p-2 rounded-xl transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.bp}
                    alt="KabayanLoan"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-xl font-black tracking-tight">
                      <span className="text-[#0038A8]">KABAYAN</span>
                      <span className="text-[#CE1126]">LOAN</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Repayment Records</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-12 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#0038A8]/20">
              <FileText className="w-10 h-10 text-[#0038A8]" />
            </div>
            <h2 className="text-xl font-semibold text-[#212529] mb-2">No records available</h2>
            <p className="text-[#6C757D] mb-6">You don't have any repayment records yet.</p>
            <Button 
              onClick={() => router.back()} 
              variant="outline"
              className="border-2 border-[#0038A8] text-[#0038A8] hover:bg-[#f0f7ff]"
            >
              Go Back
            </Button>
          </div>
        </main>

        {/* Footer Note */}
        <div className="text-center mt-6 pb-4">
          <p className="text-xs text-gray-400">
            KabayanLoan is SEC Registered, BSP Supervised, and DMW Accredited.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-24">
      {/* Header */}
      <header className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="text-[#0038A8] hover:text-[#002c86] hover:bg-[#f0f7ff] p-2 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src={GOVERNMENT_LOGOS.bp}
                  alt="KabayanLoan"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="text-xl font-black tracking-tight">
                    <span className="text-[#0038A8]">KABAYAN</span>
                    <span className="text-[#CE1126]">LOAN</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500">Repayment Records</p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-[#0038A8]" />
            <span className="text-xs font-medium text-[#0038A8]">SEC Registered</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Summary Cards - Redesigned with flag colors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-[#0038A8]/20 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#0038A8]" />
              <p className="text-xs text-[#6C757D]">Total Paid</p>
            </div>
            <p className="text-xl font-bold text-[#0038A8]">{formatPHP(summary.totalPaid)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-[#00A86B]/20 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-[#00A86B]" />
              <p className="text-xs text-[#6C757D]">On-Time</p>
            </div>
            <p className="text-xl font-bold text-[#00A86B]">{summary.onTimePayments}</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-[#CE1126]/20 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[#CE1126]" />
              <p className="text-xs text-[#6C757D]">Late Payments</p>
            </div>
            <p className="text-xl font-bold text-[#CE1126]">{summary.latePayments}</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl border border-[#FF6B00]/20 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-[#FF6B00]" />
              <p className="text-xs text-[#6C757D]">Remaining</p>
            </div>
            <p className="text-xl font-bold text-[#FF6B00]">{formatPHP(summary.remainingBalance)}</p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => handleExport('csv')}
            className="flex-1 border-2 border-[#0038A8] text-[#0038A8] hover:bg-[#f0f7ff] bg-transparent rounded-xl py-3 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            className="flex-1 border-2 border-[#CE1126] text-[#CE1126] hover:bg-[#fff0f0] bg-transparent rounded-xl py-3 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] px-4 py-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Payment History
            </h3>
          </div>
          
          {records.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {records.map((record) => (
                <div key={record.id}>
                  <button
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-[#212529]">
                        {new Date(record.date).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-[#6C757D] font-mono">{record.transactionId}</p>
                    </div>
                    <div className="text-right mr-3">
                      <p className="text-sm font-bold text-[#212529]">{formatPHP(record.amount)}</p>
                      <span
                        className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: getStatusBgColor(record.status),
                          color: getStatusColor(record.status)
                        }}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[#6C757D] transition-transform ${expandedId === record.id ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {expandedId === record.id && (
                    <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-4 border-t border-gray-100 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#6C757D] mb-1">Payment Method</p>
                          <p className="text-[#212529] font-medium">{record.method}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6C757D] mb-1">Transaction ID</p>
                          <p className="text-[#212529] font-mono text-xs">{record.transactionId}</p>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-[#6C757D] mb-1">Notes</p>
                          <p className="text-[#212529] text-sm">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-[#6C757D]">No records found</div>
          )}
        </div>

        {/* Government Trust Badges */}
        <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 mb-6 border border-[#0038A8]/20">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.sec} alt="SEC" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#0038A8]">SEC Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#00A86B]">BSP Supervised</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#CE1126]">DMW Accredited</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <Button 
          onClick={() => router.back()} 
          className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Back to Account
        </Button>
      </main>

      {/* Footer Note */}
      <div className="text-center mt-6 pb-4">
        <p className="text-xs text-gray-400">
          KabayanLoan is SEC Registered, BSP Supervised, and DMW Accredited. 
          All rights reserved.
        </p>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 py-4 border-t border-gray-100">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link
            href="/home"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#0038A8] hover:bg-[rgba(0,56,168,0.05)]"
          >
            <Home className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">HOME</span>
          </Link>

          <Link
            href="/wallet"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#0038A8] hover:bg-[rgba(0,56,168,0.05)]"
          >
            <Wallet className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">WALLET</span>
          </Link>

          <Link
            href="/my-account"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[#0038A8] bg-[rgba(0,56,168,0.05)]"
          >
            <UserCircle className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">ACCOUNT</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
