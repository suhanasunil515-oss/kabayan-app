'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X, ChevronRight, Shield, CheckCircle, Lock, Calendar, PiggyBank, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApplicationProgress, getSmartRedirectPath, type UserVerification } from '@/lib/application-progress'
import type { LoanApplication } from '@/lib/application-progress'
import { formatPHP, getInterestRateByTerm, getLoanAmountError, CURRENCY_CONFIG } from '@/lib/currency'
import { calculateMonthlyPayment } from '@/utils/loanCalculations'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

export const dynamic = 'force-dynamic'

interface User {
  id: number
  phone_number: string
  full_name: string
  credit_score: number
  wallet_balance: number
}

export default function LoanApplicationPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [existingApplication, setExistingApplication] = useState<LoanApplication | null>(null)
  const [userVerification, setUserVerification] = useState<UserVerification | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    amount: 100000,
    term: 6,
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchUserAndApplication = async () => {
      try {
        const userResponse = await fetch('/api/user')
        if (!userResponse.ok) {
          router.push('/login')
          return
        }
        const userData = await userResponse.json()
        setUser(userData.user)

        const verificationResponse = await fetch('/api/user?action=get_verification_status')
        if (verificationResponse.ok) {
          const verData = await verificationResponse.json()
          setUserVerification(verData.verification)
        }

        const appResponse = await fetch('/api/loans?action=get_user_application')
        if (appResponse.ok) {
          const appData = await appResponse.json()
          if (appData.application) {
            setExistingApplication(appData.application)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndApplication()
  }, [router])

  // If user has an existing application, show message and next steps
  if (!isLoading && existingApplication) {
    const progress = getApplicationProgress(existingApplication, userVerification)
    const stepsStatusMap: Record<string, string> = {
      'kyc-upload': 'Your loan is confirmed. Please complete KYC verification.',
      'personal-information': 'Please complete your personal information.',
      'bank-information': 'Please add your bank account details.',
      signature: 'Please sign the loan agreement.',
      'application-complete': 'Your application is complete!',
    }
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef]">
        {/* Header */}
        <header className="bg-white border-b border-[#e9ecef] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-40">
          <div className="px-4 py-4 flex items-center gap-4 max-w-4xl mx-auto w-full">
            <Link
              href="/home"
              className="flex items-center gap-2 text-[#0038A8] hover:text-[#002c86] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image src={GOVERNMENT_LOGOS.bp} alt="KabayanLoan" width={32} height={32} className="object-contain" />
              </div>
              <h1 className="text-lg font-bold text-[#212529]">Loan Application</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-8 max-w-2xl mx-auto">
          <div className="bg-white border border-[#e9ecef] rounded-2xl p-6 shadow-lg">
            <div className="bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 border border-[#0038A8]/30 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold text-[#212529] mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0038A8]" />
                Application Already Submitted
              </h2>
              <p className="text-sm text-[#6C757D] mb-4">
                Your loan application is already submitted and under review.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${progress.isKYCComplete ? 'bg-[#00A86B] text-white' : 'bg-[#6C757D] text-white'}`}>
                    {progress.isKYCComplete ? '✓' : '1'}
                  </span>
                  <span className="text-sm text-[#212529]">KYC Verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${progress.isPersonalInfoComplete ? 'bg-[#00A86B] text-white' : 'bg-[#6C757D] text-white'}`}>
                    {progress.isPersonalInfoComplete ? '✓' : '2'}
                  </span>
                  <span className="text-sm text-[#212529]">Personal Information</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${progress.isBankInfoComplete ? 'bg-[#00A86B] text-white' : 'bg-[#6C757D] text-white'}`}>
                    {progress.isBankInfoComplete ? '✓' : '3'}
                  </span>
                  <span className="text-sm text-[#212529]">Bank Information</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${progress.isSignatureComplete ? 'bg-[#00A86B] text-white' : 'bg-[#6C757D] text-white'}`}>
                    {progress.isSignatureComplete ? '✓' : '4'}
                  </span>
                  <span className="text-sm text-[#212529]">Signature</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#6C757D] mb-6">
              {stepsStatusMap[progress.currentStep]}
            </p>

            <div className="flex gap-3">
              <Link href="/home" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-[#e9ecef] text-[#212529] hover:bg-[#f8f9fa] hover:border-[#0038A8]/30 rounded-xl"
                >
                  Back to Home
                </Button>
              </Link>
              <Link href={`/${progress.nextStep}`} className="flex-1">
                <Button 
                  className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Continue Application
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#0038A8] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#6C757D]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Allow empty string while typing
    if (value === '') {
      setFormData((prev) => ({ ...prev, amount: 0 }))
      return
    }
    
    const numValue = parseInt(value)
    
    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      setFormData((prev) => ({ ...prev, amount: numValue }))
    }
  }

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // If empty, show error
    if (value === '') {
      setErrors((prev) => ({ 
        ...prev, 
        amount: `Minimum loan amount is ₱${CURRENCY_CONFIG.MIN_LOAN.toLocaleString()}` 
      }))
      return
    }
    
    const numValue = parseInt(value)
    
    // Check if below minimum
    if (numValue < CURRENCY_CONFIG.MIN_LOAN) {
      setErrors((prev) => ({ 
        ...prev, 
        amount: `Minimum loan amount is ₱${CURRENCY_CONFIG.MIN_LOAN.toLocaleString()}` 
      }))
      setFormData((prev) => ({ ...prev, amount: CURRENCY_CONFIG.MIN_LOAN }))
    } 
    // Check if above maximum
    else if (numValue > CURRENCY_CONFIG.MAX_LOAN) {
      setErrors((prev) => ({ 
        ...prev, 
        amount: `Maximum loan amount is ₱${CURRENCY_CONFIG.MAX_LOAN.toLocaleString()}` 
      }))
      setFormData((prev) => ({ ...prev, amount: CURRENCY_CONFIG.MAX_LOAN }))
    }
    // Valid amount
    else {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.amount
        return newErrors
      })
    }
  }

  const handleTermChange = (term: number) => {
    setFormData((prev) => ({ ...prev, term }))
  }

  // Calculate loan info
  const interestRate = getInterestRateByTerm(formData.term)
  const monthlyPayment = calculateMonthlyPayment(formData.amount, interestRate, formData.term)
  const monthlyPrincipal = formData.amount / formData.term
  const monthlyInterest = (formData.amount * interestRate) / 100
  const monthlyAmortization = monthlyPayment
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate amount before submitting
      if (formData.amount < CURRENCY_CONFIG.MIN_LOAN) {
        setErrors({ amount: `Minimum loan amount is ₱${CURRENCY_CONFIG.MIN_LOAN.toLocaleString()}` })
        setIsSubmitting(false)
        return
      }

      const amountError = getLoanAmountError(formData.amount)
      if (amountError) {
        setErrors({ amount: amountError })
        setIsSubmitting(false)
        return
      }

      const documentNumber = `DOC-${Date.now()}-${user?.id}`
      const interestRate = getInterestRateByTerm(formData.term)

      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          documentNumber,
          amountRequested: formData.amount,
          loanTermMonths: formData.term,
          interestRate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ api: data.error || 'Failed to create loan application' })
        setIsSubmitting(false)
        return
      }

      // Success - redirect to KYC upload
      router.push('/kyc-upload')
    } catch (error) {
      console.error('Error submitting loan:', error)
      setErrors({ api: 'An error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-8">
      {/* Header */}
      <header className="bg-white border-b border-[#e9ecef] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/home"
              className="flex items-center gap-2 text-[#0038A8] hover:text-[#002c86] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
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
                <p className="text-xs text-gray-500">Loan Application</p>
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

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#212529] mb-1">
            Hello, {user?.full_name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-[#6C757D]">Let's find the right loan for you</p>
        </div>

        {/* STEP 1: LOAN SELECTION */}
        <div className="bg-white border border-[#e9ecef] rounded-2xl p-6 shadow-lg mb-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-full flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <h2 className="text-xl font-bold text-[#212529]">Choose your loan</h2>
          </div>

          {/* LOAN AMOUNT */}
          <div className="mb-8">
            <Label className="block text-base font-semibold text-[#212529] mb-3 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-[#0038A8]" />
              Enter the amount you need to borrow
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#212529] text-lg font-semibold">
                ₱
              </span>
              <Input
                type="number"
                value={formData.amount === 0 ? '' : formData.amount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                min={CURRENCY_CONFIG.MIN_LOAN}
                max={CURRENCY_CONFIG.MAX_LOAN}
                step="1000"
                className="bg-white border-2 border-[#e9ecef] pl-10 text-lg font-semibold h-14 rounded-xl transition-colors focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20"
                placeholder="Enter amount"
              />
            </div>
            
            {/* Min and Max Labels with spacing */}
            <div className="flex justify-between text-xs text-[#6C757D] mt-2 px-1">
              <span className="font-medium">Min: ₱100,000</span>
              <span className="font-medium">Max: ₱5,000,000</span>
            </div>
            
            {/* Error Message with Alert Icon */}
            {errors.amount && (
              <div className="flex items-start gap-2 mt-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{errors.amount}</p>
              </div>
            )}
          </div>

          {/* LOAN TERM */}
          <div className="mb-8">
            <Label className="block text-base font-semibold text-[#212529] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#CE1126]" />
              Loan term
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[6, 12, 24, 36].map((term) => (
                <button
                  key={term}
                  onClick={() => handleTermChange(term)}
                  className={`py-4 px-4 rounded-xl font-semibold transition-all border-2 ${
                    formData.term === term
                      ? 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white border-transparent shadow-md'
                      : 'bg-[#f8f9fa] text-[#212529] border-[#e9ecef] hover:border-[#0038A8]/50'
                  }`}
                >
                  {term} months
                </button>
              ))}
            </div>
          </div>

          {/* LOAN INFORMATION TABLE - Only show if amount is valid */}
          {formData.amount >= CURRENCY_CONFIG.MIN_LOAN && formData.amount <= CURRENCY_CONFIG.MAX_LOAN && (
            <div className="mb-8">
              <h3 className="text-base font-semibold text-[#212529] mb-4">Loan information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-3 border-b border-[#e9ecef]">
                  <span className="text-[#6C757D]">Amount:</span>
                  <span className="font-semibold text-[#212529]">
                    {formatPHP(formData.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#e9ecef]">
                  <span className="text-[#6C757D]">Monthly interest rate:</span>
                  <span className="font-semibold text-[#212529]">
                    {(interestRate).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#e9ecef]">
                  <span className="text-[#6C757D]">Loan term:</span>
                  <span className="font-semibold text-[#212529]">
                    {formData.term} months
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#e9ecef]">
                  <span className="text-[#6C757D]">Monthly principal:</span>
                  <span className="font-semibold text-[#212529]">
                    {formatPHP(monthlyPrincipal)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#e9ecef]">
                  <span className="text-[#6C757D]">Monthly interest:</span>
                  <span className="font-semibold text-[#212529]">
                    {formatPHP(monthlyInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 px-4 mt-4 bg-gradient-to-r from-[#0038A8]/5 to-[#CE1126]/5 rounded-xl border border-[#0038A8]/20">
                  <span className="font-bold text-[#212529] text-base">Monthly amortization:</span>
                  <span className="font-bold text-[#0038A8] text-xl">
                    {formatPHP(monthlyAmortization)}
                  </span>
                </div>
                <p className="text-xs text-[#6C757D] italic mt-3">
                  (Estimate, subject to contract)
                </p>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[#6C757D]">Application date:</span>
                  <span className="font-semibold text-[#212529]">{today}</span>
                </div>
              </div>
            </div>
          )}

          {/* CONFIRMATION BUTTON - Disabled if amount is invalid */}
          <Button
            onClick={() => setShowConfirmation(true)}
            disabled={formData.amount < CURRENCY_CONFIG.MIN_LOAN || formData.amount > CURRENCY_CONFIG.MAX_LOAN || formData.amount === 0}
            className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Confirm Loan</span>
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Secure & Trust Card - Updated with real logo images */}
        <div className="bg-white border border-[#e9ecef] rounded-2xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-[#212529] mb-2">Secure & Trusted</h3>
            <p className="text-sm text-[#6C757D]">Your information is protected</p>
          </div>
          <div className="flex justify-center items-center gap-8">
            {/* SEC Logo */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-2 p-2 shadow-sm border border-gray-100">
                <Image 
                  src={GOVERNMENT_LOGOS.sec} 
                  alt="SEC" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium text-[#212529]">SEC Registered</span>
            </div>
            
            {/* BSP Logo */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-2 p-2 shadow-sm border border-gray-100">
                <Image 
                  src={GOVERNMENT_LOGOS.bsp} 
                  alt="BSP" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium text-[#212529]">BSP Supervised</span>
            </div>
            
            {/* DMW Logo */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-2 p-2 shadow-sm border border-gray-100">
                <Image 
                  src={GOVERNMENT_LOGOS.dmw} 
                  alt="DMW" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium text-[#212529]">DMW Accredited</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            KabayanLoan is SEC Registered, BSP Supervised, and DMW Accredited
          </p>
        </div>
      </main>

      {/* CONFIRMATION MODAL */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative border border-[#e9ecef]">
            {/* Close Button */}
            <button
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
              className="absolute top-5 right-5 text-[#6C757D] hover:text-[#212529] disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#212529]">Confirm Your Loan</h3>
            </div>

            {/* Error Message */}
            {errors.api && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-red-600 font-medium">{errors.api}</p>
              </div>
            )}

            {/* Loan Details */}
            <div className="bg-gradient-to-r from-[#f8f9fa] to-[#f0f8ff] rounded-xl p-4 mb-6">
              <p className="text-center mb-3 text-[#212529]">
                <span className="font-bold text-lg">₱{formatPHP(formData.amount).replace('₱', '')}</span> for {formData.term} months
              </p>
              <div className="space-y-2 text-sm border-t border-[#e9ecef] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Monthly amortization:</span>
                  <span className="font-semibold text-[#212529]">
                    {formatPHP(monthlyAmortization)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Total amount:</span>
                  <span className="font-semibold text-[#212529]">
                    {formatPHP(monthlyAmortization * formData.term)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Application date:</span>
                  <span className="font-semibold text-[#212529]">{today}</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1 border-2 border-[#e9ecef] text-[#212529] hover:bg-[#f8f9fa] hover:border-[#0038A8]/30 rounded-xl disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Confirming...
                  </>
                ) : (
                  'Confirm & Continue'
                )}
              </Button>
            </div>
            
            {/* Note */}
            <p className="text-xs text-[#6C757D] text-center mt-4">
              You'll proceed to KYC verification after confirmation
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
