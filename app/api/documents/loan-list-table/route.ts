import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const { loans, format } = await request.json()

    if (!loans || !Array.isArray(loans) || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: loans, format' },
        { status: 400 }
      )
    }

    if (format === 'excel') {
      return await generateExcel(loans)
    } else {
      return generateHTML(loans, format)
    }
  } catch (error) {
    console.error('[LOAN LIST] Export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate document', details: String(error) },
      { status: 500 }
    )
  }
}

async function generateExcel(loans: any[]) {
  const workbook = XLSX.utils.book_new()

  // PREMIUM SINGLE SHEET DESIGN
  const mainData = [
    // HEADER
    ['FinanciaPH Investor Corp.', '', '', '', '', '', '', '', ''],
    ['LOAN LIST TABLE - COMPREHENSIVE REPORT', '', '', '', '', '', '', '', ''],
    ['Generated:', new Date().toLocaleString(), '', '', '', '', '', '', ''],
    ['Total Records:', loans.length, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],

    // TABLE HEADER
    ['No.', 'Document Number', 'Applicant Name', 'Loan Type', 'Loan Amount', 'Term', 'Status', 'Interest Rate', 'Applied Date'],

    // TABLE DATA
    ...loans.map((loan, index) => [
      index + 1,
      loan.document_number,
      loan.borrower_name,
      loan.loan_type || 'Personal Loan',
      Number(loan.loan_amount || 0),
      `${loan.loan_period_months || 12} months`,
      loan.status,
      `${loan.interest_rate || '0.00'}%`,
      loan.application_date || new Date().toLocaleDateString()
    ]),

    // TOTALS ROW
    ['', '', '', '', '', '', '', '', ''],
    ['TOTALS', '', '', '',
      `₱${loans.reduce((sum, loan) => sum + Number(loan.loan_amount || 0), 0).toLocaleString()}`,
      '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],

    // SUMMARY SECTION
    ['', '═ SUMMARY STATISTICS ═══════════════════════════════════════════════', '', '', '', '', '', '', ''],
    ['Total Loans:', loans.length, '', '', '', '', '', '', ''],
    ['Total Amount:', `₱${loans.reduce((sum, loan) => sum + Number(loan.loan_amount || 0), 0).toLocaleString()}`, '', '', '', '', '', '', ''],
    ['Average Loan:', `₱${Math.round(loans.reduce((sum, loan) => sum + Number(loan.loan_amount || 0), 0) / loans.length).toLocaleString()}`, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['Status Breakdown:', '', '', '', '', '', '', '', ''],
    ['Approved:', loans.filter(l => l.status === 'APPROVED').length, '', '', '', '', '', '', ''],
    ['Declined:', loans.filter(l => l.status === 'DECLINED').length, '', '', '', '', '', '', ''],
    ['Pending:', loans.filter(l => l.status === 'PENDING').length, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],

    // LOAN TYPE BREAKDOWN
    ['Loan Type Breakdown:', '', '', '', '', '', '', '', ''],
    ...Array.from(new Set(loans.map(l => l.loan_type || 'Personal Loan')))
      .map(type => [type, loans.filter(l => (l.loan_type || 'Personal Loan') === type).length, '', '', '', '', '', '', '']),
    ['', '', '', '', '', '', '', '', ''],

    // COMPANY FOOTER
    ['FinanciaPH Investor Corp.', '', '', '', '', '', '', '', ''],
    ['Megaworld Blvd, cor Digital Rd, Manduruiao, Iloilo City, Philippines', '', '', '', '', '', '', '', ''],
    ['Contact: support@financiaph.com | Phone: (033) 123-4567', '', '', '', '', '', '', '', ''],
    ['Registered with BSP, SEC, and DOF', '', '', '', '', '', '', '', '']
  ]

  const mainSheet = XLSX.utils.aoa_to_sheet(mainData)

  // APPLY PREMIUM STYLING
  const range = XLSX.utils.decode_range(mainSheet['!ref'] || 'A1:I1')

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

    // Table header (row 5)
    const headerCell = XLSX.utils.encode_cell({ r: 5, c: C })
    if (mainSheet[headerCell]) {
      mainSheet[headerCell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, name: 'Arial' },
        fill: { fgColor: { rgb: '333333' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }

    // Summary header (row after data)
    const summaryHeaderRow = 6 + loans.length + 3
    const summaryCell = XLSX.utils.encode_cell({ r: summaryHeaderRow, c: 1 })
    if (mainSheet[summaryCell] && mainSheet[summaryCell].v && mainSheet[summaryCell].v.includes('═')) {
      mainSheet[summaryCell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12, name: 'Arial' },
        fill: { fgColor: { rgb: '666666' }, patternType: 'solid' },
        alignment: { horizontal: 'left', vertical: 'center' }
      }
    }
  }

  // Style data rows with alternating colors and status colors
  for (let R = 6; R < 6 + loans.length; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C })
      if (mainSheet[cell]) {
        const isNumberCol = C === 0
        const isAmountCol = C === 4
        const isStatusCol = C === 6
        const bgColor = (R % 2 === 0) ? 'F8F9FA' : 'FFFFFF'

        let statusColor = bgColor
        if (isStatusCol && mainSheet[cell].v) {
          const status = mainSheet[cell].v
          if (status === 'APPROVED') statusColor = 'C6EFCE'
          if (status === 'DECLINED') statusColor = 'FFC7CE'
          if (status === 'PENDING') statusColor = 'FFEB9C'
        }

        mainSheet[cell].s = {
          font: {
            bold: isNumberCol || isStatusCol,
            color: { rgb: isStatusCol ? '000000' : '333333' },
            name: 'Arial',
            sz: 10
          },
          fill: { fgColor: { rgb: isStatusCol ? statusColor : bgColor }, patternType: 'solid' },
          alignment: {
            horizontal: isNumberCol ? 'center' : 'left',
            vertical: 'center'
          }
        }

        // Currency formatting for amount column
        if (isAmountCol) {
          mainSheet[cell].z = '₱#,##0.00'
        }

        // Percentage formatting for interest rate
        if (C === 7 && mainSheet[cell].v && mainSheet[cell].v.includes('%')) {
          mainSheet[cell].z = '0.00%'
        }
      }
    }
  }

  // Style totals row
  const totalRow = 6 + loans.length + 1
  for (let C = 0; C <= range.e.c; C++) {
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
    { wch: 5 },   // No.
    { wch: 22 },  // Document Number
    { wch: 20 },  // Applicant Name
    { wch: 15 },  // Loan Type
    { wch: 15 },  // Loan Amount
    { wch: 10 },  // Term
    { wch: 12 },  // Status
    { wch: 12 },  // Interest Rate
    { wch: 15 }   // Applied Date
  ]

  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Loan List')

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Loan-List-Table-${new Date().getTime()}.xlsx"`
    }
  })
}

