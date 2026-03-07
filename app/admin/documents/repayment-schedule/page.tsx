'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Loader, Search, X, Printer, Shield, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { COMPANY_INFO_FALLBACK, COMPANY_LOGOS, GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface LoanData {
  documentNumber: string
  borrowerName: string
  borrowerPhone?: string
  loanAmount: number
  interestRate: number
  loanTerm: number
  startDate: string
  monthlyPayment: number
  totalRepayment?: string
}

interface RepaymentItem {
  month: number
  dueDate: string
  principal: number
  interest: number
  total: number
  balance: number
}

export default function RepaymentSchedulePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentLoanData, setCurrentLoanData] = useState<LoanData | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentItem[]>([])
  const [showNotFound, setShowNotFound] = useState(false)

  // Company colors
  const darkNavy = '#0B1F3A'
  const gold = '#D4AF37'

  // Search for loans by document number
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    setShowNotFound(false)
    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/loans?search=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.loans || [])
        setShowResults(true)
      }
    } catch (error) {
      console.error('[v0] Error searching loans:', error)
    }
  }, [])

  // Fixed monthly interest rate for all loan terms (0.5%)
  const FIXED_INTEREST_RATE = 0.5

  // Flat-rate formula: Monthly = (Amount / Term) + (Amount × 0.005)
  const calculateRepaymentSchedule = (loanAmount: number, interestRate: number, months: number, startDate: string) => {
    const monthlyPrincipal = loanAmount / months
    const monthlyInterest = loanAmount * (interestRate / 100)
    const monthlyPayment = monthlyPrincipal + monthlyInterest

    const schedule: RepaymentItem[] = []
    let balance = loanAmount
    const start = new Date(startDate)

    for (let i = 1; i <= months; i++) {
      const dueDate = new Date(start)
      dueDate.setMonth(dueDate.getMonth() + i)
      balance -= monthlyPrincipal

      schedule.push({
        month: i,
        dueDate: dueDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        principal: monthlyPrincipal,
        interest: monthlyInterest,
        total: monthlyPayment,
        balance: Math.max(0, balance)
      })
    }

    return { schedule, monthlyPayment }
  }

  // Select a loan from search results (always use fixed 0.5% monthly rate for display and calculation)
  const selectLoan = (loan: any) => {
    setShowNotFound(false)
    const amount = Number(loan.loan_amount)
    const months = loan.loan_period_months
    const rate = FIXED_INTEREST_RATE
    const monthlyPrincipal = amount / months
    const monthlyInterest = amount * (rate / 100)
    const totalRepaymentAmount = amount + amount * (rate / 100) * months

    const loanData: LoanData = {
      documentNumber: loan.document_number,
      borrowerName: loan.borrower_name,
      borrowerPhone: loan.borrower_phone || '+63-XXXXXXXXXX',
      loanAmount: amount,
      interestRate: rate,
      loanTerm: months,
      startDate: new Date(loan.created_at).toISOString().split('T')[0],
      monthlyPayment: monthlyPrincipal + monthlyInterest,
      totalRepayment: totalRepaymentAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })
    }

    setCurrentLoanData(loanData)
    
    // Calculate repayment schedule
    const { schedule } = calculateRepaymentSchedule(
      loanData.loanAmount,
      loanData.interestRate,
      loanData.loanTerm,
      loanData.startDate
    )
    setRepaymentSchedule(schedule)
    
    setSearchQuery(loan.document_number)
    setShowResults(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setCurrentLoanData(null)
    setRepaymentSchedule([])
    setShowNotFound(false)
  }

  const handlePrint = () => {
    if (!currentLoanData || repaymentSchedule.length === 0) {
      alert('Please search and select a loan first')
      return
    }

    setIsLoading(true)

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow pop-ups to print the document')
      setIsLoading(false)
      return
    }

    const baseUrl = window.location.origin
    const companyLogo = `${baseUrl}${COMPANY_LOGOS.main}`
    const dofLogoSvg = `${baseUrl}${GOVERNMENT_LOGOS.dof}`
    const bspLogoSvg = `${baseUrl}${GOVERNMENT_LOGOS.bsp}`
    const secLogoSvg = `${baseUrl}${GOVERNMENT_LOGOS.sec}`
    const dmwLogoSvg = `${baseUrl}${GOVERNMENT_LOGOS.dmw}`

    const startDate = new Date(currentLoanData.startDate)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + currentLoanData.loanTerm)
    
    const formattedStartDate = startDate.toISOString().split('T')[0]
    const formattedEndDate = endDate.toISOString().split('T')[0]

    const totalPrincipal = repaymentSchedule.reduce((sum, item) => sum + item.principal, 0)
    const totalInterest = repaymentSchedule.reduce((sum, item) => sum + item.interest, 0)
    const totalPayment = repaymentSchedule.reduce((sum, item) => sum + item.total, 0)

    // Mock ID card number (in real app, this would come from the loan data)
    const idCardNumber = '11123343350' // This should be fetched from the actual user data

    const printHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Repayment Schedule - ${currentLoanData.documentNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      margin: 0; 
      padding: 0; 
      width: 100%; 
      height: 100%; 
      background: white;
    }
    body { 
      font-family: Arial, sans-serif; 
      color: #333; 
    }
    .container { 
      width: 297mm; 
      height: 210mm; 
      margin: 0 auto; 
      padding: 10mm;
      display: flex;
      flex-direction: column;
      position: relative;
      background: white;
    }
    
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 2;
      height: 100%;
    }
    
    /* Header - Company left, Department logos right */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #0B1F3A;
    }
    .company-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .logo {
      width: 50px;
      height: 50px;
      flex-shrink: 0;
    }
    .logo img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .company-info {
      text-align: left;
    }
    .company-name-line1 {
      font-size: 20px;
      font-weight: bold;
      color: #0B1F3A;
      line-height: 1.2;
    }
    .company-name-line2 {
      font-size: 18px;
      font-weight: bold;
      color: #D4AF37;
      line-height: 1.2;
      margin-top: 2px;
    }
    
    /* Department Logos - Right side with proper spacing */
    .dept-logos {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    .dept-logo {
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dept-logo img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    /* Title section */
    .title-section {
      text-align: center;
      margin-bottom: 15px;
    }
    .main-title {
      font-size: 20px;
      font-weight: bold;
      color: #D4AF37; /* Changed to gold */
      margin-bottom: 3px;
    }
    .period {
      font-size: 11px;
      color: #666;
    }
    
    /* Info cards - More Compact */
    .cards-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 15px;
    }
    .card {
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px solid;
    }
    .card.blue {
      background: #f0f7ff;
      border-color: #0B1F3A; /* Changed to dark navy */
    }
    .card.teal {
      background: #fef9e7;
      border-color: #D4AF37; /* Changed to gold */
    }
    .card-row {
      display: flex;
      margin-bottom: 6px;
      font-size: 10px;
    }
    .card-label {
      width: 110px;
      font-weight: 600;
      color: #475569;
    }
    .card-value {
      font-weight: 600;
      color: #0f172a;
    }
    .card-value.highlight {
      color: #0B1F3A; /* Changed to dark navy */
    }
    .card-value.green {
      color: #D4AF37; /* Changed to gold */
    }
    
    /* Table - Compact to fit all rows */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 10px 0;
      font-size: 9.5px;
      border: 1px solid #e2e8f0;
    }
    thead tr {
      background: linear-gradient(to right, #0B1F3A, #D4AF37); /* Changed to dark navy to gold */
    }
    th {
      color: white;
      padding: 6px 4px;
      text-align: left;
      font-weight: 700;
      font-size: 9.5px;
      background: transparent;
    }
    th.right {
      text-align: right;
      padding-right: 8px;
    }
    td {
      padding: 5px 4px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
      font-size: 9px;
    }
    td.right {
      text-align: right;
      padding-right: 8px;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .total-row {
      background: #e6f0fa;
      font-weight: 700;
      border-top: 2px solid #94a3b8;
    }
    .total-row td {
      font-weight: 700;
      padding: 6px 4px;
      background: #e6f0fa;
    }
    
    /* Payment instructions */
    .instructions {
      background: #f8fafc;
      border-left: 3px solid #0B1F3A; /* Changed to dark navy */
      padding: 8px 12px;
      margin: 10px 0 8px 0;
    }
    .instructions-title {
      font-size: 10px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .instructions-list {
      font-size: 8.5px;
      color: #475569;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .instructions-list li {
      list-style: none;
    }
    
    /* Borrower info */
    .borrower-info {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #475569;
      padding: 6px 0;
      border-top: 1px dashed #cbd5e1;
      margin-top: 5px;
    }
    .borrower-info span {
      font-weight: 600;
      color: #0f172a;
    }
    
    /* Footer - Clean, no logos */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #cbd5e1;
      font-size: 8px;
      color: #64748b;
    }
    .footer-left {
      font-weight: 500;
    }
    .footer-right {
      text-align: right;
    }
    .footer-company {
      font-weight: 700;
      color: #0B1F3A; /* Changed to dark navy */
    }
    
    @media print {
      @page { 
        size: A4 landscape; 
        margin: 8mm;
      }
      html, body {
        width: 297mm;
        height: 210mm;
        display: block;
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .container {
        width: 297mm;
        height: 210mm;
        margin: 0;
        padding: 8mm;
        box-shadow: none;
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      thead tr {
        background: linear-gradient(to right, #0B1F3A, #D4AF37);
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <!-- Header - Company left, Department logos right -->
      <div class="header">
        <div class="company-section">
          <div class="logo">
            <img src="${companyLogo}" alt="PESO SHOP SUN Logo" />
          </div>
          <div class="company-info">
            <div class="company-name-line1">PESO SHOP SUN</div>
            <div class="company-name-line2">FINANCE CORPORATION</div>
          </div>
        </div>
        
        <!-- Department Logos on the Right -->
        <div class="dept-logos">
          <div class="dept-logo">
            <img src="${dofLogoSvg}" alt="DOF" />
          </div>
          <div class="dept-logo">
            <img src="${bspLogoSvg}" alt="BSP" />
          </div>
          <div class="dept-logo">
            <img src="${secLogoSvg}" alt="SEC" />
          </div>
          <div class="dept-logo">
            <img src="${dmwLogoSvg}" alt="DMW" />
          </div>
        </div>
      </div>

      <!-- Title -->
      <div class="title-section">
        <div class="main-title">REPAYMENT SCHEDULE</div>
        <div class="period">Repayment Period: ${formattedStartDate} to ${formattedEndDate}</div>
      </div>

      <!-- Info Cards - Compact -->
      <div class="cards-container">
        <div class="card blue">
          <div class="card-row">
            <span class="card-label">Company Name:</span>
            <span class="card-value">PESO SHOP SUN FINANCE CORPORATION</span>
          </div>
          <div class="card-row">
            <span class="card-label">Borrower Name:</span>
            <span class="card-value">${currentLoanData.borrowerName}</span>
          </div>
          <div class="card-row">
            <span class="card-label">ID Card Number:</span>
            <span class="card-value" style="font-family: monospace;">${idCardNumber}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Phone Number:</span>
            <span class="card-value highlight">${currentLoanData.borrowerPhone || '+63-XXXXXXXXXX'}</span>
          </div>
        </div>

        <div class="card teal">
          <div class="card-row">
            <span class="card-label">Loan Amount:</span>
            <span class="card-value highlight">₱${currentLoanData.loanAmount.toLocaleString()}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Interest Rate:</span>
            <span class="card-value">${currentLoanData.interestRate}%</span>
          </div>
          <div class="card-row">
            <span class="card-label">Loan Terms:</span>
            <span class="card-value">${currentLoanData.loanTerm} months</span>
          </div>
          <div class="card-row">
            <span class="card-label">Total Repayment:</span>
            <span class="card-value green">₱${totalPayment.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <!-- Repayment Table - Complete with all months -->
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Due Date</th>
            <th class="right">Principal</th>
            <th class="right">Interest</th>
            <th class="right">Total Payment</th>
            <th class="right">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${repaymentSchedule.map(item => `
            <tr>
              <td>${item.month}</td>
              <td>${item.dueDate}</td>
              <td class="right">₱${item.principal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
              <td class="right">₱${item.interest.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
              <td class="right">₱${item.total.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
              <td class="right">₱${item.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2" style="text-align: right; font-weight: 700;">TOTAL</td>
            <td class="right">₱${totalPrincipal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
            <td class="right">₱${totalInterest.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
            <td class="right">₱${totalPayment.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
            <td class="right">₱0.00</td>
          </tr>
        </tbody>
      </table>

      <!-- Payment Instructions -->
      <div class="instructions">
        <div class="instructions-title">IMPORTANT PAYMENT INSTRUCTIONS</div>
        <ul class="instructions-list">
          <li>• Payment is due on the 15th of every month</li>
          <li>• Late payments will incur a 5% penalty</li>
          <li>• Early repayment is allowed without any prepayment penalties</li>
          <li>• Contact us at ${COMPANY_INFO_FALLBACK.contactPhone} for any questions or concerns</li>
        </ul>
      </div>

      <!-- Borrower Info -->
      <div class="borrower-info">
        <div><span>Borrower:</span> ${currentLoanData.borrowerName}</div>
        <div><span>Document Number:</span> ${currentLoanData.documentNumber}</div>
      </div>

      <!-- Footer - Clean, no logos -->
      <div class="footer">
        <div class="footer-left">Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div class="footer-right"><span class="footer-company">PESO SHOP SUN FINANCE CORPORATION</span></div>
      </div>
    </div>
  </div>
  <script>
    setTimeout(() => {
      window.print();
    }, 300);
  </script>
</body>
</html>`

  printWindow.document.write(printHTML)
  printWindow.document.close()
}

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/documents" className="inline-flex items-center gap-2 text-[#0038A8] hover:text-[#CE1126] mb-4 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Documents
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
                Repayment Schedule
              </span>
            </h1>
            <p className="text-[#6C757D] mt-1">Generate detailed repayment schedules with monthly breakdown</p>
          </div>
          
          {/* Government Badge */}
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-red-50 px-3 py-1.5 rounded-full border border-[#0038A8]/20">
            <Shield className="w-4 h-4 text-[#0038A8]" />
            <span className="text-xs font-medium text-[#212529]">SEC • BSP • DMW</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-auto max-h-[900px]">
            {showNotFound ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <div className="w-20 h-20 mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-center font-medium text-amber-700">No loan found with document number "{searchQuery}"</p>
                <p className="text-sm text-gray-400 mt-2">Please verify the document number and try again.</p>
                <Button
                  onClick={clearSearch}
                  className="mt-4 border-2 border-[#0038A8] text-[#0038A8] bg-white hover:bg-blue-50"
                >
                  Clear Search
                </Button>
              </div>
            ) : currentLoanData && repaymentSchedule.length > 0 ? (
              <div id="repayment-export-content" className="space-y-6">
                {/* Top Header */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-300">
                  {/* Left: Company Logo and Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={COMPANY_LOGOS.main}
                        alt="PESO SHOP SUN Logo"
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-xl font-bold" style={{ color: darkNavy }}>PESO SHOP SUN</div>
                      <div className="text-lg font-bold -mt-1" style={{ color: gold }}>FINANCE CORPORATION</div>
                    </div>
                  </div>

                   {/* Right: Regulatory Logos */}
                    <div className="flex gap-2">
                      <div className="w-12 h-12 relative">
                        <Image src={GOVERNMENT_LOGOS.dof} alt="DOF" width={48} height={48} className="object-contain" />
                      </div>
                      <div className="w-12 h-12 relative">
                        <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={48} height={48} className="object-contain" />
                      </div>
                      <div className="w-12 h-12 relative">
                        <Image src={GOVERNMENT_LOGOS.sec} alt="SEC" width={48} height={48} className="object-contain" />
                      </div>
                      <div className="w-12 h-12 relative">
                        <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={48} height={48} className="object-contain" />
                      </div>
                      </div>
                </div>

                {/* Title and Date Range */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: gold }}>REPAYMENT SCHEDULE</h2>
                  <p className="text-sm text-gray-600">
                    Repayment Period: {currentLoanData.startDate} to {new Date(new Date(currentLoanData.startDate).setMonth(new Date(currentLoanData.startDate).getMonth() + currentLoanData.loanTerm)).toISOString().split('T')[0]}
                  </p>
                </div>

                {/* Two Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Card: Company & Borrower */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2" style={{ borderColor: darkNavy }}>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Company Name</p>
                        <p className="font-semibold text-gray-900">PESO SHOP SUN FINANCE CORPORATION</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Borrower Name</p>
                        <p className="font-semibold text-gray-900">{currentLoanData.borrowerName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Borrower ID Card Number</p>
                        <p className="font-mono font-semibold text-gray-900">{currentLoanData.documentNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Borrower Phone Number</p>
                        <p className="font-bold" style={{ color: darkNavy }}>{currentLoanData.borrowerPhone || '+63-XXXXXXXXXX'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Card: Loan Details */}
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border-2" style={{ borderColor: gold }}>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Loan Amount</p>
                        <p className="font-bold text-gray-900">₱{currentLoanData.loanAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Interest Rate</p>
                        <p className="font-bold text-gray-900">{currentLoanData.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Loan Terms</p>
                        <p className="font-bold text-gray-900">{currentLoanData.loanTerm} months</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Total Repayment Amount</p>
                        <p className="font-bold" style={{ color: gold }}>{currentLoanData.totalRepayment}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Repayment Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#0B1F3A] to-[#D4AF37] text-white">
                        <th className="text-left p-3 font-bold">Month</th>
                        <th className="text-left p-3 font-bold">Due Date</th>
                        <th className="text-right p-3 font-bold">Principal</th>
                        <th className="text-right p-3 font-bold">Interest</th>
                        <th className="text-right p-3 font-bold">Total Payment</th>
                        <th className="text-right p-3 font-bold">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repaymentSchedule.map((item) => (
                        <tr key={item.month} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                          <td className="p-3 font-semibold text-gray-900">{item.month}</td>
                          <td className="p-3 text-gray-700">{item.dueDate}</td>
                          <td className="p-3 text-right font-mono text-gray-900">₱{item.principal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right font-mono text-gray-900">₱{item.interest.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right font-mono font-semibold" style={{ color: darkNavy }}>₱{item.total.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right font-mono text-gray-900">₱{item.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Borrower Info */}
                <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-600">
                  <p className="font-semibold">Borrower: {currentLoanData.borrowerName}</p>
                  <p>Document Number: {currentLoanData.documentNumber}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Search and select a document number to view repayment schedule</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 h-fit sticky top-24 max-h-[700px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#212529]">Export Options</h2>
          </div>

          {/* Document Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#212529] mb-3 flex items-center gap-1">
              <Search className="w-4 h-4 text-[#0038A8]" />
              Search Document Number
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#0038A8] transition-shadow bg-white">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter document number..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent"
                />
                {searchQuery && (
                  <X
                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={clearSearch}
                  />
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 border border-gray-300 rounded-lg bg-white shadow-lg z-10">
                  <div className="max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => selectLoan(result)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold text-sm text-gray-900">{result.document_number}</div>
                        <div className="text-xs text-gray-600">{result.borrower_name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showResults && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 border border-gray-300 rounded-lg bg-white shadow-lg p-4 text-sm text-gray-500 z-10">
                  No results found
                </div>
              )}
            </div>
          </div>

          {/* Schedule Info */}
          {currentLoanData && (
            <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg border border-[#0038A8]/20">
              <p className="text-sm font-medium text-[#212529] flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                Schedule: <span className="font-bold text-[#0038A8]">{currentLoanData.loanTerm} months</span>
              </p>
            </div>
          )}

          {/* Print Button */}
          <Button
            onClick={handlePrint}
            disabled={isLoading || !currentLoanData || repaymentSchedule.length === 0}
            className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Preparing...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Print Schedule
              </>
            )}
          </Button>

          {/* Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg border border-[#0038A8]/20">
            <h4 className="text-sm font-semibold text-[#212529] mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-[#00A86B]" />
              Document Information
            </h4>
            <ul className="text-xs text-[#6C757D] space-y-1.5">
              <li className="flex items-start">
                <span className="text-[#CE1126] mr-2">•</span>
                <span>Schedule is dynamically calculated based on loan term</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#CE1126] mr-2">•</span>
                <span>Document prints in A4 landscape orientation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Government Logos Strip */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 border border-[#0038A8]/20">
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
    </div>
  )
}
