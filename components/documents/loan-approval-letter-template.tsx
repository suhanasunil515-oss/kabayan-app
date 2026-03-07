'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { COMPANY_INFO_FALLBACK, COMPANY_LOGOS, GOVERNMENT_LOGOS } from '@/lib/constants/company-info'
import { MapPin, Phone, FileText, Calendar } from 'lucide-react'

interface LoanData {
  documentNumber: string
  borrowerName: string
  idCardNumber: string
  borrowerPhone: string
  applicationDate: string
  loanApprovalCode: string
  loanAmount: string
  interestRate: string
  interestAmount: string
  loanTerm: string
  installmentDate: string
  monthlyInstallment: string
  totalRepayment: string
  effectiveDate: string
  idCardImage?: string
  signatureImage?: string
  companyName?: string
  secNumber?: string
  dateRegistered?: string
  customerId?: string
  loanOfficerPhone?: string
  nextInstallmentDate?: string
}

interface LoanApprovalLetterTemplateProps {
  loanData: LoanData
}

export default function LoanApprovalLetterTemplate({ loanData }: LoanApprovalLetterTemplateProps) {
  // Company information from constants
  const companyName = COMPANY_INFO_FALLBACK.name
  const secNumber = COMPANY_INFO_FALLBACK.secNumber
  const dateRegistered = COMPANY_INFO_FALLBACK.dateRegisteredSec
  const officeLocation = COMPANY_INFO_FALLBACK.address
  const contactPhone = COMPANY_INFO_FALLBACK.contactPhone
  const officerTitle = COMPANY_INFO_FALLBACK.officerTitle
  const officerName = COMPANY_INFO_FALLBACK.officerName
  const loanOfficerPhone = COMPANY_INFO_FALLBACK.contactPhone
  
  // Company logo colors
  const darkNavy = '#0B1F3A'
  const gold = '#D4AF37'
  
  // Format effective date
  const effectiveDate = loanData.effectiveDate || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  }).replace(/,/g, '')

  // Format application date
  const applicationDate = loanData.applicationDate || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  }).replace(/,/g, '')

  // Calculate next installment date (15th of next month from approval date)
  const getNextInstallmentDate = () => {
    if (loanData.nextInstallmentDate) return loanData.nextInstallmentDate
    
    const today = new Date()
    let nextMonth = today.getMonth() + 1
    let year = today.getFullYear()
    if (nextMonth > 11) {
      nextMonth = 0
      year += 1
    }
    const nextDate = new Date(year, nextMonth, 15)
    return nextDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }).replace(/,/g, '')
  }

  const installmentDate = loanData.installmentDate || getNextInstallmentDate()

  return (
    <div 
      className="w-full max-w-4xl mx-auto bg-white text-gray-900 relative print:overflow-hidden" 
      style={{ 
        fontSize: '12px',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '8mm',
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
      }}
    >
      {/* Background Watermark */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage: `url(${COMPANY_LOGOS.main})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain'
        }}
      />

      <div className="relative z-10 space-y-3 print:space-y-2">
        {/* HEADER - Company logo */}
        <div className="flex justify-center items-center pb-3 border-b-2 border-[#0B1F3A]">
          <div className="flex items-center gap-3">
            {/* Company Logo */}
            <div className="w-28 h-28 relative flex-shrink-0">
              <Image
                src={COMPANY_LOGOS.main}
                alt="PESO SHOP SUN Logo"
                width={112}
                height={112}
                className="object-contain"
                priority
              />
            </div>
            
            {/* Company Name */}
            <div>
              <div className="text-xl font-bold" style={{ color: darkNavy }}>PESO SHOP SUN</div>
              <div className="text-lg font-bold -mt-1" style={{ color: gold }}>FINANCE CORPORATION</div>
            </div>
          </div>
        </div>

        {/* CONDITIONAL APPROVED LETTER */}
        <div className="text-center pb-2 border-b border-gray-300">
          <h2 className="text-xl font-bold mb-1 tracking-wide" style={{ color: gold }}>
            CONDITIONAL APPROVED LETTER
          </h2>
          <p className="text-xs text-gray-600">
            This letter is effective on : <span className="font-bold text-gray-800">{effectiveDate}</span>
          </p>
        </div>

        {/* BETWEEN AND SECTION */}
        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-300">
          {/* LEFT COLUMN - LENDER */}
          <div>
            <div className="text-sm font-bold uppercase mb-2" style={{ color: darkNavy }}>BETWEEN</div>
            <div className="mb-1">
              <div className="text-gray-600 text-[10px]">COMPANY:</div>
              <div className="text-gray-800 text-xs font-bold">{companyName}</div>
            </div>
            <div className="text-xs italic mb-2" style={{ color: gold }}>HEREINAFTER REFERRED: lender</div>
            <div className="mb-1">
              <div className="text-gray-600 text-[10px]">SEC NUMBER:</div>
              <div className="text-gray-800 text-xs font-bold">{secNumber}</div>
            </div>
            <div className="mb-1">
              <div className="text-gray-600 text-[10px]">DATE REGISTERED SEC:</div>
              <div className="text-gray-800 text-xs font-bold">{dateRegistered}</div>
            </div>
          </div>
          
          {/* RIGHT COLUMN - BORROWER */}
          <div>
            <div className="text-sm font-bold uppercase mb-2" style={{ color: darkNavy }}>AND</div>
            <div className="mb-1">
              <div className="text-gray-600 text-[10px]">CUSTOMER NAME:</div>
              <div className="text-gray-800 text-xs font-bold">{loanData.borrowerName || 'N/A'}</div>
            </div>
            <div className="text-xs italic mb-2" style={{ color: gold }}>HEREINAFTER REFERRED: Borrower</div>
            <div className="mb-1">
              <div className="text-gray-600 text-[10px]">ID CARD NUMBER:</div>
              <div className="text-gray-800 text-xs font-bold">{loanData.idCardNumber || 'N/A'}</div>
            </div>
            <div className="mb-1">
              <div className="text-gray-600 text-[10px]">PHONE NUMBER:</div>
              <div className="text-gray-800 text-xs font-bold">{loanData.borrowerPhone || 'N/A'}</div>
            </div>
            <div className="mb-1">
              <div className="text-gray-600 text-[10px]">DATE APPLY LOAN:</div>
              <div className="text-gray-800 text-xs font-bold">{applicationDate}</div>
            </div>
          </div>
        </div>

        {/* TERMS AND CONDITIONS */}
        <div className="pb-2">
          <h3 className="text-sm font-bold mb-1" style={{ color: darkNavy }}>TERM AND CONDITIONS</h3>
          <p className="text-xs leading-tight text-justify text-gray-800">
            On the behalf of {companyName}, We're pleased to congratulate valued customer regarding your loan application has been approved on the terms set forth below, subject to the conditions set forth in the Conditions, Addendum to this Loan Approval, and further subject to any other conditions, {companyName} may establish upon receipt and review of documentation in satisfaction of the Initial Conditions (the "Subsequent Conditions"). For details of the monthly payment, the Loan Assistance Staff will provide details in a separate letter. Thank you.
          </p>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-2 gap-4 pb-2">
          {/* LEFT COLUMN: Details of Loan */}
          <div>
            <h3 className="text-sm font-bold mb-1" style={{ color: darkNavy }}>DETAILS OF LOAN</h3>
            <div className="mb-1">
              <span className="text-[10px] font-bold" style={{ color: darkNavy }}>Loan Approved code: {loanData.documentNumber || loanData.loanApprovalCode || 'PENDING'}</span>
            </div>
            <div className="text-gray-600 text-[10px] mb-2">Agree between borrower and lender</div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-baseline pb-0.5 border-b border-dashed border-gray-300">
                <span className="text-gray-600 text-xs">Loan amount :</span>
                <span className="text-sm font-bold text-gray-800">{loanData.loanAmount || '₱0.00'}</span>
              </div>
              <div className="flex justify-between items-baseline pb-0.5 border-b border-dashed border-gray-300">
                <span className="text-gray-600 text-xs">Interest Rate {loanData.interestRate || '0%'} :</span>
                <span className="text-sm font-bold text-gray-800">{loanData.interestAmount || '₱0.00 / Month'}</span>
              </div>
              <div className="flex justify-between items-baseline pb-0.5 border-b border-dashed border-gray-300">
                <span className="text-gray-600 text-xs">Loan Term :</span>
                <span className="text-sm font-bold text-gray-800">{loanData.loanTerm || '0 months'}</span>
              </div>
              <div className="flex justify-between items-baseline pb-0.5 border-b border-dashed border-gray-300">
                <span className="text-gray-600 text-xs">Installment Date :</span>
                <span className="text-sm font-bold text-gray-800">Every 15th of the month</span>
              </div>
              <div className="flex justify-between items-baseline pb-0.5 border-b border-dashed border-gray-300">
                <span className="text-gray-600 text-xs">Monthly Installment :</span>
                <span className="text-sm font-bold text-gray-800">{loanData.monthlyInstallment || '₱0.00'}</span>
              </div>
              <div className="flex justify-between items-baseline pb-0.5 border-b border-dashed border-gray-300">
                <span className="text-gray-600 text-xs">Total Repayment :</span>
                <span className="text-sm font-bold text-gray-800">{loanData.totalRepayment || '₱0.00'}</span>
              </div>
            </div>
          </div>
          
          {/* RIGHT COLUMN: ID Card - full size in preview; print uses min-height so full image visible */}
          <div>
            <h3 className="text-sm font-bold mb-1" style={{ color: darkNavy }}>ID CARD & PASSPORT</h3>
            <div className="relative w-full min-h-[200px] flex items-center justify-center bg-blue-50/30 rounded-lg print:min-h-[260px]" data-id-card-container>
              {loanData.idCardImage ? (
                <div className="relative w-full min-h-[180px] print:min-h-[240px] flex items-center justify-center">
                  <img 
                    src={loanData.idCardImage} 
                    alt="ID Card/Passport" 
                    className="max-w-full max-h-[320px] w-auto h-auto object-contain print:max-h-[280px]"
                  />
                  {/* Loan Approved Stamp */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img 
                      src="/logos/Loan_Approved.png"
                      alt="Loan Approved Stamp"
                      style={{
                        width: '100px',
                        height: 'auto',
                        opacity: 1,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="text-3xl mb-1">🪪</div>
                    <p className="text-gray-500 text-xs font-medium">ID Card/Passport Image</p>
                  </div>
                  {/* Loan Approved Stamp */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img 
                      src="/logos/Loan_Approved.png"
                      alt="Loan Approved Stamp"
                      style={{
                        width: '100px',
                        height: 'auto',
                        opacity: 1,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NOTICE SECTION */}
        <div className="pb-2">
          <h3 className="text-sm font-bold mb-1" style={{ color: darkNavy }}>NOTICE :</h3>
          <ul className="space-y-1">
            <li className="pl-4 relative text-gray-800 text-xs leading-snug">
              <span className="absolute left-0 font-bold" style={{ color: darkNavy }}>1.</span>
              The Contract and Document has been processed by the automated contract and document system (A.I system).
            </li>
            <li className="pl-4 relative text-gray-800 text-xs leading-snug">
              <span className="absolute left-0 font-bold" style={{ color: darkNavy }}>2.</span>
              The borrower shall repay the principal and interest within the period specified in the contract. For the overdue portion, the lender is entitled to recover the loan and collect 5% of the total amount due.
            </li>
            <li className="pl-4 relative text-gray-800 text-xs leading-snug">
              <span className="absolute left-0 font-bold" style={{ color: darkNavy }}>3.</span>
              If you have any queries, our loan officers available on {loanOfficerPhone} can explain it better to you. <br />
              <span className="text-[10px] text-gray-600">
                (Note: For authentication purpose, please mention your Loan Approval Code: <span className="bg-blue-50 px-1 py-0.5 rounded font-bold" style={{ color: darkNavy }}>{loanData.documentNumber || loanData.loanApprovalCode || 'PENDING'}</span>)
              </span>
            </li>
          </ul>
        </div>

        {/* SIGNATURE AND DEPARTMENT LOGOS SECTION */}
        <div className="flex justify-between items-center pt-3 border-t-2 border-gray-800">
          {/* LEFT SIDE: Four Department Logos */}
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 relative">
              <Image src={GOVERNMENT_LOGOS.sec} alt="SEC Logo" width={48} height={48} className="object-contain" />
            </div>
            <div className="w-12 h-12 relative">
              <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP Logo" width={48} height={48} className="object-contain" />
            </div>
            <div className="w-12 h-12 relative">
              <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW Logo" width={48} height={48} className="object-contain" />
            </div>
            <div className="w-12 h-12 relative">
              <Image src={GOVERNMENT_LOGOS.dof} alt="DOF Logo" width={48} height={48} className="object-contain" />
            </div>
          </div>

          {/* RIGHT SIDE: Signature with Stamp Overlay */}
          <div className="relative" style={{ minWidth: '180px' }}>
            <div className="relative flex flex-col items-end">
              {/* Signature Text */}
              <div className="text-sm font-bold text-gray-800 mb-0.5">Signature</div>
              
              {/* Signature and Stamp Container */}
              <div className="relative w-[160px] h-[60px]">
                {/* Stamp Background */}
                <div className="absolute right-0 top-0 w-[140px] h-[50px] pointer-events-none">
                  <Image
                    src={COMPANY_LOGOS.stamp}
                    alt="Signature Stamp"
                    width={140}
                    height={50}
                    className="object-contain opacity-85"
                  />
                </div>
                {/* Signature Overlay */}
                <div className="absolute right-[15px] top-[10px] w-[110px] h-[30px] pointer-events-none">
                  <Image
                    src={COMPANY_LOGOS.signature}
                    alt="Signature"
                    width={110}
                    height={30}
                    className="object-contain"
                  />
                </div>
              </div>
              
              {/* Department Title and Officer Name */}
              <div className="text-right mt-1">
                <div className="text-sm font-bold text-gray-800">{officerTitle}</div>
                <div className="text-sm font-bold text-gray-800">{officerName}</div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-2 border-t border-gray-300 text-[9px]">
          <div className="flex justify-between items-start">
            {/* Left side - Address with MapPin icon */}
            <div className="text-left">
              <div className="flex items-start gap-1">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: darkNavy }} />
                <p className="text-gray-600 leading-tight max-w-md">{officeLocation}</p>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3 flex-shrink-0" style={{ color: gold }} />
                <p className="text-gray-600">{contactPhone}</p>
              </div>
            </div>
            
            {/* Right side - Document Info with icons */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                <FileText className="w-3 h-3 flex-shrink-0" style={{ color: darkNavy }} />
                <div className="text-gray-700 font-semibold">Document No.</div>
              </div>
              <div className="text-gray-800 font-mono mt-0.5 text-[9px]">{loanData.documentNumber || 'N/A'}</div>
              <div className="flex items-center justify-end gap-1 mt-1">
                <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: gold }} />
                <div className="text-gray-500">Generated: {effectiveDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
