'use client'

import Image from 'next/image'
import { COMPANY_INFO_FALLBACK, COMPANY_LOGOS, GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface RepaymentScheduleTemplateProps {
  loanId?: string
}

export default function RepaymentScheduleTemplate({ loanId }: RepaymentScheduleTemplateProps) {
  // Company colors
  const darkNavy = '#0B1F3A'
  const gold = '#D4AF37'

  // Flat-rate: x = 1M/36 = 27,777.78, y = 1M*0.005 = 5,000, monthly = 32,777.78
  const mockSchedule = [
    { month: 1, dueDate: '03/06/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '972,222.22' },
    { month: 2, dueDate: '04/06/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '944,444.44' },
    { month: 3, dueDate: '05/06/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '916,666.67' },
    { month: 4, dueDate: '06/06/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '888,888.89' },
    { month: 5, dueDate: '07/06/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '861,111.11' },
    { month: 6, dueDate: '08/06/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '833,333.33' },
    { month: 7, dueDate: '09/06/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '805,555.56' },
    { month: 8, dueDate: '10/06/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '777,777.78' },
    { month: 9, dueDate: '11/06/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '750,000.00' },
    { month: 10, dueDate: '12/06/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '722,222.22' },
    { month: 11, dueDate: '01/07/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '694,444.44' },
    { month: 12, dueDate: '02/07/2026', principalPayment: '27,777.78', interestPayment: '5,000.00', totalPayment: '32,777.78', balance: '666,666.67' },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto bg-white p-6" style={{ fontSize: '12px' }}>
      {/* Header with Logo and Company Name - NO tagline */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-[#0B1F3A]">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 relative">
            <Image
              src={COMPANY_LOGOS.main}
              alt={`${COMPANY_INFO_FALLBACK.name} Logo`}
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: darkNavy }}>PESO SHOP SUN</div>
            <div className="text-base font-bold -mt-1" style={{ color: gold }}>FINANCE CORPORATION</div>
          </div>
        </div>

        {/* Right side - Title */}
        <div className="text-right">
          <h2 className="text-lg font-bold" style={{ color: gold }}>REPAYMENT SCHEDULE</h2>
          <p className="text-[10px] text-gray-600 mt-1">Repayment Period: 2026-02-06 to 2029-02-06</p>
        </div>
      </div>

      {/* Borrower Information Summary Card */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Left Card - Borrower Details */}
        <div className="p-3 rounded-lg border" style={{ borderColor: darkNavy, backgroundColor: '#f8f9fa' }}>
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-2">BORROWER INFORMATION</p>
          
          <div className="space-y-1.5">
            <div>
              <p className="text-[9px] text-gray-600 font-semibold">COMPANY NAME</p>
              <p className="text-xs font-bold" style={{ color: darkNavy }}>{COMPANY_INFO_FALLBACK.name}</p>
            </div>

            <div>
              <p className="text-[9px] text-gray-600 font-semibold">BORROWER NAME</p>
              <p className="text-xs font-bold text-gray-900">Oliver William</p>
            </div>

            <div>
              <p className="text-[9px] text-gray-600 font-semibold">DOCUMENT NUMBER</p>
              <p className="text-xs font-mono text-gray-700">DOC-1770439003790-10</p>
            </div>

            <div>
              <p className="text-[9px] text-gray-600 font-semibold">PHONE NUMBER</p>
              <p className="text-xs font-bold" style={{ color: gold }}>+63-9123456789</p>
            </div>
          </div>
        </div>

        {/* Right Card - Loan Details */}
        <div className="p-3 rounded-lg border" style={{ borderColor: gold, backgroundColor: '#fef9e7' }}>
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-2">LOAN DETAILS</p>
          
          <div className="space-y-1.5">
            <div>
              <p className="text-[9px] text-gray-600 font-semibold">LOAN AMOUNT</p>
              <p className="text-sm font-bold" style={{ color: darkNavy }}>₱1,000,000</p>
            </div>

            <div>
              <p className="text-[9px] text-gray-600 font-semibold">LOAN TERM</p>
              <p className="text-xs font-bold text-gray-900">36 months</p>
            </div>

            <div>
              <p className="text-[9px] text-gray-600 font-semibold">INTEREST RATE</p>
              <p className="text-xs font-bold text-gray-900">0.5%</p>
            </div>

            <div>
              <p className="text-[9px] text-gray-600 font-semibold">TOTAL REPAYMENT</p>
              <p className="text-xs font-bold" style={{ color: gold }}>₱1,180,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Repayment Schedule Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#0B1F3A] to-[#D4AF37] text-white">
              <th className="px-3 py-2 text-left font-bold">Month</th>
              <th className="px-3 py-2 text-left font-bold">Due Date</th>
              <th className="px-3 py-2 text-right font-bold">Principal</th>
              <th className="px-3 py-2 text-right font-bold">Interest</th>
              <th className="px-3 py-2 text-right font-bold">Total Payment</th>
              <th className="px-3 py-2 text-right font-bold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {mockSchedule.map((row, index) => (
              <tr 
                key={index} 
                className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-3 py-2 font-semibold text-gray-900">{row.month}</td>
                <td className="px-3 py-2 text-gray-700">{row.dueDate}</td>
                <td className="px-3 py-2 text-right font-mono text-gray-900">₱{row.principalPayment}</td>
                <td className="px-3 py-2 text-right font-mono text-gray-900">₱{row.interestPayment}</td>
                <td className="px-3 py-2 text-right font-bold font-mono" style={{ color: darkNavy }}>₱{row.totalPayment}</td>
                <td className="px-3 py-2 text-right font-mono text-gray-900">₱{row.balance}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
              <td colSpan={2} className="px-3 py-2 text-right">TOTAL (12 months shown)</td>
              <td className="px-3 py-2 text-right" style={{ color: darkNavy }}>₱333,333.36</td>
              <td className="px-3 py-2 text-right" style={{ color: gold }}>₱60,000.00</td>
              <td className="px-3 py-2 text-right" style={{ color: darkNavy }}>₱393,333.36</td>
              <td className="px-3 py-2 text-right">₱666,666.67</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Instructions */}
      <div className="p-3 mb-3 rounded" style={{ backgroundColor: '#f8f9fa', borderLeft: `3px solid ${darkNavy}` }}>
        <p className="text-[10px] font-bold mb-1" style={{ color: darkNavy }}>IMPORTANT PAYMENT INSTRUCTIONS</p>
        <ul className="text-[9px] text-gray-600 space-y-0.5">
          <li>• Payment is due on the 15th of every month</li>
          <li>• Late payments will incur a 5% penalty</li>
          <li>• Early repayment is allowed without any prepayment penalties</li>
          <li>• Contact us at {COMPANY_INFO_FALLBACK.contactPhone} for any questions or concerns</li>
        </ul>
      </div>

      {/* Footer - NO logos */}
      <div className="border-t border-gray-300 pt-2 flex justify-between items-center text-[8px] text-gray-500">
        <div>Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div className="font-bold" style={{ color: darkNavy }}>PESO SHOP SUN FINANCE CORPORATION</div>
      </div>
    </div>
  )
}
