import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const { documentNumber, loanData, repaymentSchedule, format } = await request.json()

    if (!documentNumber || !loanData || !repaymentSchedule || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: documentNumber, loanData, repaymentSchedule, format' },
        { status: 400 }
      )
    }

    if (format === 'excel') {
      return await generateExcel(loanData, repaymentSchedule, documentNumber)
    } else {
      return generateHTML(loanData, repaymentSchedule, format)
    }
  } catch (error) {
    console.error('[REPAYMENT SCHEDULE] Export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate document', details: String(error) },
      { status: 500 }
    )
  }
}

async function generateExcel(loanData: any, schedule: any[], documentNumber: string) {
  const workbook = XLSX.utils.book_new()
  
  // PREMIUM SINGLE SHEET DESIGN
  const mainData = [
    // HEADER
    ['FinanciaPH Investor Corp.', '', '', '', '', '', '', ''],
    ['REPAYMENT SCHEDULE', '', '', '', '', '', '', ''],
    ['Document Number:', documentNumber, '', '', '', '', '', ''],
    ['Borrower:', loanData.borrowerName, '', '', '', '', '', ''],
    ['Generated:', new Date().toLocaleString(), '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // LOAN SUMMARY - COLORED BOX
    ['', '═ LOAN SUMMARY ═════════════════════════════════════════════════════', '', '', '', '', '', ''],
    ['Loan Amount:', `₱${Number(loanData.loanAmount).toLocaleString('en-US')}`, '', '', '', '', '', ''],
    ['Interest Rate:', `${loanData.interestRate}%`, '', '', '', '', '', ''],
    ['Loan Term:', `${loanData.loanTerm} months`, '', '', '', '', '', ''],
    ['Start Date:', loanData.startDate, '', '', '', '', '', ''],
    ['Monthly Payment:', `₱${schedule[0]?.total?.toFixed(2) || '0.00'}`, '', '', '', '', '', ''],
    ['Total Payment:', `₱${schedule.reduce((sum, item) => sum + item.total, 0).toFixed(2)}`, '', '', '', '', '', ''],
    ['Total Interest:', `₱${schedule.reduce((sum, item) => sum + item.interest, 0).toFixed(2)}`, '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // SCHEDULE TABLE HEADER
    ['', '═ REPAYMENT SCHEDULE ═══════════════════════════════════════════════', '', '', '', '', '', ''],
    ['Month', 'Due Date', 'Principal', 'Interest', 'Total Payment', 'Balance', 'Cumulative Principal', 'Cumulative Interest'],
    
    // SCHEDULE DATA
    ...schedule.map((item, index) => {
      const cumulativePrincipal = schedule.slice(0, index + 1).reduce((sum, i) => sum + i.principal, 0)
      const cumulativeInterest = schedule.slice(0, index + 1).reduce((sum, i) => sum + i.interest, 0)
      
      return [
        item.month,
        item.dueDate,
        Number(item.principal.toFixed(2)),
        Number(item.interest.toFixed(2)),
        Number(item.total.toFixed(2)),
        Number(item.balance.toFixed(2)),
        Number(cumulativePrincipal.toFixed(2)),
        Number(cumulativeInterest.toFixed(2))
      ]
    }),
    
    // TOTALS
    ['', '', '', '', '', '', '', ''],
    ['TOTALS', '',
      schedule.reduce((sum, item) => sum + item.principal, 0).toFixed(2),
      schedule.reduce((sum, item) => sum + item.interest, 0).toFixed(2),
      schedule.reduce((sum, item) => sum + item.total, 0).toFixed(2),
      '',
      schedule.reduce((sum, item) => sum + item.principal, 0).toFixed(2),
      schedule.reduce((sum, item) => sum + item.interest, 0).toFixed(2)
    ],
    ['', '', '', '', '', '', '', ''],
    
    // PAYMENT INSTRUCTIONS
    ['', '═ PAYMENT INSTRUCTIONS ═════════════════════════════════════════════', '', '', '', '', '', ''],
    ['•', 'Payments due on the specified date each month', '', '', '', '', '', ''],
    ['•', 'Late payment penalty: 5% of overdue amount', '', '', '', '', '', ''],
    ['•', 'Early repayment allowed without penalty', '', '', '', '', '', ''],
    ['•', 'Contact support@financiaph.com for assistance', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // COMPANY FOOTER
    ['FinanciaPH Investor Corp.', '', '', '', '', '', '', ''],
    ['Megaworld Blvd, cor Digital Rd, Manduruiao, Iloilo City, Philippines', '', '', '', '', '', '', ''],
    ['Phone: (033) 123-4567 | Email: support@financiaph.com', '', '', '', '', '', '', ''],
    ['Registered with BSP, SEC, and DOF', '', '', '', '', '', '', '']
  ]
  
  const mainSheet = XLSX.utils.aoa_to_sheet(mainData)
  
  // APPLY PREMIUM STYLING
  const range = XLSX.utils.decode_range(mainSheet['!ref'] || 'A1:H1')
  
  // Style headers
  for (let C = 0; C <= range.e.c; C++) {
    // Company header (row 0)
    const companyCell = XLSX.utils.encode_cell({ r: 0, c: C })
    if (mainSheet[companyCell]) {
      mainSheet[companyCell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 16, name: 'Arial' },
        fill: { fgColor: { rgb: '0056B3' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
    
    // Title (row 1)
    const titleCell = XLSX.utils.encode_cell({ r: 1, c: C })
    if (mainSheet[titleCell]) {
      mainSheet[titleCell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14, name: 'Arial' },
        fill: { fgColor: { rgb: '00A86B' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
    
    // Section headers (rows with "═")
    for (let R = 6; R <= range.e.r; R++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: 1 })
      if (mainSheet[cell] && mainSheet[cell].v && mainSheet[cell].v.includes('═')) {
        mainSheet[cell].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12, name: 'Arial' },
          fill: { fgColor: { rgb: '666666' }, patternType: 'solid' },
          alignment: { horizontal: 'left', vertical: 'center' }
        }
      }
    }
    
    // Table header (row after loan summary)
    const tableHeaderRow = 15
    const headerCell = XLSX.utils.encode_cell({ r: tableHeaderRow, c: C })
    if (mainSheet[headerCell]) {
      mainSheet[headerCell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, name: 'Arial' },
        fill: { fgColor: { rgb: '333333' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  }
  
  // Style loan summary section (rows 7-14)
  for (let R = 7; R <= 14; R++) {
    for (let C = 0; C <= 1; C++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C })
      if (mainSheet[cell]) {
        const isLabel = C === 0
        const bgColor = (R % 2 === 0) ? 'E8F4FF' : 'F0F8FF'
        
        mainSheet[cell].s = {
          font: { 
            bold: isLabel, 
            color: { rgb: isLabel ? '0056B3' : '333333' },
            name: 'Arial',
            sz: isLabel ? 11 : 10
          },
          fill: { fgColor: { rgb: bgColor }, patternType: 'solid' },
          alignment: { horizontal: 'left', vertical: 'center' }
        }
      }
    }
  }
  
  // Style schedule table (rows 16+)
  const scheduleStartRow = 16
  const scheduleEndRow = scheduleStartRow + schedule.length - 1
  
  for (let R = scheduleStartRow; R <= scheduleEndRow; R++) {
    for (let C = 0; C <= 7; C++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C })
      if (mainSheet[cell]) {
        const isMonthCol = C === 0
        const isAmountCol = C >= 2 && C <= 7
        const isLastPayment = R === scheduleEndRow
        const bgColor = (R % 2 === 0) ? 'F8F9FA' : 'FFFFFF'
        
        mainSheet[cell].s = {
          font: { 
            bold: isMonthCol || isLastPayment,
            color: { rgb: isLastPayment ? 'FFFFFF' : '333333' },
            name: 'Arial',
            sz: 10
          },
          fill: { 
            fgColor: { 
              rgb: isLastPayment ? '00A86B' : (isAmountCol && C === 4 ? 'E6F2FF' : bgColor)
            }, 
            patternType: 'solid' 
          },
          alignment: { 
            horizontal: isMonthCol ? 'center' : (isAmountCol ? 'right' : 'left'), 
            vertical: 'center'
          }
        }
        
        // Currency formatting for amount columns
        if (isAmountCol && (C === 2 || C === 3 || C === 4 || C === 5 || C === 6 || C === 7)) {
          mainSheet[cell].z = C === 0 ? '0' : '₱#,##0.00'
        }
      }
    }
  }
  
  // Style totals row
  const totalRow = scheduleEndRow + 2
  for (let C = 0; C <= 7; C++) {
    const cell = XLSX.utils.encode_cell({ r: totalRow, c: C })
    if (mainSheet[cell]) {
      mainSheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, name: 'Arial' },
        fill: { fgColor: { rgb: '0056B3' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  }
  
  // Set column widths
  mainSheet['!cols'] = [
    { wch: 6 },   // Month
    { wch: 12 },  // Due Date
    { wch: 12 },  // Principal
    { wch: 12 },  // Interest
    { wch: 14 },  // Total Payment
    { wch: 14 },  // Balance
    { wch: 18 },  // Cumulative Principal
    { wch: 18 }   // Cumulative Interest
  ]
  
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Repayment Schedule')
  
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  
  return new NextResponse(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Repayment-Schedule-${documentNumber}.xlsx"`
    }
  })
}

function generateHTML(loanData: any, schedule: any[], format: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Repayment Schedule - ${loanData.documentNumber}</title>
      <style>
        @media print {
          @page { margin: 10mm; }
        }
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 3px solid #0056B3;
          padding-bottom: 10px;
        }
        .header h1 {
          color: #0056B3;
          margin: 0;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin: 20px 0;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-label {
          font-size: 12px;
          color: #666;
          font-weight: bold;
        }
        .summary-value {
          font-size: 16px;
          color: #0056B3;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background: #0056B3;
          color: white;
          padding: 12px;
          text-align: center;
          font-weight: bold;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: right;
        }
        td:first-child {
          text-align: center;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FinanciaPH - Repayment Schedule</h1>
        <p>Document: ${loanData.documentNumber} | Borrower: ${loanData.borrowerName}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Loan Amount</div>
          <div class="summary-value">₱${Number(loanData.loanAmount).toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Interest Rate</div>
          <div class="summary-value">${loanData.interestRate}%</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Loan Term</div>
          <div class="summary-value">${loanData.loanTerm} months</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Monthly Payment</div>
          <div class="summary-value">₱${schedule[0]?.total?.toFixed(2) || '0.00'}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Due Date</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>Total Payment</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          ${schedule.map(item => `
            <tr>
              <td>${item.month}</td>
              <td style="text-align: left;">${item.dueDate}</td>
              <td>₱${item.principal.toFixed(2)}</td>
              <td>₱${item.interest.toFixed(2)}</td>
              <td><strong>₱${item.total.toFixed(2)}</strong></td>
              <td>₱${item.balance.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p><strong>FinanciaPH Investor Corp.</strong></p>
        <p>Megaworld Blvd, cor Digital Rd, Manduruiao, Iloilo City, Philippines</p>
        <p>Total Principal: ₱${loanData.loanAmount} | Total Interest: ₱${schedule.reduce((sum, item) => sum + item.interest, 0).toFixed(2)} | Total Payment: ₱${schedule.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</p>
      </div>
      
      <script>
        // Auto-print for PDF
        if (${format === 'pdf'}) {
          setTimeout(() => {
            window.print();
            setTimeout(() => {
              window.close();
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
      'Content-Disposition': `attachment; filename="repayment-schedule-${loanData.documentNumber}.${format === 'pdf' ? 'html' : 'html'}"`
    }
  })
}
