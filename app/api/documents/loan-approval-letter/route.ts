import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const { documentNumber, loanData, format } = await request.json()

    if (!documentNumber || !loanData || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: documentNumber, loanData, format' },
        { status: 400 }
      )
    }

    if (format === 'excel') {
      return await generateExcel(documentNumber, loanData)
    } else {
      return generateHTML(documentNumber, loanData, format)
    }
  } catch (error) {
    console.error('[LOAN APPROVAL] Document generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate document', details: String(error) },
      { status: 500 }
    )
  }
}

async function generateExcel(documentNumber: string, loanData: any) {
  const workbook = XLSX.utils.book_new()
  
  // Company Information - FinanciaPH (without Investor Corp.)
  const companyName = "FinanciaPH"
  const secNumber = "CS202004089"
  const dateRegistered = "04-June-2020"
  const officeLocation = "15th Floor, One Corporate Centre, Julia Vargas Ave, Ortigas Center, Pasig City, Metro Manila"
  const contactEmail = "support@financiaph.com"
  const contactPhone = "(912) 345-6789"
  
  // Format effective date
  const effectiveDate = loanData.effectiveDate || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  }).replace(/,/g, '')
  
  const mainData = [
    // HEADER SECTION
    [companyName, '', '', '', '', '', '', ''],
    ['CONDITIONAL APPROVED LETTER', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // EFFECTIVE DATE
    [`Effective Date: ${effectiveDate}`, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // BETWEEN SECTION - LENDER
    ['BETWEEN', '', 'AND', '', '', '', '', ''],
    ['COMPANY:', companyName, '', 'CUSTOMER NAME:', loanData.borrowerName || 'N/A', '', '', ''],
    ['HEREINAFTER REFERRED:', 'lender', '', 'HEREINAFTER REFERRED:', 'Borrower', '', '', ''],
    ['SEC NUMBER:', secNumber, '', 'ID CARD NUMBER:', loanData.idCardNumber || 'N/A', '', '', ''],
    ['DATE REGISTERED SEC:', dateRegistered, '', 'PHONE NUMBER:', loanData.borrowerPhone || 'N/A', '', '', ''],
    ['', '', '', 'DATE APPLY LOAN:', loanData.applicationDate || effectiveDate, '', '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // TERMS AND CONDITIONS
    ['TERM AND CONDITIONS', '', '', '', '', '', '', ''],
    [`On the behalf of ${companyName}, We're pleased to congratulate valued customer regarding your loan application has been approved on the terms set forth below, subject to the conditions set forth in the Conditions, Addendum to this Loan Approval, and further subject to any other conditions, FinanciaPH may establish upon receipt and review of documentation in satisfaction of the Initial Conditions (the "Subsequent Conditions"). For details of the monthly payment, the Loan Assistance Staff will provide details in a separate letter. Thank you.`, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // DETAILS OF LOAN
    ['DETAILS OF LOAN', '', '', 'ID CARD & PASSPORT', '', '', '', ''],
    ['Agree between borrower and lender', '', '', '', '', '', '', ''],
    [`Loan Approved code: ${loanData.documentNumber || loanData.loanApprovalCode || documentNumber}`, '', '', 'Status:', loanData.idCardImage ? 'Uploaded' : 'Not Uploaded', '', '', ''],
    [`Loan amount: ${loanData.loanAmount || '₱0.00'}`, '', '', 'Loan Approved Stamp:', 'Applied', '', '', ''],
    [`Interest Rate ${loanData.interestRate || '0%'}: ${loanData.interestAmount || '₱0.00 / Month'}`, '', '', '', '', '', '', ''],
    [`Loan Term: ${loanData.loanTerm || '0 months'}`, '', '', '', '', '', '', ''],
    [`Installment Date: ${loanData.installmentDate || '15th of next month'}`, '', '', '', '', '', '', ''],
    [`Monthly Installment: ${loanData.monthlyInstallment || '₱0.00'}`, '', '', '', '', '', '', ''],
    [`Total Repayment: ${loanData.totalRepayment || '₱0.00'}`, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // NOTICE
    ['NOTICE:', '', '', '', '', '', '', ''],
    ['1. The Contract and Document has been processed by the automated contract and document system (A.I system).', '', '', '', '', '', '', ''],
    ['2. The borrower shall repay the principal and interest within the period specified in the contract. For the overdue portion, the lender is entitled to recover the loan and collect 5% of the total amount due.', '', '', '', '', '', '', ''],
    [`3. If you have any queries, our loan officers available on ${contactPhone} can explain it better to you. (Note: For authentication purpose, please mention your Loan Approval Code: ${loanData.documentNumber || loanData.loanApprovalCode || documentNumber})`, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // REGULATORY COMPLIANCE & SIGNATURE
    ['REGULATORY COMPLIANCE', '', '', 'AUTHORIZED SIGNATURE', '', '', '', ''],
    ['SEC: Securities and Exchange Commission', '', '', 'Signature:', 'Applied', '', '', ''],
    ['BSP: Bangko Sentral ng Pilipinas', '', '', 'Signature Stamp:', 'Applied', '', '', ''],
    ['DOF: Department of Finance', '', '', 'FINANCIAL DEPARTMENT', '', '', '', ''],
    ['', '', '', companyName, '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // FOOTER
    [companyName, '', '', '', '', '', '', ''],
    [officeLocation, '', '', '', '', '', '', ''],
    [`${contactEmail} | ${contactPhone}`, '', '', '', '', '', '', ''],
    [`Document No: ${loanData.documentNumber || documentNumber} | Generated: ${effectiveDate}`, '', '', '', '', '', '', ''],
    ['Empowering OFWs with fast, accessible, and secure financial solutions worldwide.', '', '', '', '', '', '', '']
  ]
  
  const mainSheet = XLSX.utils.aoa_to_sheet(mainData)
  
  // Style the Excel sheet
  const range = XLSX.utils.decode_range(mainSheet['!ref'] || 'A1:H1')
  
  // Style header rows
  for (let C = 0; C <= range.e.c; C++) {
    // Company name (row 0)
    const companyCell = XLSX.utils.encode_cell({ r: 0, c: C })
    if (mainSheet[companyCell]) {
      mainSheet[companyCell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 18, name: 'Arial' },
        fill: { fgColor: { rgb: '0056B3' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
    
    // Title (row 1)
    const titleCell = XLSX.utils.encode_cell({ r: 1, c: C })
    if (mainSheet[titleCell]) {
      mainSheet[titleCell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 16, name: 'Arial' },
        fill: { fgColor: { rgb: '00A86B' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  }
  
  // Style section headers
  const sectionHeaders = ['BETWEEN', 'TERM AND CONDITIONS', 'DETAILS OF LOAN', 'NOTICE:', 'REGULATORY COMPLIANCE']
  for (let R = 0; R <= range.e.r; R++) {
    const cell = XLSX.utils.encode_cell({ r: R, c: 0 })
    if (mainSheet[cell] && sectionHeaders.includes(mainSheet[cell].v)) {
      mainSheet[cell].s = {
        font: { bold: true, color: { rgb: '0056B3' }, sz: 14, name: 'Arial' },
        alignment: { horizontal: 'left', vertical: 'center' }
      }
    }
  }
  
  // Set column widths
  mainSheet['!cols'] = [
    { wch: 25 },  // Column A
    { wch: 50 },  // Column B
    { wch: 15 },  // Column C
    { wch: 25 },  // Column D
    { wch: 35 },  // Column E
    { wch: 15 },  // Column F
    { wch: 15 },  // Column G
    { wch: 15 }   // Column H
  ]
  
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Loan Approval Letter')
  
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  
  return new NextResponse(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="FinanciaPH-Loan-Approval-${documentNumber}.xlsx"`
    }
  })
}

function generateHTML(documentNumber: string, loanData: any, format: string) {
  // Company Information - FinanciaPH (without Investor Corp.)
  const companyName = "FinanciaPH"
  const secNumber = "CS202004089"
  const dateRegistered = "04-June-2020"
  const officeLocation = "15th Floor, One Corporate Centre, Julia Vargas Ave, Ortigas Center, Pasig City, Metro Manila"
  const contactEmail = "support@financiaph.com"
  const contactPhone = "(912) 345-6789"
  const loanOfficerPhone = "(912) 345-6789"
  
  // Format dates
  const effectiveDate = loanData.effectiveDate || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  }).replace(/,/g, '')
  
  const applicationDate = loanData.applicationDate || effectiveDate
  
  // Use document number for loan approval code
  const loanApprovalCode = loanData.documentNumber || loanData.loanApprovalCode || documentNumber

  // ID Card HTML with Loan Approved stamp
  const idCardHtml = loanData.idCardImage
    ? `<div style="position: relative; width: 100%; min-height: 240px; display: flex; align-items: center; justify-content: center;">
         <img src="${loanData.idCardImage}" alt="ID Card/Passport" style="max-width: 100%; max-height: 280px; width: auto; height: auto; object-fit: contain;" />
         <div style="position: absolute; bottom: 15px; right: 15px; width: 96px; height: 96px;">
           <img src="/logos/Loan_Approved.png" alt="Loan Approved Stamp" style="width: 100%; height: 100%; object-fit: contain; opacity: 0.9; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));" />
         </div>
       </div>`
    : `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
         <div style="font-size: 48px; margin-bottom: 10px;">🪪</div>
         <p style="color: #666; font-size: 14px; margin: 0;">ID Card/Passport Image</p>
         <div style="position: absolute; bottom: 15px; right: 15px; width: 96px; height: 96px;">
           <img src="/logos/Loan_Approved.png" alt="Loan Approved Stamp" style="width: 100%; height: 100%; object-fit: contain; opacity: 0.9; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));" />
         </div>
       </div>`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Loan Approval Letter - ${documentNumber}</title>
      <meta charset="UTF-8">
      <style>
        @media print {
          @page { 
            margin: 20mm; 
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 40px;
          color: #333;
          max-width: 900px;
          margin: 0 auto;
          background: white;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #0056B3;
        }
        .company-logo {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .company-logo img {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }
        .company-name h1 {
          color: #0056B3;
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        .company-tagline {
          color: #666;
          font-size: 12px;
          margin: 0;
        }
        .header-logos {
          display: flex;
          gap: 20px;
        }
        .logo-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .logo-item img {
          width: 56px;
          height: 56px;
          object-fit: contain;
          margin-bottom: 5px;
        }
        .logo-text {
          font-size: 9px;
          font-weight: bold;
          color: #333;
          line-height: 1.2;
        }
        .title-section {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ddd;
        }
        .title-section h2 {
          color: #00A86B;
          font-size: 28px;
          font-weight: bold;
          margin: 0 0 8px 0;
          letter-spacing: 1px;
        }
        .effective-date {
          color: #666;
          font-size: 14px;
        }
        .effective-date span {
          font-weight: bold;
          color: #333;
        }
        .between-section {
          display: flex;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        .lender-column, .borrower-column {
          flex: 1;
        }
        .lender-column {
          padding-right: 20px;
        }
        .borrower-column {
          padding-left: 20px;
          border-left: 1px solid #ddd;
        }
        .section-header {
          color: #0056B3;
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0 0 15px 0;
        }
        .info-row {
          margin-bottom: 10px;
        }
        .info-label {
          color: #666;
          font-size: 12px;
          margin: 0 0 2px 0;
        }
        .info-value {
          color: #333;
          font-size: 14px;
          font-weight: bold;
          margin: 0;
        }
        .referred-text {
          color: #00A86B;
          font-size: 13px;
          font-style: italic;
          margin: 0 0 15px 0;
        }
        .terms-section {
          margin-bottom: 30px;
          padding: 15px 0 15px 20px;
          border-left: 4px solid #0056B3;
        }
        .terms-section h3 {
          color: #0056B3;
          font-size: 18px;
          margin: 0 0 12px 0;
        }
        .terms-text {
          color: #333;
          font-size: 14px;
          line-height: 1.8;
          text-align: justify;
          margin: 0;
        }
        .two-column-layout {
          display: flex;
          gap: 40px;
          margin-bottom: 30px;
        }
        .loan-details {
          flex: 1;
        }
        .loan-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #0056B3;
        }
        .loan-header h3 {
          color: #0056B3;
          font-size: 18px;
          margin: 0 0 8px 0;
        }
        .loan-code {
          background: #e8f4ff;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          color: #0056B3;
          display: inline-block;
          align-self: flex-start;
        }
        .agree-text {
          color: #666;
          font-size: 12px;
          margin: 0 0 20px 0;
        }
        .loan-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px dashed #ddd;
        }
        .loan-detail-label {
          color: #666;
          font-size: 14px;
        }
        .loan-detail-value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        .loan-detail-sub {
          font-size: 12px;
          color: #666;
          font-weight: normal;
        }
        .id-card-section {
          flex: 1;
        }
        .id-card-section h3 {
          color: #0056B3;
          font-size: 18px;
          margin: 0 0 15px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #0056B3;
        }
        .id-card-container {
          position: relative;
          width: 100%;
          min-height: 260px;
          border: 2px dashed #0056B3;
          border-radius: 8px;
          background: #f9fcff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }
        .id-card-container img[alt="ID Card/Passport"] {
          object-fit: contain;
          max-height: 280px;
          width: auto;
          height: auto;
        }
        .notice-section {
          margin-bottom: 40px;
          padding: 15px 0;
        }
        .notice-section h3 {
          color: #0056B3;
          font-size: 18px;
          margin: 0 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #ddd;
        }
        .notice-list {
          list-style: none;
          padding: 0;
          margin: 0;
          counter-reset: item;
        }
        .notice-list li {
          margin-bottom: 15px;
          padding-left: 25px;
          position: relative;
          color: #333;
          font-size: 14px;
          line-height: 1.6;
        }
        .notice-list li:before {
          content: counter(item) ".";
          counter-increment: item;
          position: absolute;
          left: 0;
          font-weight: bold;
          color: #0056B3;
        }
        .highlight-code {
          background: #e8f4ff;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
          color: #0056B3;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 20px;
          margin-bottom: 30px;
          padding-top: 30px;
          border-top: 2px solid #333;
        }
        .dept-logos {
          display: flex;
          gap: 30px;
          flex: 1;
        }
        .dept-logo-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .dept-logo-item img {
          width: 80px;
          height: 80px;
          object-fit: contain;
          margin-bottom: 8px;
        }
        .dept-logo-text {
          font-size: 11px;
          font-weight: bold;
          color: #333;
          line-height: 1.3;
        }
        .signature-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          position: relative;
        }
        .signature-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .signature-text {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin: 0 0 5px 0;
          position: relative;
          z-index: 10;
          padding: 0 5px;
          background: white;
        }
        .stamp-wrapper {
          position: relative;
          width: 200px;
          height: 90px;
          margin-top: -12px;
          margin-bottom: -12px;
          z-index: 20;
        }
        .signature-stamp {
          position: absolute;
          right: 0;
          top: 10px;
          width: 180px;
          height: 70px;
          z-index: 30;
        }
        .signature-stamp img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: 0.8;
        }
        .financial-dept {
          text-align: right;
          position: relative;
          z-index: 10;
          padding: 0 5px;
          margin-top: -5px;
          background: white;
        }
        .dept-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin: 0;
        }
        .dept-company {
          font-size: 14px;
          color: #666;
          margin: 2px 0 0 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .footer-company {
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          color: #0056B3;
          margin: 0 0 15px 0;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .footer-left {
          text-align: left;
        }
        .footer-left p {
          font-size: 12px;
          color: #666;
          margin: 0 0 5px 0;
          line-height: 1.6;
        }
        .footer-right {
          text-align: right;
        }
        .footer-right p {
          margin: 0 0 5px 0;
        }
        .doc-label {
          font-size: 12px;
          font-weight: bold;
          color: #555;
        }
        .doc-number {
          font-size: 12px;
          font-family: monospace;
          color: #333;
        }
        .doc-date {
          font-size: 11px;
          color: #999;
          margin-top: 8px;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      </style>
    </head>
    <body>
      <!-- HEADER: Company Logo Left, 3 Department Logos Right -->
      <div class="header">
        <div class="company-logo">
          <img src="/logos/FinanciaPH_logo.png" alt="FinanciaPH Logo" />
          <div class="company-name">
            <h1>${companyName}</h1>
            <p class="company-tagline">Empowering OFWs with fast, accessible, and secure financial solutions worldwide.</p>
          </div>
        </div>
        
        <div class="header-logos">
          <!-- SEC Logo -->
          <div class="logo-item">
            <img src="/logos/Securities_and_Exchange_Commission_of_the_Philippines_(SEC).svg.png" alt="SEC Logo" />
            <span class="logo-text">Securities and</span>
            <span class="logo-text">Exchange</span>
            <span class="logo-text">Commission</span>
          </div>
          
          <!-- BSP Logo -->
          <div class="logo-item">
            <img src="/logos/Bangko_Sentral_ng_Pilipinas_2020_logo.png" alt="BSP Logo" />
            <span class="logo-text">Bangko Sentral</span>
            <span class="logo-text">ng Pilipinas</span>
          </div>
          
          <!-- DOF Logo -->
          <div class="logo-item">
            <img src="/logos/Department_of_Finance_(DOF).svg" alt="DOF Logo" />
            <span class="logo-text">Department of</span>
            <span class="logo-text">Finance</span>
          </div>
        </div>
      </div>

      <!-- CONDITIONAL APPROVED LETTER - Centered -->
      <div class="title-section">
        <h2>CONDITIONAL APPROVED LETTER</h2>
        <div class="effective-date">
          This letter is effective on : <span>${effectiveDate}</span>
        </div>
      </div>

      <!-- BETWEEN SECTION: Lender Left, Borrower Right -->
      <div class="between-section">
        <!-- Lender Column -->
        <div class="lender-column">
          <h3 class="section-header">BETWEEN</h3>
          <div class="info-row">
            <div class="info-label">COMPANY:</div>
            <div class="info-value">${companyName}</div>
          </div>
          <div class="referred-text">HEREINAFTER REFERRED: lender</div>
          <div class="info-row">
            <div class="info-label">SEC NUMBER:</div>
            <div class="info-value">${secNumber}</div>
          </div>
          <div class="info-row">
            <div class="info-label">DATE REGISTERED SEC:</div>
            <div class="info-value">${dateRegistered}</div>
          </div>
        </div>
        
        <!-- Borrower Column - With REAL customer data -->
        <div class="borrower-column">
          <h3 class="section-header">AND</h3>
          <div class="info-row">
            <div class="info-label">CUSTOMER NAME:</div>
            <div class="info-value">${loanData.borrowerName || 'N/A'}</div>
          </div>
          <div class="referred-text">HEREINAFTER REFERRED: Borrower</div>
          <div class="info-row">
            <div class="info-label">ID CARD NUMBER:</div>
            <div class="info-value">${loanData.idCardNumber || 'N/A'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">PHONE NUMBER:</div>
            <div class="info-value">${loanData.borrowerPhone || 'N/A'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">DATE APPLY LOAN:</div>
            <div class="info-value">${applicationDate}</div>
          </div>
        </div>
      </div>

      <!-- TERMS AND CONDITIONS -->
      <div class="terms-section">
        <h3>TERM AND CONDITIONS</h3>
        <p class="terms-text">
          On the behalf of ${companyName}, We're pleased to congratulate valued customer regarding your loan application has been approved on the terms set forth below, subject to the conditions set forth in the Conditions, Addendum to this Loan Approval, and further subject to any other conditions, FinanciaPH may establish upon receipt and review of documentation in satisfaction of the Initial Conditions (the "Subsequent Conditions"). For details of the monthly payment, the Loan Assistance Staff will provide details in a separate letter. Thank you.
        </p>
      </div>

      <!-- TWO COLUMN LAYOUT: Loan Details Left, ID Card Right -->
      <div class="two-column-layout">
        <!-- Loan Details - With REAL calculated loan data -->
        <div class="loan-details">
          <div class="loan-header">
            <h3>DETAILS OF LOAN</h3>
            <div class="loan-code">Loan Approved code: ${loanApprovalCode}</div>
          </div>
          <div class="agree-text">Agree between borrower and lender</div>
          
          <div>
            <div class="loan-detail-row">
              <span class="loan-detail-label">Loan amount :</span>
              <span class="loan-detail-value">${loanData.loanAmount || '₱0.00'}</span>
            </div>
            <div class="loan-detail-row">
              <span class="loan-detail-label">Interest Rate ${loanData.interestRate || '0%'} :</span>
              <span class="loan-detail-value">${loanData.interestAmount || '₱0.00 / Month'}</span>
            </div>
            <div class="loan-detail-row">
              <span class="loan-detail-label">Loan Term :</span>
              <span class="loan-detail-value">${loanData.loanTerm || '0 months'}</span>
            </div>
            <div class="loan-detail-row">
              <span class="loan-detail-label">Installment Date :</span>
              <span class="loan-detail-value">${loanData.installmentDate || '15th of next month'}</span>
            </div>
            <div class="loan-detail-row">
              <span class="loan-detail-label">Monthly Installment :</span>
              <span class="loan-detail-value">${loanData.monthlyInstallment || '₱0.00'}</span>
            </div>
            <div class="loan-detail-row">
              <span class="loan-detail-label">Total Repayment :</span>
              <span class="loan-detail-value">${loanData.totalRepayment || '₱0.00'}</span>
            </div>
          </div>
        </div>
        
        <!-- ID Card & Passport with Loan Approved Stamp -->
        <div class="id-card-section">
          <h3>ID CARD & PASSPORT</h3>
          <div class="id-card-container">
            ${idCardHtml}
          </div>
        </div>
      </div>

      <!-- NOTICE SECTION -->
      <div class="notice-section">
        <h3>NOTICE :</h3>
        <ul class="notice-list">
          <li>The Contract and Document has been processed by the automated contract and document system (A.I system).</li>
          <li>The borrower shall repay the principal and interest within the period specified in the contract. For the overdue portion, the lender is entitled to recover the loan and collect 5% of the total amount due.</li>
          <li>
            If you have any queries, our loan officers available on ${loanOfficerPhone} can explain it better to you. <br>
            <span style="font-size: 12px; color: #666;">
              (Note: For authentication purpose, please mention your Loan Approval Code: <span class="highlight-code">${loanApprovalCode}</span>)
            </span>
          </li>
        </ul>
      </div>

      <!-- SIGNATURE AND DEPARTMENT LOGOS SECTION -->
      <div class="signature-section">
        <!-- LEFT SIDE: Three Department Logos -->
        <div class="dept-logos">
          <!-- SEC Logo -->
          <div class="dept-logo-item">
            <img src="/logos/Securities_and_Exchange_Commission_of_the_Philippines_(SEC).svg.png" alt="SEC Logo" />
            <span class="dept-logo-text">Securities and</span>
            <span class="dept-logo-text">Exchange</span>
            <span class="dept-logo-text">Commission</span>
          </div>
          
          <!-- BSP Logo -->
          <div class="dept-logo-item">
            <img src="/logos/Bangko_Sentral_ng_Pilipinas_2020_logo.png" alt="BSP Logo" />
            <span class="dept-logo-text">Bangko Sentral</span>
            <span class="dept-logo-text">ng Pilipinas</span>
          </div>
          
          <!-- DOF Logo -->
          <div class="dept-logo-item">
            <img src="/logos/Department_of_Finance_(DOF).svg" alt="DOF Logo" />
            <span class="dept-logo-text">Department of</span>
            <span class="dept-logo-text">Finance</span>
          </div>
        </div>

        <!-- RIGHT SIDE: Signature with Stamp Overlay - Smaller stamp, overlays on both texts -->
        <div class="signature-container">
          <div class="signature-wrapper">
            <!-- TOP: Signature Text - Stamp overlays on this -->
            <div class="signature-text">Signature</div>
            
            <!-- MIDDLE: Stamp Overlay - Smaller size, overlaps both texts -->
            <div class="stamp-wrapper">
              <!-- Signature Stamp -->
              <div class="signature-stamp">
                <img src="/logos/Signature_Stamp.png" alt="Signature Stamp" />
              </div>
            </div>
            
            <!-- BOTTOM: Financial Department Text - Stamp overlays on this too -->
            <div class="financial-dept">
              <div class="dept-title">FINANCIAL DEPARTMENT</div>
              <div class="dept-company">${companyName}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER - Company centered, address left, document right -->
      <div class="footer">
        <div class="footer-company">${companyName}</div>
        <div class="footer-content">
          <div class="footer-left">
            <p>${officeLocation}</p>
            <p>${contactEmail} | ${contactPhone}</p>
          </div>
          <div class="footer-right">
            <p class="doc-label">Document No.</p>
            <p class="doc-number">${loanApprovalCode}</p>
            <p class="doc-date">Generated: ${effectiveDate}</p>
          </div>
        </div>
      </div>
      
      <script>
        if (${format === 'pdf'}) {
          setTimeout(() => {
            window.print();
            setTimeout(() => {
              if (window.history.length > 1) {
                window.close();
              }
            }, 1000);
          }, 500);
        }
      </script>
    </body>
    </html>
  `
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="FinanciaPH-Loan-Approval-${documentNumber}.html"`
    }
  })
}