function generateHTML(loans: any[], format: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Loan List Table</title>
      <style>
        @media print {
          @page { margin: 10mm; size: landscape; }
        }
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
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
          background: #f8f9fa;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
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
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background: #f9f9f9;
        }
        .status-approved {
          background: #d4edda;
          color: #155724;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: bold;
          display: inline-block;
        }
        .status-declined {
          background: #f8d7da;
          color: #721c24;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: bold;
          display: inline-block;
        }
        .status-pending {
          background: #fff3cd;
          color: #856404;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: bold;
          display: inline-block;
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
        <h1>FinanciaPH - Loan List Table</h1>
        <p>Generated: ${new Date().toLocaleString()} | Total Loans: ${loans.length}</p>
      </div>
      
      <div class="summary">
        <strong>Summary:</strong> 
        Approved: ${loans.filter(l => l.status === 'APPROVED').length} | 
        Declined: ${loans.filter(l => l.status === 'DECLINED').length} | 
        Pending: ${loans.filter(l => l.status === 'PENDING').length} |
        Total Amount: ₱${loans.reduce((sum, loan) => sum + Number(loan.loan_amount || 0), 0).toLocaleString()}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Document Number</th>
            <th>Applicant Name</th>
            <th>Loan Type</th>
            <th>Loan Amount</th>
            <th>Term</th>
            <th>Status</th>
            <th>Interest Rate</th>
          </tr>
        </thead>
        <tbody>
          ${loans.map((loan, index) => `
            <tr>
              <td>${index + 1}</td>
              <td><strong>${loan.document_number}</strong></td>
              <td>${loan.borrower_name}</td>
              <td>${loan.loan_type || 'Personal Loan'}</td>
              <td>₱${Number(loan.loan_amount).toLocaleString()}</td>
              <td>${loan.loan_period_months} months</td>
              <td>
                <span class="status-${loan.status.toLowerCase()}">
                  ${loan.status}
                </span>
              </td>
              <td>${loan.interest_rate || '0.00'}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p><strong>FinanciaPH Investor Corp.</strong></p>
        <p>Megaworld Blvd, cor Digital Rd, Manduruiao, Iloilo City, Philippines</p>
        <p>Page 1 of 1</p>
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
      'Content-Disposition': `attachment; filename="loan-list.${format === 'pdf' ? 'html' : 'html'}"`
    }
  })
}
