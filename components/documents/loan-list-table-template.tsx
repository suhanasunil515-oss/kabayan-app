'use client'

import Image from 'next/image'
import React from 'react'
import { COMPANY_INFO_FALLBACK, COMPANY_LOGOS, GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface Loan {
  document_number: string
  borrower_name: string
  loan_amount: number
  loan_purpose: string
  loan_period_months: number
  status: string
}

interface LoanListTableTemplateProps {
  realUser?: Loan | null
  mockLoans?: Loan[]
  loanPurpose?: string
}

export default function LoanListTableTemplate({
  realUser,
  mockLoans = [],
  loanPurpose = 'Business Expansion'
}: LoanListTableTemplateProps) {

  // Company colors
  const darkNavy = '#0B1F3A'
  const gold = '#D4AF37'
  const blue = '#0038A8'
  const red = '#CE1126'
  const green = '#00A86B'

  // Default mock loans
  const defaultMockLoans = [
    {
      document_number: 'DOC-1770255500123-05',
      borrower_name: 'Maria Santos',
      loan_amount: 250000,
      loan_purpose: 'Small Business',
      loan_period_months: 12,
      status: 'APPROVED'
    },
    {
      document_number: 'DOC-1770260300456-07',
      borrower_name: 'Juan Dela Cruz',
      loan_amount: 500000,
      loan_purpose: 'Home Renovation',
      loan_period_months: 24,
      status: 'APPROVED'
    },
    {
      document_number: 'DOC-1770265800789-02',
      borrower_name: 'Ana Garcia',
      loan_amount: 150000,
      loan_purpose: 'Education',
      loan_period_months: 6,
      status: 'DECLINED'
    },
    {
      document_number: 'DOC-1770270100234-11',
      borrower_name: 'Pedro Reyes',
      loan_amount: 300000,
      loan_purpose: 'Medical',
      loan_period_months: 18,
      status: 'APPROVED'
    },
    {
      document_number: 'DOC-1770278900567-03',
      borrower_name: 'Sofia Ramirez',
      loan_amount: 450000,
      loan_purpose: 'Business Expansion',
      loan_period_months: 24,
      status: 'APPROVED'
    },
    {
      document_number: 'DOC-1770283400789-08',
      borrower_name: 'Miguel Lopez',
      loan_amount: 600000,
      loan_purpose: 'Debt Consolidation',
      loan_period_months: 36,
      status: 'DECLINED'
    },
    {
      document_number: 'DOC-1770288900123-12',
      borrower_name: 'Rosie Hombre',
      loan_amount: 100000,
      loan_purpose: 'Vehicle Loan',
      loan_period_months: 24,
      status: 'APPROVED'
    },
    {
      document_number: 'DOC-1770294500678-15',
      borrower_name: 'Jinky Llagas De Guzman',
      loan_amount: 150000,
      loan_purpose: 'Equipment Purchase',
      loan_period_months: 24,
      status: 'APPROVED'
    },
    {
      document_number: 'DOC-1770300100890-06',
      borrower_name: 'Isabella Cruz',
      loan_amount: 275000,
      loan_purpose: 'Wedding',
      loan_period_months: 12,
      status: 'APPROVED'
    }
  ]

  const displayMockLoans = mockLoans.length > 0 ? mockLoans : defaultMockLoans
  const displayRealUser = realUser || {
    document_number: 'DOC-1770439003790-10',
    borrower_name: 'Oliver William',
    loan_amount: 1000000,
    loan_purpose: loanPurpose,
    loan_period_months: 36,
    status: 'APPROVED'
  }

  const getStatusBadgeClass = (status: string) => {
    if (status === 'APPROVED') return 'bg-green-50 text-[#00A86B] border border-[#00A86B] font-bold'
    if (status === 'DECLINED') return 'bg-red-50 text-[#CE1126] border border-[#CE1126] font-bold'
    return 'bg-yellow-50 text-[#FF6B00] border border-[#FF6B00] font-bold'
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="w-full bg-white p-6" style={{ fontSize: '12px' }}>
      {/* Header with Logo and Company Name - NO TAGLINE */}
      <div className="flex justify-center mb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative">
            <Image
              src={COMPANY_LOGOS.main}
              alt={`${COMPANY_INFO_FALLBACK.name} Logo`}
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
          <div className="text-left">
            <div className="text-xl font-bold" style={{ color: darkNavy }}>PESO SHOP SUN</div>
            <div className="text-lg font-bold -mt-1" style={{ color: gold }}>FINANCE CORPORATION</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Mock Search Field - EMPTY, no document number displayed */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
          <button className="px-5 py-1.5 rounded-full text-xs font-semibold bg-white shadow-sm" style={{ color: darkNavy }}>All</button>
          <button className="px-5 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-white/50">Approved</button>
          <button className="px-5 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-white/50">Declined</button>
          <button className="px-5 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-white/50">Pending</button>
        </div>
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 bg-white w-60">
          <span className="text-gray-400 mr-2 text-sm">🔍</span>
          <span className="text-xs text-gray-400 italic">Search document number...</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-[#0B1F3A] to-[#D4AF37] text-white">
              <th className="px-3 py-2.5 text-left font-bold">Document Number</th>
              <th className="px-3 py-2.5 text-left font-bold">Applicant</th>
              <th className="px-3 py-2.5 text-left font-bold">Loan Amount</th>
              <th className="px-3 py-2.5 text-left font-bold">Loan Purpose</th>
              <th className="px-3 py-2.5 text-left font-bold">Term</th>
              <th className="px-3 py-2.5 text-left font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Real User - From Search */}
            <tr className="border-b border-gray-200 bg-white">
              <td className="px-3 py-2.5 font-mono text-gray-700" style={{ color: darkNavy }}>{displayRealUser.document_number}</td>
              <td className="px-3 py-2.5 text-gray-700">{displayRealUser.borrower_name}</td>
              <td className="px-3 py-2.5 font-semibold text-gray-800" style={{ color: darkNavy }}>₱{formatCurrency(displayRealUser.loan_amount)}</td>
              <td className="px-3 py-2.5 text-gray-600">{displayRealUser.loan_purpose}</td>
              <td className="px-3 py-2.5 text-gray-600">{displayRealUser.loan_period_months} months</td>
              <td className="px-3 py-2.5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block ${getStatusBadgeClass(displayRealUser.status)}`}>
                  {displayRealUser.status}
                </span>
              </td>
            </tr>

            {/* Mock Data Rows - 9 rows */}
            {displayMockLoans.slice(0, 9).map((loan, index) => (
              <tr
                key={loan.document_number}
                className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-3 py-2.5 font-mono text-gray-700">{loan.document_number}</td>
                <td className="px-3 py-2.5 text-gray-700">{loan.borrower_name}</td>
                <td className="px-3 py-2.5 font-semibold text-gray-800">₱{formatCurrency(loan.loan_amount)}</td>
                <td className="px-3 py-2.5 text-gray-600">{loan.loan_purpose}</td>
                <td className="px-3 py-2.5 text-gray-600">{loan.loan_period_months} months</td>
                <td className="px-3 py-2.5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block ${getStatusBadgeClass(loan.status)}`}>
                    {loan.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Gradient from dark navy to gold */}
      <div className="mt-3 flex items-center justify-between">
        <button className="px-5 py-1.5 bg-gradient-to-r from-[#0B1F3A] to-[#D4AF37] text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
          ← Previous Page
        </button>
        <div className="text-xs font-medium text-gray-600">
          Items per page: 10 (1–10 of 198,565)
        </div>
        <button className="px-5 py-1.5 bg-gradient-to-r from-[#0B1F3A] to-[#D4AF37] text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
          Next Page →
        </button>
      </div>

      {/* NO FOOTER - Removed department logos and SEC number */}
    </div>
  )
}
