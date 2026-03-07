'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  ArrowLeft, 
  User, 
  Landmark, 
  Mail, 
  MapPin, 
  Briefcase, 
  Phone, 
  Users, 
  CreditCard, 
  Calendar, 
  DollarSign,
  Shield,
  Home,
  Wallet,
  UserCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

// Personal Information Component - Redesigned
function PersonalInformationTab() {
  const [info, setInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        const response = await fetch('/api/account/personal-info')
        if (response.ok) {
          const data = await response.json()
          setInfo(data.info)
        } else if (response.status === 401) {
          window.location.href = '/login'
        } else if (response.status === 404) {
          setError('Personal information not yet submitted. Please complete your application first.')
        } else {
          setError('Failed to load personal information')
        }
      } catch (err) {
        console.error('[v0] Error fetching personal info:', err)
        setError('An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPersonalInfo()
  }, [])

  const formatIdNumber = (id: string | undefined): string => {
    return id || 'Not set'
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return 'Not set'
    return numAmount.toLocaleString('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set'
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  // Parse contact person if it's a string
  const parseContactPerson = (contact: any) => {
    if (!contact) return null
    if (typeof contact === 'string') {
      try {
        return JSON.parse(contact)
      } catch {
        return { name: contact, phone: '', relationship: '' }
      }
    }
    return contact
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-[#0038A8] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600">Loading your information...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[#CE1126]" />
          </div>
          <p className="text-[#CE1126] font-medium mb-4">{error}</p>
        </div>
      </div>
    )
  }

  if (!info) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-[#6C757D] mb-4">No personal information available</p>
        </div>
      </div>
    )
  }

  const contactPerson1 = parseContactPerson(info.contact_person1)
  const contactPerson2 = parseContactPerson(info.contact_person2)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
            Personal Information
          </span>
        </h2>
        <p className="text-[#6C757D]">Your basic personal details</p>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-xl flex items-center justify-center shadow-md">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#212529]">Basic Details</h3>
            <p className="text-sm text-[#6C757D]">Your identity information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#0038A8]" />
              <label className="text-sm font-semibold text-[#6C757D]">Full Name</label>
            </div>
            <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
              <p className="text-[#212529] font-medium">{info.full_name || 'Not set'}</p>
            </div>
          </div>

          {/* ID Card Number */}
          {info.id_card_number && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#CE1126]" />
                <label className="text-sm font-semibold text-[#6C757D]">ID Card No.</label>
              </div>
              <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
                <p className="text-[#212529] font-mono">{formatIdNumber(info.id_card_number)}</p>
              </div>
            </div>
          )}

          {/* Gender */}
          {info.gender && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00A86B]" />
                <label className="text-sm font-semibold text-[#6C757D]">Gender</label>
              </div>
              <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
                <p className="text-[#212529] capitalize">{info.gender}</p>
              </div>
            </div>
          )}

          {/* Date of Birth */}
          {info.date_of_birth && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0038A8]" />
                <label className="text-sm font-semibold text-[#6C757D]">Date of Birth</label>
              </div>
              <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
                <p className="text-[#212529]">{formatDate(info.date_of_birth)}</p>
              </div>
            </div>
          )}

          {/* Email */}
          {info.email && (
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#CE1126]" />
                <label className="text-sm font-semibold text-[#6C757D]">Email</label>
              </div>
              <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
                <p className="text-[#212529]">{info.email}</p>
              </div>
            </div>
          )}

          {/* Living Address */}
          {info.living_address && (
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00A86B]" />
                <label className="text-sm font-semibold text-[#6C757D]">Living Address</label>
              </div>
              <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
                <p className="text-[#212529] whitespace-pre-wrap">{info.living_address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employment & Income Card */}
      {(info.position || info.current_job || info.monthly_income || info.stable_income) && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-xl flex items-center justify-center shadow-md">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#212529]">Employment & Income</h3>
              <p className="text-sm text-[#6C757D]">Your work and financial details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Job */}
            {(info.current_job || info.position) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#0038A8]" />
                  <label className="text-sm font-semibold text-[#6C757D]">Current Job</label>
                </div>
                <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
                  <p className="text-[#212529]">{info.current_job || info.position}</p>
                </div>
              </div>
            )}

            {/* Stable Income */}
            {(info.stable_income || info.monthly_income) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#00A86B]" />
                  <label className="text-sm font-semibold text-[#6C757D]">Stable Income</label>
                </div>
                <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
                  <p className="text-[#212529] font-semibold">
                    {formatCurrency(info.stable_income || info.monthly_income)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan Purpose Card */}
      {info.loan_purpose && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#212529]">Loan Purpose</h3>
              <p className="text-sm text-[#6C757D]">Reason for your loan application</p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
            <p className="text-[#212529] whitespace-pre-wrap">{info.loan_purpose}</p>
          </div>
        </div>
      )}

      {/* Emergency Contact Card */}
      {(info.relative_name || contactPerson1?.name || contactPerson2?.name) && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-xl flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#212529]">Emergency Contact</h3>
              <p className="text-sm text-[#6C757D]">Your emergency contact person</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Relative's Name */}
            {info.relative_name && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#6C757D]">Relative's Name</label>
                <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
                  <p className="text-[#212529]">{info.relative_name}</p>
                </div>
              </div>
            )}

            {/* Relative's Phone */}
            {info.relative_phone && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0038A8]" />
                  <label className="text-sm font-semibold text-[#6C757D]">Phone Number</label>
                </div>
                <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
                  <p className="text-[#212529]">{info.relative_phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Bank Information Component - With 3-second polling for real-time updates
function BankInformationTab() {
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    isAdminSet: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Fetch initial data
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        console.log('[v0] Fetching bank details...')
        const response = await fetch('/api/account/bank-details')
        console.log('[v0] Bank details response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('[v0] Bank details fetched:', data)
          if (data.bankDetails) {
            setBankDetails(data.bankDetails)
          } else {
            setBankDetails({
              bankName: '',
              accountNumber: '',
              isAdminSet: false,
            })
          }
        } else if (response.status === 401) {
          console.log('[v0] Unauthorized - redirecting to login')
          window.location.href = '/login'
        } else {
          const errorData = await response.json()
          console.error('[v0] Error fetching bank details:', response.status, errorData)
          setError('Failed to load bank details. Please try again.')
        }
      } catch (err) {
        console.error('[v0] Error fetching bank details:', err)
        setError('An error occurred while loading bank details.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBankDetails()
  }, [])

  // POLLING: Check for updates every 3 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // Only poll if not in editing mode (to avoid disrupting user input)
      if (!isEditing) {
        try {
          const response = await fetch('/api/account/bank-details')
          if (response.ok) {
            const data = await response.json()
            if (data.bankDetails) {
              // Only update if data actually changed
              const newDetails = data.bankDetails
              const currentDetails = bankDetails
              
              if (JSON.stringify(newDetails) !== JSON.stringify(currentDetails)) {
                console.log('[v0] Bank details updated by admin, refreshing UI')
                setBankDetails(newDetails)
                // Optional: Show a subtle success message
                setSuccess('Your bank details have been updated')
                setTimeout(() => setSuccess(''), 3000)
              }
            }
          }
        } catch (err) {
          console.error('[v0] Error polling bank details:', err)
        }
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [isEditing, bankDetails])

  const handleSave = async () => {
    if (!bankDetails.bankName || !bankDetails.accountNumber) {
      setError('Bank Name and Account Number are required')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/account/bank-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: bankDetails.bankName,
          accountNumber: bankDetails.accountNumber,
        }),
      })

      if (response.ok) {
        setSuccess('Bank details saved successfully')
        setIsEditing(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save')
      }
    } catch (err) {
      console.error('[v0] Save error:', err)
      setError('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const isAccountFilled = bankDetails.bankName && bankDetails.accountNumber
  const canEdit = !bankDetails.isAdminSet

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block w-12 h-12 border-4 border-[#0038A8] border-t-[#CE1126] rounded-full animate-spin mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header - Changed to flag colors */}
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
          Your <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">Withdrawal Account</span>
        </h2>
        <p className="text-lg text-[#6C757D]">
          Manage your bank account for loan disbursements and withdrawals
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700 font-medium">{success}</p>
        </div>
      )}

      {/* Bank Details Card - Changed colors to flag */}
      <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-xl flex items-center justify-center shadow-md">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#212529]">Bank Account Details</h2>
            <p className="text-[#6C757D]">For loan disbursements and withdrawals</p>
          </div>
        </div>

        {/* Bank Name */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#0038A8]" />
            <label className="block text-sm font-semibold text-[#6C757D]">Bank Name</label>
          </div>
          {isEditing && canEdit ? (
            <input
              type="text"
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
              className="w-full bg-white border-2 border-[#e9ecef] hover:border-[#0038A8] focus:border-[#0038A8] rounded-xl px-4 py-3 text-base focus:outline-none transition-colors"
            />
          ) : (
            <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
              <p className="text-[#212529]">{bankDetails.bankName || 'Not set'}</p>
            </div>
          )}
        </div>

        {/* Account Number */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#CE1126]" />
            <label className="block text-sm font-semibold text-[#6C757D]">Account Number</label>
          </div>
          {isEditing && canEdit ? (
            <input
              type="text"
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
              className="w-full bg-white border-2 border-[#e9ecef] hover:border-[#0038A8] focus:border-[#0038A8] rounded-xl px-4 py-3 text-base focus:outline-none transition-colors"
            />
          ) : isAccountFilled ? (
            <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
              <p className="text-[#212529] font-mono tracking-wider">
                {bankDetails.accountNumber}
              </p>
            </div>
          ) : (
            <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl border border-gray-100">
              <p className="text-[#212529]">Not set</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {isEditing && canEdit ? (
          <>
            <button
              onClick={() => {
                setIsEditing(false)
                setError('')
                const fetchBankDetails = async () => {
                  try {
                    const response = await fetch('/api/account/bank-details')
                    if (response.ok) {
                      const data = await response.json()
                      if (data.bankDetails) {
                        setBankDetails(data.bankDetails)
                      }
                    }
                  } catch (err) {
                    console.error('[v0] Error resetting bank details:', err)
                  }
                }
                fetchBankDetails()
              }}
              className="flex-1 px-8 py-3 rounded-lg text-center font-medium transition-all bg-[#F8F9FA] hover:bg-gray-100 border border-transparent hover:border-[#0038A8] text-[#212529]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-8 py-3 rounded-lg text-center font-medium transition-all bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white shadow-md hover:shadow-lg hover:translate-y-[-2px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : isAccountFilled ? (
          <button
            onClick={() => window.location.href = '/my-account'}
            className="w-full max-w-md mx-auto px-8 py-3 rounded-lg text-center font-medium transition-all bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white shadow-md hover:shadow-lg hover:translate-y-[-2px]"
          >
            Back to Account
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full max-w-md mx-auto px-8 py-3 rounded-lg text-center font-medium transition-all bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white shadow-md hover:shadow-lg hover:translate-y-[-2px]"
          >
            Add Bank Account
          </button>
        )}
      </div>
    </div>
  )
}

export default function AccountManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'personal' | 'bank'>('personal')

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#212529]">
      {/* Header with KabayanLoan branding */}
      <header className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4 md:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/my-account')} 
                className="text-[#0038A8] hover:text-[#002c86] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 relative">
                  <Image src={GOVERNMENT_LOGOS.bp} alt="KabayanLoan" width={32} height={32} className="object-contain" />
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-lg font-black tracking-tight">
                      <span className="text-[#0038A8]">KABAYAN</span>
                      <span className="text-[#CE1126]">LOAN</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Account Management</p>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <Shield className="w-4 h-4 text-[#0038A8]" />
              <span className="text-xs font-medium text-[#0038A8]">SEC Registered</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 p-1 border border-gray-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 py-3 rounded-xl text-center font-semibold transition-all ${
                activeTab === 'personal'
                  ? 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white shadow-md'
                  : 'text-[#6C757D] hover:text-[#0038A8] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Personal Info
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex-1 py-3 rounded-xl text-center font-semibold transition-all ${
                activeTab === 'bank'
                  ? 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white shadow-md'
                  : 'text-[#6C757D] hover:text-[#0038A8] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Landmark className="w-4 h-4" />
                Bank Info
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'personal' ? (
            <PersonalInformationTab />
          ) : (
            <BankInformationTab />
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            KabayanLoan is SEC Registered, BSP Supervised, and DMW Accredited.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] py-4 z-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link
            href="/home"
            className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#0038A8] hover:bg-[rgba(0,56,168,0.05)] no-underline"
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">HOME</span>
          </Link>
          
          <Link
            href="/wallet"
            className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#0038A8] hover:bg-[rgba(0,56,168,0.05)] no-underline"
          >
            <Wallet className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">WALLET</span>
          </Link>
          
          <Link
            href="/my-account"
            className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[#0038A8] bg-[rgba(0,56,168,0.05)] no-underline"
          >
            <UserCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">ACCOUNT</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
