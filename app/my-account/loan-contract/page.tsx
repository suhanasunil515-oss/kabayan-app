'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Building,
  User,
  CreditCard,
  Calendar,
  Percent,
  Shield,
  Home,
  Wallet,
  UserCircle,
  Clock
} from 'lucide-react'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface LoanApplication {
  id: number
  user_id: number
  document_number: string
  amount_requested: number
  loan_term_months: number
  interest_rate: number
  status: string
  signature_url?: string
  is_signed?: boolean
  created_at: string
}

interface Loan {
  id: number
  user_id: number
  order_number: string
  document_number: string
  loan_amount: number
  interest_rate: number
  loan_period_months: number
  status: string
  borrower_name: string
  borrower_phone: string
  created_at: string
  is_active: boolean
}

interface UserData {
  full_name: string
  id_card_number: string
  phone_number: string
  signature_image?: string
  bank_details?: {
    bankName?: string
  }
}

export default function LoanContractPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loanApplication, setLoanApplication] = useState<LoanApplication | null>(null)
  const [loan, setLoan] = useState<Loan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const debug: any = {}

        // Get userId from cookies
        const cookies = document.cookie.split(';')
        const userIdCookie = cookies.find(c => c.trim().startsWith('user_id='))
        const userId = userIdCookie ? userIdCookie.split('=')[1] : null
        debug.userId = userId

        // Fetch user data
        const userResponse = await fetch('/api/user')
        debug.userStatus = userResponse.status

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch user data')
        }

        const userResult = await userResponse.json()
        const user = userResult.user || {}
        debug.userData = {
          full_name: user.full_name,
          hasSignature: !!user.signature_image
        }

        setUserData({
          full_name: user.full_name || '',
          id_card_number: user.id_card_number || '',
          phone_number: user.phone_number || '',
          signature_image: user.signature_image || '',
          bank_details: user.bank_details
        })

        // IMPORTANT: Fetch from loan_applications table directly
        console.log('[v0] Fetching from /api/loans?action=get_user_application')
        const appResponse = await fetch('/api/loans?action=get_user_application')
        debug.appStatus = appResponse.status

        if (appResponse.ok) {
          const appData = await appResponse.json()
          console.log('[v0] Loan application data received:', appData)
          debug.appData = appData

          if (appData.application) {
            console.log('[v0] Application object:', appData.application)
            console.log('[v0] Signature URL from application:', appData.application.signature_url)
            console.log('[v0] Signature exists?', appData.application.signature_url ? 'YES' : 'NO')

            if (appData.application.signature_url) {
              console.log('[v0] Signature URL length:', appData.application.signature_url.length)
              console.log('[v0] Signature URL starts with:', appData.application.signature_url.substring(0, 30))
            }

            debug.signatureFromApp = appData.application.signature_url ? 'present' : 'missing'
            setLoanApplication(appData.application)
          } else {
            console.log('[v0] No application data in response')
          }
        } else {
          console.log('[v0] App response not OK:', appResponse.status)
          const errorText = await appResponse.text()
          console.log('[v0] Error response:', errorText)
        }

        // Fetch loan status as backup
        console.log('[v0] Fetching from /api/loan-status')
        const loanStatusResponse = await fetch('/api/loan-status')
        debug.loanStatus = loanStatusResponse.status

        if (loanStatusResponse.ok) {
          const loanStatusData = await loanStatusResponse.json()
          console.log('[v0] Loan status data:', loanStatusData)
          debug.loanStatusData = loanStatusData

          // Only set if we don't already have application data
          if (loanStatusData.loan && !loanApplication) {
            console.log('[v0] Setting loan application from loan-status')
            setLoanApplication({
              id: loanStatusData.loan.id || 0,
              user_id: parseInt(userId || '0'),
              document_number: loanStatusData.loan.documentNumber || '',
              amount_requested: parseFloat(loanStatusData.loan.amountRequested) || 0,
              loan_term_months: parseInt(loanStatusData.loan.loanTerm) || 0,
              interest_rate: parseFloat(loanStatusData.loan.interestRate) || 0,
              status: loanStatusData.loan.status || 'pending',
              signature_url: loanStatusData.loan.signatureUrl || user.signature_image,
              created_at: loanStatusData.loan.createdAt || new Date().toISOString()
            })
          }
        }

        // Also fetch from loans table as backup
        const loansResponse = await fetch('/api/loans')
        debug.loansStatus = loansResponse.status

        if (loansResponse.ok) {
          const loansData = await loansResponse.json()
          console.log('[v0] Loans data:', loansData)
          debug.loansData = loansData

          if (loansData.loans && loansData.loans.length > 0) {
            const activeLoan = loansData.loans[0]
            setLoan(activeLoan)
          }
        }

        setDebugInfo(debug)

      } catch (err) {
        console.error('[v0] Error fetching data:', err)
        setError('Failed to load contract data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount || amount === 0) return 'N/A'
    return `₱${amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  // Use loan application data with proper fallbacks
  const displayLoanAmount = loanApplication?.amount_requested || loan?.loan_amount || 0
  const displayInterestRate = loanApplication?.interest_rate || loan?.interest_rate || 0
  const displayLoanPeriod = loanApplication?.loan_term_months || loan?.loan_period_months || 0
  // CRITICAL: Get signature from loanApplication first, then fallback
  const displaySignatureUrl = loanApplication?.signature_url || userData?.signature_image
  const displayBorrowerName = userData?.full_name || loan?.borrower_name || 'N/A'
  const displayIdNumber = userData?.id_card_number || 'N/A'
  const displayPhoneNumber = userData?.phone_number || loan?.borrower_phone || 'N/A'
  const displayBankName = userData?.bank_details?.bankName || 'KabayanLoan'
  const displayDocumentNumber = loanApplication?.document_number || loan?.document_number || loan?.order_number || 'N/A'
  const isSigned = loanApplication?.is_signed || false

  const hasLoanData = displayLoanAmount > 0 || displayInterestRate > 0 || displayLoanPeriod > 0

  console.log('[v0] Final display values:', {
    displaySignatureUrl: displaySignatureUrl ? 'present' : 'missing',
    displayBorrowerName,
    isSigned,
    loanApplication: loanApplication ? 'present' : 'missing',
    userData: userData ? 'present' : 'missing'
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#0038A8] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading contract...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#212529] pb-8">
      {/* Header */}
      <header className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4 md:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#0038A8] hover:text-[#002c86] transition-colors"
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
                  <p className="text-xs text-gray-500">Loan Contract</p>
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

      <main className="px-4 py-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
              Standard Loan Agreement
            </span>
          </h1>
          <p className="text-[#6C757D]">Review our standard loan terms and conditions</p>
        </div>

        {/* Document Number Badge */}
        {displayDocumentNumber !== 'N/A' && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 px-4 py-2 rounded-full border border-[#0038A8]/20">
              <FileText className="w-4 h-4 text-[#0038A8]" />
              <span className="text-sm font-medium text-[#212529]">Document: </span>
              <span className="text-sm font-mono font-bold text-[#0038A8]">{displayDocumentNumber}</span>
            </div>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 p-4 rounded-xl mb-6 text-xs">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify({
                hasSignature: !!displaySignatureUrl,
                signatureUrlPreview: displaySignatureUrl ? displaySignatureUrl.substring(0, 50) + '...' : null,
                isSigned,
                loanAppPresent: !!loanApplication,
                userDataPresent: !!userData,
                debugInfo
              }, null, 2)}
            </pre>
          </div>
        )}

        {/* Notice Banner */}
        {!hasLoanData && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This is our standard loan agreement. Your personalized contract details will appear here once you apply for a loan.
              </p>
            </div>
          </div>
        )}

        {/* Contract Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#212529]">Contract Details</h2>
              <p className="text-sm text-[#6C757D]">Your loan information</p>
            </div>
          </div>

          {/* 2x3 Grid of Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Card 1 - Borrower Name */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-[#0038A8]/20 p-4 h-[120px] flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[#0038A8]" />
                <span className="text-sm font-semibold text-[#0038A8]">Borrower Name</span>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[#212529] font-medium text-lg">{displayBorrowerName}</p>
              </div>
            </div>

            {/* Card 2 - ID Number */}
            <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-[#CE1126]/20 p-4 h-[120px] flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-[#CE1126]" />
                <span className="text-sm font-semibold text-[#CE1126]">ID Number</span>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[#212529] font-mono text-base">{displayIdNumber}</p>
              </div>
            </div>

            {/* Card 3 - Bank Name */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-[#00A86B]/20 p-4 h-[120px] flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-[#00A86B]" />
                <span className="text-sm font-semibold text-[#00A86B]">Bank Name</span>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[#212529] font-medium text-base">{displayBankName}</p>
              </div>
            </div>

            {/* Card 4 - Loan Amount */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-[#0038A8]/20 p-4 h-[120px] flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-[#0038A8]" />
                <span className="text-sm font-semibold text-[#0038A8]">Loan Amount</span>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[#212529] font-bold text-xl">
                  {hasLoanData ? formatCurrency(displayLoanAmount) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Card 5 - Interest Rate */}
            <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-[#CE1126]/20 p-4 h-[120px] flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-[#CE1126]" />
                <span className="text-sm font-semibold text-[#CE1126]">Interest Rate</span>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[#212529] font-semibold text-xl">
                  {hasLoanData ? `${displayInterestRate}%` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Card 6 - Loan Period */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-[#00A86B]/20 p-4 h-[120px] flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#00A86B]" />
                <span className="text-sm font-semibold text-[#00A86B]">Loan Period</span>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[#212529] font-medium text-xl">
                  {hasLoanData ? `${displayLoanPeriod} months` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Active Contract Status */}
          {isSigned && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#00A86B]" />
                <div>
                  <p className="text-gray-900 font-medium">✓ Active Contract</p>
                  <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Signed on: {loanApplication?.created_at ? new Date(loanApplication.created_at).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loan Agreement Section */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 mb-8">
          <div className="text-center mb-8 pb-4 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0038A8] mb-2">LOAN AGREEMENT</h2>
            <p className="text-sm text-gray-500">Between KabayanLoan and {displayBorrowerName}</p>
          </div>

          {/* Articles 1-10 */}
          <div className="space-y-8">
            {/* Article 1 */}
            <div className="pl-4 border-l-4 border-[#0038A8]">
              <h3 className="font-bold text-[#0038A8] mb-3 text-lg">Article 1: Loan Form</h3>
              <p className="text-[#6C757D]">Loan Form: Use an unsecured ID card to request a loan.</p>
            </div>

            {/* Article 2 */}
            <div className="pl-4 border-l-4 border-[#CE1126]">
              <h3 className="font-bold text-[#CE1126] mb-3 text-lg">Article 2: Premium Interest Rate</h3>
              <p className="text-[#6C757D]">Premium interest rate: Interest rates, fines, service charges or any fees, Total not more than 25% per year or such lower rate as required by applicable Philippine laws and regulations (including SEC rules for small loans). Interest shall be simple on the outstanding balance and fully disclosed.</p>
            </div>

            {/* Article 3 */}
            <div className="pl-4 border-l-4 border-[#00A86B]">
              <h3 className="font-bold text-[#00A86B] mb-3 text-lg">Article 3: Borrower's Obligations</h3>
              <div className="text-[#6C757D]">
                <p>During the loan tenure, the borrower has to:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Pay interest at the same time.</li>
                  <li>To give capital on time.</li>
                  <li>If it is not possible to borrow money from the account due to borrower's problem, the borrower should cooperate with the lender to finalize the payment.</li>
                  <li>Comply with all the terms of the contract.</li>
                  <li>Use the loan only for lawful purposes.</li>
                </ul>
              </div>
            </div>

            {/* Article 4 */}
            <div className="pl-4 border-l-4 border-[#0038A8]">
              <h3 className="font-bold text-[#0038A8] mb-3 text-lg">Article 4: Loan Terms and Conditions</h3>
              <div className="text-[#6C757D] space-y-3">
                <p>(1) In case the borrower online without using collateral, the lender is at risk of lending, The borrower must have a loan quarantee to check the liquidity of the borrower's personal loan minimum repayment. Must be verified for financial liquidity.</p>
                <p>(2) In case the borrower online without using collateral, the lender is at risk oflending. Borrowers must show their financial status to the company to confirm theirability to repay their debt by 5%-10%. The borrower will withdraw the full amount of the loan account.</p>
                <p>(3) After signing this contract, both the borrow and the lender must comply with all requirements of the contract. If either party breaches the contract, the other party has the right to sue in the court. The party not complying with this will have to pay a fine of 50 percent of the installment amount if it does not object.</p>
                <p>(4) In the event that the credit transfer cannot be resolved due to the problems of the borrower, the lender has the right to request the borrower to assist in handling it. After completing this operation, the lender has to transfer the funds.</p>
                <p>(5) The borrower shall repay the loan principal and interest within the period specified in the contract. If the borrower wants to apply for loan extension, he/she has to disburse it 5 days before the contract period.</p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-2">
                  <p className="text-yellow-800"><strong>(6) If the borrower does not repay on time on the stipulated repayment date, penalty interest will be calculated after three days at 0.5% per day.</strong></p>
                </div>
              </div>
            </div>

            {/* Article 5 */}
            <div className="pl-4 border-l-4 border-[#CE1126]">
              <h3 className="font-bold text-[#CE1126] mb-3 text-lg">Article 5: Lending Considerations</h3>
              <div className="text-[#6C757D]">
                <p>Lending: Before granting a loan, the lender has the right to consider the following matters and take a decision to grant the loan as resuld of the review:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>The borrow has entered into this Agreement Completion of legal formalities (if any) relating to the loan under the Act, such as regulatory delivery of government permits, approvals, registrations and relevant laws:</li>
                  <li>whether the borrower has paid the costs associated with this Agreement (if any):</li>
                  <li>whether the borrower has complies with the loan terms specified in this Agreement:</li>
                  <li>whether the business and financial position of the borrower has changed adversely:</li>
                  <li>If the borrrower breaches the terms specified in this Agreement.</li>
                </ul>
              </div>
            </div>

            {/* Article 6 */}
            <div className="pl-4 border-l-4 border-[#00A86B]">
              <h3 className="font-bold text-[#00A86B] mb-3 text-lg">Article 6: Use of Loan and Repayment</h3>
              <div className="text-[#6C757D] space-y-3">
                <p>(1) The borrower cannot use the loan for illegal activities. Otherwise, the lender reserves the right to require the Borrower to repay the principal and interest promptly and the legal consequences shall be borne by the Borrower.</p>
                <p>(2) The borrower shall repay the principal and interest within the period specified in the contract. For the overdue portion, the lender is entitled to recover the loan and collect reasonable late charges only as disclosed and compliant with Philippine law.</p>
              </div>
            </div>

            {/* Article 7 */}
            <div className="pl-4 border-l-4 border-[#0038A8]">
              <h3 className="font-bold text-[#0038A8] mb-3 text-lg">Article 7: Modification or Termination of Contract</h3>
              <p className="text-[#6C757D]">Modification or termination of contract: In all of the above provisions, neither party is permitted to modify or terminate the contract without permission. When either party wishes to bring to the fore such facts in accordance with the provision of the law, he must notify the other party in writing in time for the settlement. After this Agreement is modified or terminated, the Borrower shall repay outstanding principal, interest and reasonable charges only in accordance with the terms of this Agreement.</p>
            </div>

            {/* Article 8 */}
            <div className="pl-4 border-l-4 border-[#CE1126]">
              <h3 className="font-bold text-[#CE1126] mb-3 text-lg">Article 8: Dispute Resolution</h3>
              <p className="text-[#6C757D]">Dispute Resolution: Both parties agree to amend the terms of this Agreement through negotiation. If the negotiations do not agree, you can ask for mediation or bring the matter to the appropriate courts of the Republic of the Philippines. This Agreement is governed by Philippine laws.</p>
            </div>

            {/* Article 9 */}
            <div className="pl-4 border-l-4 border-[#00A86B]">
              <h3 className="font-bold text-[#00A86B] mb-3 text-lg">Article 9: Truth in Lending Disclosure</h3>
              <p className="text-[#6C757D]">Truth in Lending Disclosure: Before the loan is granted, full disclosure shall be made in writing of the amount financed, finance charge in pesos, simple annual interest rate on the outstanding balance, itemized fees and charges, payment schedule, total amount payable, and other costs required under Republic Act No. 3765 (Truth in Lending Act). The borrower acknowledges receipt and understanding of this disclosure.</p>
            </div>

            {/* Article 10 */}
            <div className="pl-4 border-l-4 border-[#0038A8]">
              <h3 className="font-bold text-[#0038A8] mb-3 text-lg">Article 10: Electronic Agreement and Data Privacy</h3>
              <p className="text-[#6C757D]">Electronic Agreement and Data Privacy: This Agreement may be executed electronically with the same legal effect. The lender shall comply with the Data Privacy Act (RA 10173) in processing borrower data. This short loan agreement takes effect from the date of its signing by both parties (including the electronic agreement). The text of the contract has the same legal effect. The lender and borrower keep a copy of the contract.</p>
            </div>
          </div>

          {/* Signatures Section */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Borrower Signature */}
              <div className="text-center">
                <p className="text-[#6C757D] text-sm mb-4 font-semibold">BORROWER'S SIGNATURE</p>

                {/* Signature display container */}
                <div className="mb-4 min-h-[100px] flex items-center justify-center">
                  {displaySignatureUrl ? (
                    <div className="relative w-full h-[100px]">
                      <Image
                        src={displaySignatureUrl}
                        alt="Borrower Signature"
                        fill
                        className="object-contain"
                        unoptimized={true}
                        priority
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[100px]">
                      <p className="text-gray-400 text-sm italic">Not signed</p>
                    </div>
                  )}
                </div>
                <p className="font-semibold text-gray-900">{displayBorrowerName}</p>
                <p className="text-sm text-gray-600">Borrower</p>
              </div>

              {/* Lender Signature - With Stamp */}
              <div className="text-center relative">
                <p className="text-[#6C757D] text-sm mb-4 font-semibold">LENDER'S SIGNATURE</p>

                {/* Container for stamp overlay */}
                <div className="relative mb-4 min-h-[100px] flex items-center justify-center">
                  {/* Text that will be stamped over */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                    <p className="font-semibold text-gray-900">OFW LOAN DEPARTMENT</p>
                    <p className="text-sm text-gray-600">Authorized Signatory</p>
                  </div>

                  {/* Stamp overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <Image
                      src="/logos/OFWLoanStamp.png"
                      alt="Stamp"
                      width={120}
                      height={120}
                      className="object-contain opacity-70"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Government Trust Badges */}
        <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl p-4 mb-8 border border-[#0038A8]/20">
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
        <div className="flex justify-center">
          <button
            onClick={() => router.back()}
            className="w-full max-w-md bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Back to Account
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            KabayanLoan is SEC Registered, BSP Supervised, and DMW Accredited.
            All rights reserved.
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
