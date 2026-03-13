'use client'

/**
 * UPDATED WITHDRAWAL RULES (3 Requirements):
 * 
 * User can withdraw funds ONLY when ALL of the following conditions are met:
 * 1. Available Balance > 0 (User has funds available)
 * 2. Loan Status Color = Green (#22C55E) (Admin set status indicator - not just text)
 * 3. Withdrawal Code matches the code set by admin in User Management
 * 
 * Withdrawal Flow:
 * 1. Check balance > 0 AND status_color is exactly #22C55E (green)
 * 2. If both true, enable "Withdraw Funds" button
 * 3. User clicks button → withdrawal code verification modal appears
 * 4. User enters the withdrawal code (set by admin in User Management > Code column)
 * 5. Code must match exactly the code stored in users.withdrawal_otp field
 * 6. If code matches → create withdrawal order with "pending" status
 * 7. Withdrawal order appears in admin's Withdrawal List for approval/rejection
 * 8. Once admin approves → funds transferred, status changes to "completed"
 * 9. Once admin rejects → withdrawal canceled, user can retry
 * 
 * Withdrawal is DISABLED when:
 * - Balance is zero
 * - Loan Status Color is NOT green (#22C55E)
 * - Data is loading
 */

import React from "react"
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtimeRefresh } from '@/hooks/use-realtime-refresh'
import { 
  ArrowLeft, 
  Eye, 
  EyeOff,
  AlertCircle,
  Home,
  Wallet,
  User,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface ToastConfig {
  message: string
  type: 'success' | 'error'
}

interface UserProfile {
  wallet_balance: number
  withdrawal_otp: string
}

interface BalanceData {
  available_balance: number
  withdrawal_balance: number
  total_balance: number
  currency: string
}

interface LoanData {
  order_number: string
  document_number: string
  status: string
  status_color: string
  status_description: string
  loan_amount?: number
  interest_rate?: number
  loan_period_months?: number
}

export default function WalletPage() {
  // State
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [withdrawalCode, setWithdrawalCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastConfig | null>(null)
  const [activeNav, setActiveNav] = useState('wallet')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [loanData, setLoanData] = useState<LoanData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const withdrawalCodeInputRef = useRef<HTMLInputElement>(null)

  // ============= HELPER FUNCTION TO FORMAT STATUS FOR DISPLAY =============
  // This removes underscores and formats status text for better user experience
  const formatStatusForDisplay = (status: string): string => {
    if (!status) return '';
    
    // Special cases mapping for consistent formatting
    const specialCases: Record<string, string> = {
      'LOAN_APPROVED': 'Loan Approved',
      'LOAN_APPROVED_CONFIRMATION': 'Loan Approved (Confirmation Required)',
      'UNDER_REVIEW': 'Under Review',
      'OTP_GENERATED': 'OTP Code Generated',
      'WITHDRAWAL_PROCESSING': 'Withdrawal Processing',
      'WITHDRAWAL_FAILED': 'Withdrawal Failed',
      'WITHDRAWAL_REJECTED': 'Withdrawal Rejected',
      'WITHDRAWAL_SUCCESSFUL': 'Withdrawal Successful',
      'FUND_FROZEN': 'Fund Frozen',
      'INVALID_BANK_NAME': 'Invalid Bank Name',
      'INVALID_BANK_ACCOUNT': 'Invalid Bank Account',
      'INVALID_BANK_ACCOUNT_FROZEN': 'Invalid Bank Account - Fund Frozen',
      'MISMATCH_BENEFICIARY': 'Mismatch Beneficiary Name',
      'INVALID_ID_CARD': 'Invalid ID Card',
      'ERROR_INFO': 'Error Information',
      'ACCOUNT_LIMIT_REACHED': 'Account Limit Reached',
      'PROCESSING_UNFREEZE': 'Processing Unfreeze',
      'UNFROZEN': 'Unfrozen',
      'LOW_CREDIT_SCORE': 'Low Credit Score',
      'TOP_UP_CREDIT_SCORE': 'Top-up Credit Score',
      'OVERDUE': 'Overdue',
      'TAX': 'Tax',
      'TAX_SETTLED': 'Tax Settled',
      'BANK_INFO_UPDATED': 'Bank Info Updated',
      'PERSONAL_INFO_UPDATED': 'Personal Info Updated',
      'INSURANCE': 'Insurance',
      'GAMBLING': 'Gambling',
      'IRREGULAR_ACTIVITY': 'Irregular Activity Detected',
      'DUPLICATE_APPLICATION': 'Duplicate Application',
      'ACCOUNT_SUSPENDED': 'Account Suspended',
      'ACCOUNT_REACTIVATED': 'Account Reactivated',
      'ACCOUNT_DEACTIVATED': 'Account Deactivated',
      'RENEW_OTP': 'Renew OTP Code'
    };

    // Return special case if it exists
    if (specialCases[status]) {
      return specialCases[status];
    }

    // Generic formatter: LOAN_APPROVED → Loan Approved
    return status
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  // =========================================================================

  const fetchData = useCallback(async () => {
    setFetchError(null)
    try {
      const [profileRes, balanceRes] = await Promise.all([
        fetch('/api/account/profile'),
        fetch('/api/balance/breakdown')
      ])
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setUserProfile(profileData.profile)
      }
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalanceData(balanceData)
      }
      try {
        const statusRes = await fetch('/api/loan-status')
        if (statusRes.ok) {
          const statusData = await statusRes.json()
          if (statusData.loan) {
            const apiLoan = statusData.loan
            setLoanData({
              document_number: apiLoan.documentNumber,
              order_number: apiLoan.documentNumber,
              status: apiLoan.status,
              status_color: apiLoan.statusColor,
              status_description: apiLoan.statusMessage,
              loan_amount: apiLoan.amountRequested,
              interest_rate: apiLoan.interestRate,
              loan_period_months: apiLoan.loanTerm
            })
          } else {
            setLoanData(null)
          }
        } else {
          setFetchError(`Loan status API returned ${statusRes.status}`)
        }
      } catch {
        setFetchError('Failed to fetch loan status')
      }
    } catch {
      setFetchError('Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }))
    fetchData()
  }, [fetchData])

  useRealtimeRefresh(fetchData, { refetchOnVisible: true, intervalMs: 15000, pollOnlyWhenVisible: true })
  
  // Default values if no data
  const balance = userProfile?.wallet_balance || 0
  
  // Get loan data - use EXACT values from the API, no transformations
  const documentNumber = loanData?.document_number || 'N/A'
  
  // Use the EXACT values from the API - no defaults, no transformations
  // This ensures the admin's exact settings are displayed
  const loanStatus = loanData?.status
  const loanStatusDescription = loanData?.status_description
  // CRITICAL FIX: Use the status_color directly from loanData
  // This now comes from apiLoan.statusColor in the mapping above
  const statusHexColor = loanData?.status_color
  
  // Log the final values for debugging
  console.log('[v0] EXACT values from API:', {
    loanStatus,
    loanStatusDescription,
    statusHexColor,
    // Add raw loanData for comparison
    rawLoanData: loanData
  })
  
  // Handle withdrawal code input
  const handleWithdrawalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawalCode(e.target.value)
  }
  
  // Handle withdrawal code submission
  const handleSubmitWithdrawal = async () => {
    if (!withdrawalCode.trim()) {
      showToast('Please enter your withdrawal code', 'error')
      return
    }
    
    if (!userProfile?.wallet_balance) {
      showToast('Unable to verify balance', 'error')
      return
    }
    
    if (!loanData || !loanData.document_number) {
      showToast('Unable to process withdrawal - missing loan information', 'error')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit-withdrawal',
          amount: userProfile.wallet_balance,
          withdrawal_code: withdrawalCode.trim(),
          order_number: loanData.document_number,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        console.error('[v0] Withdrawal error:', result.error)
        showToast(result.error || 'Withdrawal failed', 'error')
        setIsSubmitting(false)
        return
      }
      
      // Success - close modal and show success message
      setShowWithdrawalModal(false)
      setWithdrawalCode('')
      showToast(
        `Withdrawal of ₱${(balanceData?.available_balance || 0).toLocaleString('en-PH', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })} submitted. Please wait for the AI Banking System to process the transfer.`
      )
      
      // Refresh data
      fetchData()
    } catch (error) {
      console.error('[v0] Withdrawal request error:', error)
      showToast('Network error. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle Withdraw Funds button click
  const handleWithdrawClick = () => {
    // Rule 1: Check if user has balance > 0
    if (!balance || balance <= 0) {
      showToast('You have no available balance to withdraw', 'error')
      return
    }
    
    // Rule 2: Check if loan status color is exactly green (#22C55E) as set by admin
    const GREEN_HEX = '#22C55E'
    if (!loanData || !statusHexColor || statusHexColor !== GREEN_HEX) {
      showToast('Your loan status must be approved (green) to withdraw funds', 'error')
      return
    }
    
    // All checks passed - show withdrawal code modal
    setShowWithdrawalModal(true)
  }
  
  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }
  
  // Handle OTP change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpCode(e.target.value)
  }
  
  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error')
      return
    }
    
    setIsVerifying(true)
    
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp_code: otpCode,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        console.error('[v0] OTP verification error:', result.error)
        showToast(result.error || 'OTP verification failed', 'error')
        setIsVerifying(false)
        return
      }
      
      // Success - close modal and show success message
      setShowOTPModal(false)
      setOtpCode('')
      showToast('OTP verified successfully. Your withdrawal request is being processed.')
      
      // Refresh data
      fetchData()
    } catch (error) {
      console.error('[v0] OTP verification request error:', error)
      showToast('Network error. Please try again.', 'error')
    } finally {
      setIsVerifying(false)
    }
  }
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showWithdrawalModal) {
        setShowWithdrawalModal(false)
        setWithdrawalCode('')
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showWithdrawalModal])

  // Focus withdrawal code input when modal opens
  useEffect(() => {
    if (showWithdrawalModal && withdrawalCodeInputRef.current) {
      setTimeout(() => {
        withdrawalCodeInputRef.current?.focus()
      }, 100)
    }
  }, [showWithdrawalModal])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header with KabayanLoan branding - fixed at top */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/home"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
              </Link>
              
              {/* BP Logo and KabayanLoan name */}
              <Link href="/home" className="flex items-center gap-2">
                <div className="w-8 h-8 relative">
                  <Image src={GOVERNMENT_LOGOS.bp} alt="KabayanLoan" width={32} height={32} className="object-contain" />
                </div>
                <span className="text-lg font-black tracking-tight">
                  <span className="text-[#0038A8]">KABAYAN</span>
                  <span className="text-[#CE1126]">LOAN</span>
                </span>
              </Link>
            </div>
            
            {/* Trust Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <Shield className="w-4 h-4 text-[#0038A8]" />
              <span className="text-xs font-medium text-[#0038A8]">SEC Registered</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable area with bottom padding for fixed nav */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pt-4 sm:pt-8 pb-28 md:pb-32">
          {/* Two Balance Cards - Available and Withdrawal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
            {/* Available Balance Card - Philippine Flag Blue */}
            <div className="relative">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0038A8] via-[#0044CC] to-[#0038A8] rounded-2xl opacity-95" />
              
              {/* Glass Effect Overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl" />
              
              {/* Content */}
              <div className="relative p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs sm:text-sm font-medium text-white/90 tracking-wide uppercase">
                    Available Balance
                  </p>
                  <button
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    aria-label="Toggle visibility"
                  >
                    {balanceVisible ? (
                      <Eye className="w-4 h-4 text-white" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                
                {/* Amount */}
                <div className="mb-4">
                  <span className="text-3xl sm:text-4xl font-bold text-white break-words">
                    {balanceVisible 
                      ? `₱${(balanceData?.available_balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '••••••••'}
                  </span>
                  <p className="mt-1 text-xs sm:text-sm text-white/70">
                    For withdrawal
                  </p>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
            </div>
            
            {/* Withdrawal Balance Card - Philippine Flag Red */}
            <div className="relative">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#CE1126] via-[#E51B3A] to-[#CE1126] rounded-2xl opacity-95" />
              
              {/* Glass Effect Overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl" />
              
              {/* Content */}
              <div className="relative p-5 sm:p-6">
                {/* Header */}
                <p className="text-xs sm:text-sm font-medium text-white/90 tracking-wide uppercase mb-3">
                  Withdrawal Balance
                </p>
                
                {/* Amount */}
                <div className="mb-4">
                  <span className="text-3xl sm:text-4xl font-bold text-white break-words">
                    {balanceVisible 
                      ? `₱${(balanceData?.withdrawal_balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '••••••••'}
                  </span>
                  <p className="mt-1 text-xs sm:text-sm text-white/70">
                    Processing by AI Banking System
                  </p>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
            </div>
          </div>

          {/* Withdraw Button - Philippine Flag Gradient */}
          <button
            onClick={handleWithdrawClick}
            disabled={isLoading || !balanceData?.available_balance || statusHexColor !== '#22C55E'}
            className="w-full mb-4 sm:mb-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:hover:scale-100 disabled:active:scale-100"
          >
            <span className="font-semibold tracking-wide">Withdraw Funds</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>

          {/* Loan Progress Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-4 sm:mb-8">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] px-6 md:px-8 py-6 md:py-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FileText className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    Loan Progress
                  </h2>
                  <p className="text-sm text-white/80 mt-1">
                    Current application status & details
                  </p>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Document Number Section */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#0038A8]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Document Number
                  </span>
                </div>
                <div className="text-gray-900 font-mono font-bold tracking-wider break-all">
                  {documentNumber}
                </div>
              </div>

              {/* Status Section - Using EXACT values from admin */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#CE1126]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Status
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {/* Status badge uses EXACT color from admin - no transformation */}
                  {loanStatus && statusHexColor ? (
                    <div 
                      className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full border-2"
                      style={{
                        backgroundColor: `${statusHexColor}20`, // 20% opacity version of the exact color
                        borderColor: statusHexColor,
                        color: statusHexColor
                      }}
                    >
                      <div 
                        className="w-2.5 h-2.5 rounded-full animate-pulse"
                        style={{ backgroundColor: statusHexColor }}
                      />
                      <span className="text-sm font-bold">
                        {/* ===== FIXED: Format status to remove underscores ===== */}
                        {formatStatusForDisplay(loanStatus)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No active loan</div>
                  )}
                  
                  {/* Description uses EXACT message from admin */}
                  {loanStatusDescription && (
                    <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                      {loanStatusDescription}
                    </div>
                  )}
                </div>
              </div>

              {/* Government Logos */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-8 h-8 relative opacity-70">
                    <Image src={GOVERNMENT_LOGOS.sec} alt="SEC" width={32} height={32} className="object-contain" />
                  </div>
                  <div className="w-8 h-8 relative opacity-70">
                    <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={32} height={32} className="object-contain" />
                  </div>
                  <div className="w-8 h-8 relative opacity-70">
                    <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={32} height={32} className="object-contain" />
                  </div>
                  <span className="text-xs text-gray-400">Government Accredited</span>
                </div>
              </div>
            </div>
            
            {/* Card Footer */}
            <div className="px-6 md:px-8 py-4 border-t border-gray-100 bg-gray-50/30">
              <p className="text-xs text-gray-500 text-center">
                Last updated: {lastUpdated || 'Loading...'}
              </p>
              {fetchError && (
                <p className="text-xs text-red-500 text-center mt-1">
                  Debug: {fetchError}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation - Fixed at bottom, always visible */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 py-4 border-t border-gray-100">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link
            href="/home"
            onClick={() => setActiveNav('home')}
            className={`flex flex-col items-center px-8 py-2 rounded-lg transition-all ${
              activeNav === 'home' 
                ? 'text-[#0038A8] bg-[rgba(0,56,168,0.05)]' 
                : 'text-[#6C757D] hover:text-[#0038A8]'
            }`}
          >
            <Home className={`w-7 h-7 mb-1 transition-transform ${activeNav === 'home' ? 'scale-110' : ''}`} />
            <span className="text-xs font-semibold">HOME</span>
          </Link>

          <Link
            href="/wallet"
            onClick={() => setActiveNav('wallet')}
            className={`flex flex-col items-center px-8 py-2 rounded-lg transition-all ${
              activeNav === 'wallet' 
                ? 'text-[#0038A8] bg-[rgba(0,56,168,0.05)]' 
                : 'text-[#6C757D] hover:text-[#0038A8]'
            }`}
          >
            <Wallet className={`w-7 h-7 mb-1 transition-transform ${activeNav === 'wallet' ? 'scale-110' : ''}`} />
            <span className="text-xs font-semibold">WALLET</span>
          </Link>

          <Link
            href="/my-account"
            onClick={() => setActiveNav('account')}
            className={`flex flex-col items-center px-8 py-2 rounded-lg transition-all ${
              activeNav === 'account' 
                ? 'text-[#0038A8] bg-[rgba(0,56,168,0.05)]' 
                : 'text-[#6C757D] hover:text-[#0038A8]'
            }`}
          >
            <User className={`w-7 h-7 mb-1 transition-transform ${activeNav === 'account' ? 'scale-110' : ''}`} />
            <span className="text-xs font-semibold">ACCOUNT</span>
          </Link>
        </div>
      </nav>
      
      {/* Withdrawal Code Modal */}
      {showWithdrawalModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setShowWithdrawalModal(false)
            setWithdrawalCode('')
          }}
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 p-3 sm:p-6 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center flex-shrink-0">
                  <div className="w-5 sm:w-6 h-5 sm:h-6 rounded bg-gradient-to-br from-[#0038A8] to-[#CE1126] flex items-center justify-center">
                    <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Verify Withdrawal Code
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Enter your withdrawal code to confirm
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
              <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                Enter the OTP Code provided by Finance Department to submit for your withdrawal request
              </p>

              {/* OTP Code Input */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-4">
                  OTP Code
                </label>
                <input
                  ref={withdrawalCodeInputRef}
                  type="text"
                  placeholder="Please Enter the OTP Code"
                  value={withdrawalCode}
                  onChange={handleWithdrawalCodeChange}
                  className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:border-[#0038A8] focus:outline-none transition-colors text-base sm:text-lg font-semibold text-center tracking-widest"
                  autoFocus
                />
              </div>
              
              {/* Withdrawal Amount Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-red-50 border border-[#0038A8]/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Withdrawal Amount</p>
                <p className="text-lg sm:text-2xl font-bold text-[#0038A8] break-words">
                  ₱{balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-3 sm:p-6 border-t border-gray-100 bg-white">
              <button
                onClick={() => {
                  setShowWithdrawalModal(false)
                  setWithdrawalCode('')
                }}
                className="flex-1 py-2.5 sm:py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-95 text-xs sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitWithdrawal}
                disabled={isSubmitting || !withdrawalCode.trim()}
                className="flex-1 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 animate-spin flex-shrink-0" />
                    <span className="hidden sm:inline">Submitting...</span>
                  </>
                ) : (
                  'Submit Withdrawal'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setShowOTPModal(false)
            setOtpCode('')
          }}
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 p-3 sm:p-6 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center flex-shrink-0">
                  <div className="w-5 sm:w-6 h-5 sm:h-6 rounded bg-gradient-to-br from-[#0038A8] to-[#CE1126] flex items-center justify-center">
                    <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Verify OTP Code
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Enter your OTP code to confirm
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
              <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                Enter the OTP Code provided by Finance Department to submit for your withdrawal request
              </p>

              {/* OTP Code Input */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-4">
                  OTP Code
                </label>
                <input
                  type="text"
                  placeholder="Please Enter the OTP Code"
                  value={otpCode}
                  onChange={handleOtpChange}
                  className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:border-[#0038A8] focus:outline-none transition-colors text-base sm:text-lg font-semibold text-center tracking-widest"
                  autoFocus
                />
              </div>
              
              {/* Withdrawal Amount Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-red-50 border border-[#0038A8]/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Withdrawal Amount</p>
                <p className="text-lg sm:text-2xl font-bold text-[#0038A8] break-words">
                  ₱{balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-3 sm:p-6 border-t border-gray-100 bg-white">
              <button
                onClick={() => {
                  setShowOTPModal(false)
                  setOtpCode('')
                }}
                className="flex-1 py-2.5 sm:py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-95 text-xs sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={isVerifying || otpCode.length !== 6}
                className="flex-1 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-base"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 animate-spin flex-shrink-0" />
                    <span className="hidden sm:inline">Verifying...</span>
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-xl backdrop-blur-sm border ${
          toast.type === 'success' 
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' 
            : 'bg-red-50/95 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
