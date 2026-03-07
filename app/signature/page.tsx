'use client'

import React from "react"
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RotateCcw, FileText, CheckCircle, AlertCircle, Loader2, Shield, PenSquare, X, Pen } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { LoanApplication } from '@/lib/application-progress'
import { formatPHP, getInterestRateByTerm } from '@/lib/currency'
import { calculateMonthlyPayment } from '@/utils/loanCalculations'
import { generateFullContract, DEFAULT_CONTRACT_TEMPLATE } from '@/lib/contract-generator'
import Image from 'next/image'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface User {
  id: number
  phone_number: string
  full_name: string
  id_card_number?: string
}

interface PersonalInfo {
  full_name?: string
  id_card_number?: string
  phone_number?: string
  living_address?: string
  email?: string
  facebook_name?: string
  company_name?: string
  position?: string
  seniority?: string
  monthly_income?: number
  unit_address?: string
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  contact_person2?: {
    name: string
    phone: string
    relationship: string
  }
}

interface ContractData {
  amount: number
  term: number
  monthlyPayment: number
  interestRate: number
}

export default function SignaturePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showContract, setShowContract] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [contractFullText, setContractFullText] = useState('')
  const [contractHeader, setContractHeader] = useState<any>(null)
  const [error, setError] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null)

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

        const appResponse = await fetch('/api/loans?action=get_user_application')
        if (appResponse.ok) {
          const appData = await appResponse.json()
          if (appData.application) {
            // Check if already signed
            if (appData.application.is_signed || appData.application.signature_url) {
              console.log('[v0] Application already signed, redirecting...');
              router.push('/application-complete');
              return;
            }

            setApplication(appData.application)

            // Get personal information for contract
            const personalInfoResponse = await fetch('/api/account/personal-info')
            if (personalInfoResponse.ok) {
              const personalData = await personalInfoResponse.json()
              setPersonalInfo(personalData)
            }

            // Calculate contract data using proper amortization formula
            const interestRate = getInterestRateByTerm(appData.application.loan_term_months)
            const monthlyPayment = calculateMonthlyPayment(
              appData.application.amount_requested,
              interestRate,
              appData.application.loan_term_months
            )
            setContractData({
              amount: appData.application.amount_requested,
              term: appData.application.loan_term_months,
              monthlyPayment,
              interestRate,
            })

            // Generate full 10-article contract using the contract generator
            const borrowerName = personalInfo?.full_name || userData.user.full_name || 'Borrower'
            const borrowerId = personalInfo?.id_card_number || userData.user.id_card_number || ''
            const borrowerPhone = userData.user.phone_number

            const contractGenerated = generateFullContract({
              borrower_name: borrowerName,
              id_number: borrowerId,
              phone_number: borrowerPhone,
              loan_amount: appData.application.amount_requested,
              interest_rate: interestRate,
              loan_period_months: appData.application.loan_term_months,
              bank_name: 'KabayanLoan'
            })

            setContractFullText(contractGenerated.full_document)
            setContractHeader(contractGenerated.header)
            console.log('[v0] Contract generated with header:', contractGenerated.header)
          } else {
            router.push('/loan-application')
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndApplication()
  }, [router])

  // Initialize canvas with touch support
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up high-resolution canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#e9ecef'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsSigning(true)
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (!touch) return

    setIsSigning(true)
    setIsDrawing(true)

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    setTouchPosition({ x, y })
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const touch = e.touches[0]
    if (!touch) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
    setTouchPosition({ x, y })
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(false)
    setTouchPosition(null)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const resetSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#e9ecef'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    setIsSigning(false)
    setError('')
  }

  const compressSignature = (canvas: HTMLCanvasElement): string => {
    // Create a temporary canvas for resizing
    const resizedCanvas = document.createElement('canvas')
    const ctx = resizedCanvas.getContext('2d')

    if (!ctx) return canvas.toDataURL('image/png')

    // Resize to max 300px width while maintaining aspect ratio
    const maxWidth = 300
    const scale = maxWidth / canvas.width
    resizedCanvas.width = maxWidth
    resizedCanvas.height = canvas.height * scale

    // Draw with white background and smooth lines
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, resizedCanvas.width, resizedCanvas.height)
    ctx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height)

    // Use PNG for signatures (preserves sharp lines)
    const compressedData = resizedCanvas.toDataURL('image/png')

    console.log('[v0] Original signature size:', Math.round(canvas.toDataURL('image/png').length / 1024), 'KB')
    console.log('[v0] Compressed signature size:', Math.round(compressedData.length / 1024), 'KB')

    return compressedData
  }

  const handleConfirmSignature = async () => {
    if (!isSigning) {
      setError('Please sign the document')
      return
    }

    if (!application) {
      setError('Application not found')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const canvas = canvasRef.current
      if (!canvas) {
        setError('Signature canvas not found')
        setIsSubmitting(false)
        return
      }

      // Compress the signature to reduce size
      const signatureData = compressSignature(canvas)

      // Submit signature via the dedicated update-signature endpoint
      const response = await fetch('/api/loans/update-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          signatureUrl: signatureData,
          isSigned: true,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[v0] Signature update failed:', responseData)
        setError(responseData.error || 'Failed to sign application')
        setIsSubmitting(false)
        return
      }

      console.log('[v0] Signature saved successfully:', responseData)

      // Mark signature as completed via API
      await fetch('/api/users/mark-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'signature',
        }),
      }).catch((err) => console.error('Error marking signature verification:', err))

      // Navigate to application-complete page
      router.push('/application-complete')
    } catch (err) {
      console.error('Sign error:', err)
      setError('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
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

  if (!user || !application || !contractData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-8">
      {/* Header */}
      <header className="bg-white border-b border-[#e9ecef] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/bank-information"
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
                <p className="text-xs text-gray-500">Sign Agreement</p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-[#0038A8]" />
            <span className="text-xs font-medium text-[#0038A8]">• SEC Registered</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">
            <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
              Sign Your Loan Agreement
            </span>
          </h1>
          <p className="text-[#6C757D]">Review and sign to complete your application</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-6 h-2 bg-[#0038A8] rounded-full"></div>
          <div className="w-6 h-2 bg-[#0038A8] rounded-full"></div>
          <div className="w-6 h-2 bg-[#0038A8] rounded-full"></div>
          <div className="w-2 h-2 bg-[#e9ecef] rounded-full"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Professional Contract Card */}
        <div className="bg-white border-2 border-[#e9ecef] rounded-2xl p-6 shadow-lg mb-6 font-serif">
          {/* Contract Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-[#0038A8]/20">
            <h2 className="text-xl md:text-2xl font-bold text-[#0038A8]">LOAN AGREEMENT</h2>
            <p className="text-xs text-gray-500 mt-1">Document No: {application?.document_number} • SEC Registered</p>
          </div>

          {/* Loan Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-red-50 border border-[#0038A8]/20 rounded-xl p-5 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Loan Amount</p>
                <p className="text-lg font-bold text-[#0038A8]">{formatPHP(contractData.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Loan Term</p>
                <p className="text-lg font-bold text-[#212529]">{contractData.term} months</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Monthly Payment</p>
                <p className="text-lg font-bold text-[#CE1126]">{formatPHP(contractData.monthlyPayment)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Interest Rate</p>
                <p className="text-lg font-bold text-[#212529]">{contractData.interestRate}%</p>
              </div>
            </div>
          </div>

          {/* View Full Contract Button */}
          <Button
            onClick={() => setShowContract(true)}
            className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-6"
          >
            <FileText className="w-5 h-5 mr-2" />
            View Loan Contract (10 Articles)
          </Button>

          {/* Signature Section */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-full flex items-center justify-center">
                <Pen className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#212529]">Borrower's Signature</h3>
            </div>

            <div className="border-2 border-[#e9ecef] rounded-xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className="w-full h-48 touch-none cursor-crosshair"
              />
            </div>
            <p className="text-sm text-[#6C757D] text-center">Draw your signature above using your finger or mouse</p>
          </div>

          {/* Reset Button */}
          <Button
            onClick={resetSignature}
            className="w-full border-2 border-[#e9ecef] hover:border-[#0038A8] text-[#212529] hover:text-[#0038A8] bg-white hover:bg-[#f8f9fa] font-medium py-3 rounded-xl transition-all duration-300 mb-4"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset Signature
          </Button>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirmSignature}
            disabled={isSubmitting || !isSigning}
            className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm Signature & Submit
              </>
            )}
          </Button>

          {/* Legal Notice */}
          <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-xl p-4 mt-6">
            <p className="text-xs text-[#6C757D] text-center">
              <strong>Important:</strong> By signing above, you agree to all terms and conditions outlined in the 10-article loan agreement. This electronic signature is legally binding under Philippine law.
            </p>
          </div>
        </div>
      </main>

      {/* Contract Modal - Professional OFW Loan Contract Design */}
      {showContract && contractFullText && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] overflow-hidden">

            {/* Modal Header with X button */}
            <div className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white px-3 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 relative">
              {/* X Close Button - Always visible */}
              <button
                onClick={() => setShowContract(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1 sm:p-1.5 transition-colors z-20"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 pr-8">
                {/* Logo and Title Section */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  {/* Company Logo - BP Logo */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 p-1 sm:p-1.5 md:p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
                    <img
                      src={GOVERNMENT_LOGOS.bp}
                      alt="KabayanLoan Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                      OFW LOAN AGREEMENT
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm mt-0.5 truncate">
                      KabayanLoan • SEC Registered • BSP Supervised
                    </p>
                  </div>
                </div>

                {/* Document Number - Full document number */}
                <div className="flex items-center justify-start sm:justify-end">
                  <div className="bg-white/10 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2">
                    <p className="text-[10px] sm:text-xs font-medium text-white/80">Document No.</p>
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg font-mono font-bold text-white break-all">
                      {application?.document_number || contractHeader?.document_number || 'DOC-XXXXXX'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(98vh-140px)] sm:max-h-[calc(95vh-160px)] md:max-h-[calc(90vh-180px)] bg-[#fafafa]">

              {/* Watermarked Background */}
              <div className="relative">
                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                  <img
                    src={GOVERNMENT_LOGOS.bp}
                    alt="KabayanLoan Watermark"
                    className="w-48 sm:w-56 md:w-64 lg:w-80 xl:w-96 h-auto opacity-20"
                  />
                </div>

                <div className="relative space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 font-serif text-gray-800 text-xs sm:text-sm md:text-base">

                  {/* Contract Header - Lender and Borrower */}
                  {contractHeader && (
                    <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#0038A8] mb-2 sm:mb-3 md:mb-4 pb-1 sm:pb-2 border-b border-gray-200">
                        PARTIES TO THIS AGREEMENT
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6 md:gap-8">
                        {/* Lender Section - OFW Loan Department */}
                        <div className="space-y-1 flex-1">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">LENDER</p>
                          <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">OFW LOAN DEPARTMENT</p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 break-words">Unit 801, 8th Floor, Bank of Makati Building</p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 break-words">Ayala Avenue Ext. cor. Metropolitan Avenue</p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 break-words">Fourth District, National Capital Region (NCR), 1209</p>

                          {/* Government Logos */}
                          <div className="flex gap-1 sm:gap-1.5 md:gap-2 mt-2 sm:mt-3 md:mt-4 flex-wrap">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8">
                              <img src={GOVERNMENT_LOGOS.dof} alt="DOF" className="w-full h-full object-contain" />
                            </div>
                            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8">
                              <img src={GOVERNMENT_LOGOS.bsp} alt="BSP" className="w-full h-full object-contain" />
                            </div>
                            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8">
                              <img src={GOVERNMENT_LOGOS.sec} alt="SEC" className="w-full h-full object-contain" />
                            </div>
                            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8">
                              <img src={GOVERNMENT_LOGOS.dmw} alt="DMW" className="w-full h-full object-contain" />
                            </div>
                          </div>
                        </div>

                        {/* Borrower Section */}
                        <div className="space-y-1 flex-1 text-left sm:text-right">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">BORROWER</p>
                          <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base break-words">
                            {contractHeader.borrower_name}
                          </p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 break-words">
                            ID: {user?.id_card_number || personalInfo?.id_card_number || contractHeader?.id_number || 'N/A'}
                          </p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 break-words">
                            Phone: {contractHeader.phone_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loan Terms Summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-red-50 border border-[#0038A8]/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#0038A8] mb-2 sm:mb-3 md:mb-4">
                      LOAN TERMS SUMMARY
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 sm:border-0">
                        <span className="text-xs font-medium text-gray-600">Principal Amount:</span>
                        <span className="text-sm font-bold text-[#0038A8]">{contractHeader?.loan_amount}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 sm:border-0">
                        <span className="text-xs font-medium text-gray-600">Interest Rate:</span>
                        <span className="text-sm font-bold">{contractHeader?.interest_rate}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 sm:border-0">
                        <span className="text-xs font-medium text-gray-600">Loan Term:</span>
                        <span className="text-sm font-bold">{contractHeader?.loan_period}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 sm:border-0">
                        <span className="text-xs font-medium text-gray-600">Monthly Payment:</span>
                        <span className="text-sm font-bold text-[#CE1126]">{formatPHP(contractData?.monthlyPayment || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 sm:col-span-2">
                        <span className="text-xs font-medium text-gray-600">Total Repayment:</span>
                        <span className="text-sm font-bold text-[#CE1126]">
                          {formatPHP((contractData?.monthlyPayment || 0) * (contractData?.term || 1))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contract Articles - Professional Legal Format */}
                  <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#0038A8] mb-3 sm:mb-4 md:mb-5 lg:mb-6 pb-1 sm:pb-2 border-b border-gray-200">
                      TERMS AND CONDITIONS
                    </h3>

                    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                      {/* Article 1 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#0038A8]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 1: LOAN FORM</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                          Loan Form: Use an unsecured ID card to request a loan.
                        </p>
                      </div>

                      {/* Article 2 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#CE1126]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 2: PREMIUM INTEREST RATE</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                          Premium interest rate: Interest rates, fines, service charges or any fees, Total not more than 25% per year or such lower rate as required by applicable Philippine laws and regulations (including SEC rules for small loans). Interest shall be simple on the outstanding balance and fully disclosed.
                        </p>
                      </div>

                      {/* Article 3 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#00A86B]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 3: BORROWER'S OBLIGATIONS</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed mb-1 sm:mb-2">
                          During the loan tenure, the borrower has to:
                        </p>
                        <ul className="list-disc ml-4 sm:ml-5 md:ml-6 lg:ml-8 text-[11px] sm:text-xs md:text-sm text-gray-700 space-y-0.5 sm:space-y-1">
                          <li>Pay interest at the same time.</li>
                          <li>To give capital on time.</li>
                          <li>If it is not possible to borrow money from the account due to borrower's problem, the borrower should cooperate with the lender to finalize the payment.</li>
                          <li>Comply with all the terms of the contract.</li>
                          <li>Use the loan only for lawful purposes.</li>
                        </ul>
                      </div>

                      {/* Article 4 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#0038A8]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 4: LOAN TERMS AND CONDITIONS</h4>
                        <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[11px] sm:text-xs md:text-sm text-gray-700">
                          <p>(1) In case the borrower online without using collateral, the lender is at risk of lending, The borrower must have a loan quarantee to check the liquidity of the borrower's personal loan minimum repayment. Must be verified for financial liquidity.</p>
                          <p>(2) In case the borrower online without using collateral, the lender is at risk oflending. Borrowers must show their financial status to the company to confirm theirability to repay their debt by 5%-10%. The borrower will withdraw the full amount of the loan account.</p>
                          <p>(3) After signing this contract, both the borrow and the lender must comply with all requirements of the contract. If either party breaches the contract, the other party has the right to sue in the court. The party not complying with this will have to pay a fine of 50 percent of the installment amount if it does not object.</p>
                          <p>(4) In the event that the credit transfer cannot be resolved due to the problems of the borrower, the lender has the right to request the borrower to assist in handling it. After completing this operation, the lender has to transfer the funds.</p>
                          <p>(5) The borrower shall repay the loan principal and interest within the period specified in the contract. If the borrower wants to apply for loan extension, he/she has to disburse it 5 days before the contract period.</p>
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 sm:p-2.5 md:p-3 lg:p-4 mt-2 sm:mt-2.5 md:mt-3">
                            <p className="text-yellow-800 font-semibold text-[11px] sm:text-xs md:text-sm">(6) If the borrower does not repay on time on the stipulated repayment date, penalty interest will be calculated after three days at 0.5% per day.</p>
                          </div>
                        </div>
                      </div>

                      {/* Article 5 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#CE1126]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 5: LENDING CONSIDERATIONS</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed mb-1 sm:mb-2">
                          Lending: Before granting a loan, the lender has the right to consider the following matters and take a decision to grant the loan as resuld of the review:
                        </p>
                        <ul className="list-disc ml-4 sm:ml-5 md:ml-6 lg:ml-8 text-[11px] sm:text-xs md:text-sm text-gray-700 space-y-0.5 sm:space-y-1">
                          <li>The borrow has entered into this Agreement Completion of legal formalities (if any) relating to the loan under the Act, such as regulatory delivery of government permits, approvals, registrations and relevant laws:</li>
                          <li>whether the borrower has paid the costs associated with this Agreement (if any):</li>
                          <li>whether the borrower has complies with the loan terms specified in this Agreement:</li>
                          <li>whether the business and financial position of the borrower has changed adversely:</li>
                          <li>If the borrrower breaches the terms specified in this Agreement.</li>
                        </ul>
                      </div>

                      {/* Article 6 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#00A86B]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 6: USE OF LOAN AND REPAYMENT</h4>
                        <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[11px] sm:text-xs md:text-sm text-gray-700">
                          <p>(1) The borrower cannot use the loan for illegal activities. Otherwise, the lender reserves the right to require the Borrower to repay the principal and interest promptly and the legal consequences shall be borne by the Borrower.</p>
                          <p>(2) The borrower shall repay the principal and interest within the period specified in the contract. For the overdue portion, the lender is entitled to recover the loan and collect reasonable late charges only as disclosed and compliant with Philippine law.</p>
                        </div>
                      </div>

                      {/* Article 7 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#0038A8]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 7: MODIFICATION OR TERMINATION OF CONTRACT</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                          Modification or termination of contract: In all of the above provisions, neither party is permitted to modify or terminate the contract without permission. When either party wishes to bring to the fore such facts in accordance with the provision of the law, he must notify the other party in writing in time for the settlement. After this Agreement is modified or terminated, the Borrower shall repay outstanding principal, interest and reasonable charges only in accordance with the terms of this Agreement.
                        </p>
                      </div>

                      {/* Article 8 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#CE1126]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 8: DISPUTE RESOLUTION</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                          Dispute Resolution: Both parties agree to amend the terms of this Agreement through negotiation. If the negotiations do not agree, you can ask for mediation or bring the matter to the appropriate courts of the Republic of the Philippines. This Agreement is governed by Philippine laws.
                        </p>
                      </div>

                      {/* Article 9 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#00A86B]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 9: TRUTH IN LENDING DISCLOSURE</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                          Truth in Lending Disclosure: Before the loan is granted, full disclosure shall be made in writing of the amount financed, finance charge in pesos, simple annual interest rate on the outstanding balance, itemized fees and charges, payment schedule, total amount payable, and other costs required under Republic Act No. 3765 (Truth in Lending Act). The borrower acknowledges receipt and understanding of this disclosure.
                        </p>
                      </div>

                      {/* Article 10 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#0038A8]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 10: ELECTRONIC AGREEMENT AND DATA PRIVACY</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                          Electronic Agreement and Data Privacy: This Agreement may be executed electronically with the same legal effect. The lender shall comply with the Data Privacy Act (RA 10173) in processing borrower data. This short loan agreement takes effect from the date of its signing by both parties (including the electronic agreement). The text of the contract has the same legal effect. The lender and borrower keep a copy of the contract.
                        </p>
                      </div>
                    </div>

                    {/* Signature Section */}
                    <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm mt-4 sm:mt-5 md:mt-6 lg:mt-8">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#0038A8] mb-3 sm:mb-4 md:mb-5 lg:mb-6 pb-1 sm:pb-2 border-b border-gray-200">
                        SIGNATURE PAGE
                      </h3>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 sm:gap-8 md:gap-12">
                        {/* Borrower Signature */}
                        <div className="flex-1">
                          <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-2 sm:mb-3 md:mb-4">BORROWER'S SIGNATURE</p>

                          <div className="mb-2 sm:mb-3 md:mb-4" style={{ minHeight: '60px' }}>
                            {application?.signature_url ? (
                              <img
                                src={application.signature_url}
                                alt="Borrower Signature"
                                className="max-w-full max-h-[50px] sm:max-h-[60px] md:max-h-[70px] lg:max-h-[80px] object-contain"
                              />
                            ) : (
                              <p className="text-gray-400 text-[10px] sm:text-xs italic">(To be signed above)</p>
                            )}
                          </div>

                          <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 break-words">Printed Name: {contractHeader?.borrower_name}</p>
                          <p className="text-[11px] sm:text-xs md:text-sm text-gray-700">
                            Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>

                        {/* Lender Signature - Fixed stamp overlay covering entire section */}
                        <div className="flex-1 relative">
                          {/* Stamp overlay - positioned to cover everything */}
                          <div className="absolute -top-2 -left-2 right-0 bottom-0 z-20 pointer-events-none flex items-start justify-start">
                            <img
                              src="/logos/OFWLoanStamp.png"
                              alt="OFW Loan Department Stamp"
                              className="w-40 sm:w-44 md:w-48 h-auto opacity-70 object-contain"
                            />
                          </div>

                          {/* Content that will be stamped over */}
                          <div className="relative z-10">
                            <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-2 sm:mb-3 md:mb-4">LENDER'S SIGNATURE</p>

                            <div className="space-y-1">
                              <p className="text-[11px] sm:text-xs md:text-sm text-gray-700">Printed Name: OFW LOAN DEPARTMENT</p>
                              <p className="text-[11px] sm:text-xs md:text-sm text-gray-700">Title: Authorized Signatory</p>
                              <p className="text-[11px] sm:text-xs md:text-sm text-gray-700">
                                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-5 md:mt-6 text-center text-[10px] sm:text-xs text-gray-500 border-t border-gray-200 pt-3 sm:pt-4">
                        <p className="px-2 break-words">
                          This document was generated electronically and is legally binding. KabayanLoan is SEC Registered, BSP Supervised, and DMW Accredited.
                        </p>
                      </div>
                    </div>

                    {/* Borrower's Declaration */}
                    <div className="bg-gradient-to-r from-blue-50 to-red-50 border border-[#0038A8]/20 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                      <p className="text-[11px] sm:text-xs md:text-sm text-[#212529] italic font-medium break-words">
                        "I have read, understood, and agree to all terms and conditions of this Loan Agreement. I confirm that all information provided is true and correct."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Sign and Continue buttons - Hidden on mobile, visible on desktop */}
              <div className="bg-gray-50 px-3 py-3 sm:px-4 sm:py-3 md:px-6 md:py-4 lg:px-8 lg:py-4 border-t border-gray-200 hidden sm:flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => setShowContract(false)}
                  className="bg-white border-2 border-[#0038A8] text-[#0038A8] hover:bg-[#f0f7ff] font-semibold px-4 py-2 sm:px-5 sm:py-2 md:px-6 md:py-2 text-xs sm:text-sm md:text-base rounded-lg transition-colors w-full sm:w-auto order-2 sm:order-1"
                >
                  Back to Contract
                </button>
                <button
                  onClick={() => {
                    setShowContract(false);
                    // Scroll to signature section
                    setTimeout(() => {
                      document.querySelector('.signature-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-semibold px-6 py-2 sm:px-8 sm:py-2 md:px-10 md:py-2 text-xs sm:text-sm md:text-base rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto order-1 sm:order-2"
                >
                  Sign Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#0038A8] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#212529] font-medium">Processing your signature...</p>
          </div>
        </div>
      )}
    </div>
  )
}