'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Loader, Search, Printer, Shield, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import LoanListTableTemplate from '@/components/documents/loan-list-table-template'
import { COMPANY_INFO_FALLBACK, COMPANY_LOGOS, GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface Loan {
  id: number
  document_number: string
  borrower_name: string
  loan_amount: number
  interest_rate: number
  loan_period_months: number
  status: string
  status_color: string
  created_at: string
  loan_purpose?: string
}

export default function LoanListTablePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [allLoans, setAllLoans] = useState<Loan[]>([])
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([])
  const [searchDocNumber, setSearchDocNumber] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [hasSearched, setHasSearched] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loanPurpose, setLoanPurpose] = useState('Business Expansion')
  const [realUser, setRealUser] = useState<Loan | null>(null)
  const [showNotFound, setShowNotFound] = useState(false)
  const itemsPerPage = 5

  // Mock loans data
  const getMockLoans = (): Loan[] => [
    {
      id: 1001,
      document_number: 'DOC-1770255500123-05',
      borrower_name: 'Maria Santos',
      loan_amount: 250000,
      interest_rate: 1.2,
      loan_period_months: 12,
      status: 'APPROVED',
      status_color: '#00A86B',
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      loan_purpose: 'Small Business'
    },
    {
      id: 1002,
      document_number: 'DOC-1770260300456-07',
      borrower_name: 'Juan Dela Cruz',
      loan_amount: 500000,
      interest_rate: 1.0,
      loan_period_months: 24,
      status: 'APPROVED',
      status_color: '#00A86B',
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
      loan_purpose: 'Home Renovation'
    },
    {
      id: 1003,
      document_number: 'DOC-1770265800789-02',
      borrower_name: 'Ana Garcia',
      loan_amount: 150000,
      interest_rate: 0.8,
      loan_period_months: 6,
      status: 'DECLINED',
      status_color: '#CE1126',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      loan_purpose: 'Education'
    },
    {
      id: 1004,
      document_number: 'DOC-1770270100234-11',
      borrower_name: 'Pedro Reyes',
      loan_amount: 300000,
      interest_rate: 1.1,
      loan_period_months: 18,
      status: 'APPROVED',
      status_color: '#00A86B',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      loan_purpose: 'Medical'
    },
    {
      id: 1005,
      document_number: 'DOC-1770278900567-03',
      borrower_name: 'Sofia Ramirez',
      loan_amount: 450000,
      interest_rate: 1.2,
      loan_period_months: 24,
      status: 'APPROVED',
      status_color: '#00A86B',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      loan_purpose: 'Business Expansion'
    },
    {
      id: 1006,
      document_number: 'DOC-1770283400789-08',
      borrower_name: 'Miguel Lopez',
      loan_amount: 600000,
      interest_rate: 1.3,
      loan_period_months: 36,
      status: 'DECLINED',
      status_color: '#CE1126',
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
      loan_purpose: 'Debt Consolidation'
    },
    {
      id: 1007,
      document_number: 'DOC-1770288900123-12',
      borrower_name: 'Rosie Hombre',
      loan_amount: 100000,
      interest_rate: 0.7,
      loan_period_months: 24,
      status: 'APPROVED',
      status_color: '#00A86B',
      created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
      loan_purpose: 'Vehicle Loan'
    },
    {
      id: 1008,
      document_number: 'DOC-1770294500678-15',
      borrower_name: 'Jinky Llagas De Guzman',
      loan_amount: 150000,
      interest_rate: 0.7,
      loan_period_months: 24,
      status: 'APPROVED',
      status_color: '#00A86B',
      created_at: new Date(Date.now() - 86400000 * 22).toISOString(),
      loan_purpose: 'Equipment Purchase'
    },
    {
      id: 1009,
      document_number: 'DOC-1770300100890-06',
      borrower_name: 'Isabella Cruz',
      loan_amount: 275000,
      interest_rate: 0.9,
      loan_period_months: 12,
      status: 'APPROVED',
      status_color: '#00A86B',
      created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
      loan_purpose: 'Wedding'
    }
  ]

  // Fetch all loans on mount
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch('/api/admin/loans?limit=1000')
        if (response.ok) {
          const data = await response.json()
          const realLoans = data.loans || []
          setAllLoans(realLoans)
          setFilteredLoans([])
        }
      } catch (error) {
        console.error('[v0] Error fetching loans:', error)
      }
    }
    fetchLoans()
  }, [])

  // Filter loans based on search and status
  useEffect(() => {
    if (!hasSearched) {
      setFilteredLoans([])
      setRealUser(null)
      setShowNotFound(false)
      return
    }

    let resultLoans: Loan[] = []
    let foundRealUser: Loan | null = null
    setShowNotFound(false)

    if (searchDocNumber) {
      // Find real user from database
      const dbMatches = allLoans.filter(loan =>
        loan.document_number.toLowerCase().includes(searchDocNumber.toLowerCase())
      )

      if (dbMatches.length > 0) {
        // Use actual database user
        foundRealUser = {
          ...dbMatches[0],
          loan_purpose: loanPurpose
        }
        resultLoans = [foundRealUser, ...getMockLoans()]
      } else {
        // Check if search term matches any mock loan
        const mockMatches = getMockLoans().filter(loan =>
          loan.document_number.toLowerCase().includes(searchDocNumber.toLowerCase())
        )

        if (mockMatches.length > 0) {
          foundRealUser = {
            ...mockMatches[0],
            loan_purpose: loanPurpose
          }
          resultLoans = [foundRealUser, ...getMockLoans().filter(l => l.document_number !== mockMatches[0].document_number)]
        } else {
          setShowNotFound(true)
          setFilteredLoans([])
          setRealUser(null)
          return
        }
      }
    } else {
      // Default real user when no search
      foundRealUser = {
        id: 9999,
        document_number: 'DOC-1770439003790-10',
        borrower_name: 'Oliver William',
        loan_amount: 1000000,
        interest_rate: 0.8,
        loan_period_months: 36,
        status: 'APPROVED',
        status_color: '#00A86B',
        created_at: new Date().toISOString(),
        loan_purpose: loanPurpose
      }
      resultLoans = [foundRealUser, ...getMockLoans()]
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      resultLoans = resultLoans.filter(loan =>
        loan.status.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    setRealUser(foundRealUser)
    setFilteredLoans(resultLoans)
    setCurrentPage(1)
  }, [searchDocNumber, statusFilter, hasSearched, loanPurpose, allLoans])

  const handlePrint = () => {
    if (filteredLoans.length === 0 && !showNotFound) {
      alert('Please search for a document number first')
      return
    }

    setIsLoading(true)

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow pop-ups to print the document')
      setIsLoading(false)
      return
    }

    const printContent = document.getElementById('loan-list-export')
    if (!printContent) {
      alert('Preview element not found. Please make sure the preview is visible.')
      setIsLoading(false)
      return
    }

    const printElement = printContent.cloneNode(true) as HTMLElement

    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          const rules = styleSheet.cssRules || styleSheet.rules;
          if (!rules) return '';

          const cssRules = Array.from(rules)
            .map((rule) => rule.cssText)
            .join('');
          return `<style>${cssRules}</style>`;
        } catch (e) {
          return '';
        }
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Loan List Table - ${COMPANY_INFO_FALLBACK.name}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${styles}
          <style>
            /* Force landscape for print: A4 landscape = 297mm x 210mm */
            @page {
              size: 297mm 210mm;
              margin: 10mm;
            }
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
            @media print {
              html, body {
                width: 297mm !important;
                min-width: 297mm;
                height: 210mm !important;
                min-height: 210mm;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                font-family: Arial, sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .container {
                width: 277mm !important;
                max-width: 277mm;
                min-height: 190mm;
                margin: 0 auto;
                padding: 8mm;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              img { max-width: 100%; height: auto; }
              .no-break { page-break-inside: avoid; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
            @media screen {
              .container { width: 100%; max-width: 100%; }
            }
          </style>
        </head>
        <body style="margin:0;padding:0;">
          <div class="container">
            ${printElement.outerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      setIsLoading(false);
    }, 500);
  }

  const handleSearch = () => {
    setHasSearched(true)
    setCurrentPage(1)
  }

  const clearSearch = () => {
    setSearchDocNumber('')
    setHasSearched(false)
    setShowNotFound(false)
    setFilteredLoans([])
    setRealUser(null)
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
                Loan List Table
              </span>
            </h1>
            <p className="text-[#6C757D] mt-1">View and print loan list with all applicant details</p>
          </div>

          {/* Government Badge */}
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-red-50 px-3 py-1.5 rounded-full border border-[#0038A8]/20">
            <Shield className="w-4 h-4 text-[#0038A8]" />
            <span className="text-xs font-medium text-[#212529]">SEC • BSP • DMW</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 overflow-auto max-h-[900px]">
            {showNotFound ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <div className="w-20 h-20 mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-center font-medium text-amber-700">No loan found with document number "{searchDocNumber}"</p>
                <p className="text-sm text-gray-400 mt-2">Please verify the document number and try again.</p>
                <Button
                  onClick={clearSearch}
                  className="mt-4 border-2 border-[#0038A8] text-[#0038A8] bg-white hover:bg-blue-50"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div id="loan-list-export">
                <LoanListTableTemplate
                  realUser={realUser}
                  mockLoans={getMockLoans()}
                  loanPurpose={loanPurpose}
                />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 h-fit sticky top-24">
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
            <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#0038A8] transition-shadow bg-white mb-3">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter document number..."
                value={searchDocNumber}
                onChange={(e) => setSearchDocNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 outline-none text-sm bg-transparent"
              />
              {searchDocNumber && (
                <button
                  onClick={clearSearch}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white font-semibold py-2 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Loan Purpose Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#212529] mb-3 flex items-center gap-1">
              <FileText className="w-4 h-4 text-[#CE1126]" />
              Loan Purpose (Real User)
            </label>
            <input
              type="text"
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
              placeholder="Enter loan purpose..."
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will appear in the Loan Purpose column for the real user
            </p>
          </div>

          {/* Results Summary */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg border border-[#0038A8]/20">
            <p className="text-sm font-medium text-[#212529] flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-[#00A86B]" />
              Showing <span className="font-bold text-[#0038A8]">{filteredLoans.length}</span> loans
            </p>
            {realUser && (
              <p className="text-xs text-gray-600 mt-2">
                <span className="text-gray-700">Real user:</span> {realUser.borrower_name}<br />
                <span className="font-mono text-gray-700">{realUser.document_number}</span>
              </p>
            )}
          </div>

          {/* Print Button */}
          <Button
            onClick={handlePrint}
            disabled={isLoading || (filteredLoans.length === 0 && !showNotFound)}
            className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Preparing...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Print Table
              </>
            )}
          </Button>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg border border-[#0038A8]/20">
            <h4 className="text-sm font-semibold text-[#212529] mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-[#00A86B]" />
              Document Information
            </h4>
            <ul className="text-xs text-[#6C757D] space-y-1.5">
              <li className="flex items-start">
                <span className="text-[#CE1126] mr-2">•</span>
                <span>The template displays the actual searched user at the top</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#CE1126] mr-2">•</span>
                <span>Enter a document number and loan purpose, then click Print</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#CE1126] mr-2">•</span>
                <span>Document is set to A4 landscape; if the print dialog shows Portrait, choose &quot;Landscape&quot; under Layout for best fit</span>
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
