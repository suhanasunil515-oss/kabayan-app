import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { APIErrorResponse } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' } as APIErrorResponse,
        { status: 401 }
      )
    }

    const { documentType } = await req.json()

    if (!documentType || !['application', 'contract', 'statement'].includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' } as APIErrorResponse,
        { status: 400 }
      )
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(
        'full_name, id_number, phone_number, email, bank_name, bank_details, monthly_income'
      )
      .eq('id', parseInt(userId))
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' } as APIErrorResponse,
        { status: 404 }
      )
    }

    // Get latest loan
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select(
        'id, loan_amount, interest_rate, loan_period_months, status, created_at, updated_at'
      )
      .eq('user_id', parseInt(userId))
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (loanError || !loan) {
      return NextResponse.json(
        { error: 'No active loan found' } as APIErrorResponse,
        { status: 404 }
      )
    }

    // Get loan contract if available
    let contract = null
    if (documentType === 'contract') {
      const { data: contractData } = await supabase
        .from('loan_contracts')
        .select('*')
        .eq('loan_id', loan.id)
        .single()

      contract = contractData
    }

    // Generate PDF content based on document type
    let pdfContent = ''

    if (documentType === 'application') {
      pdfContent = generateApplicationPDF(user, loan)
    } else if (documentType === 'contract') {
      pdfContent = generateContractPDF(user, loan, contract)
    } else if (documentType === 'statement') {
      pdfContent = generateStatementPDF(user, loan)
    }

    // Return base64 encoded PDF content
    const base64PDF = Buffer.from(pdfContent).toString('base64')

    return NextResponse.json({
      success: true,
      data: {
        documentType,
        content: base64PDF,
        fileName: `${documentType}_${new Date().toISOString().split('T')[0]}.pdf`,
        mimeType: 'application/pdf',
      },
    })
  } catch (error) {
    console.error('[v0] PDF generation POST error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' } as APIErrorResponse,
      { status: 500 }
    )
  }
}

// Helper function to generate application PDF
function generateApplicationPDF(user: any, loan: any): string {
  const date = new Date().toLocaleDateString()
  return `
%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >> endobj
4 0 obj << /Length 500 >> stream
BT
/F1 18 Tf 50 750 Td
(LOAN APPLICATION) Tj
0 -30 Td
/F1 12 Tf
(Application Date: ${date}) Tj
0 -25 Td
(Applicant Name: ${user.full_name}) Tj
0 -20 Td
(ID Number: ${user.id_number}) Tj
0 -20 Td
(Phone: ${user.phone_number}) Tj
0 -20 Td
(Bank: ${user.bank_name || 'N/A'}) Tj
0 -20 Td
(Monthly Income: ₱${user.monthly_income || 0}) Tj
0 -30 Td
(--- LOAN DETAILS ---) Tj
0 -20 Td
(Loan Amount: ₱${loan.loan_amount}) Tj
0 -20 Td
(Interest Rate: ${loan.interest_rate}%) Tj
0 -20 Td
(Loan Period: ${loan.loan_period_months} months) Tj
0 -20 Td
(Status: ${loan.status}) Tj
ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000273 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
823
%%EOF
  `
}

// Helper function to generate contract PDF
function generateContractPDF(user: any, loan: any, contract: any): string {
  const date = new Date().toLocaleDateString()
  return `
%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >> endobj
4 0 obj << /Length 600 >> stream
BT
/F1 18 Tf 50 750 Td
(LOAN CONTRACT) Tj
0 -30 Td
/F1 12 Tf
(Contract Date: ${date}) Tj
0 -25 Td
(Borrower: ${user.full_name}) Tj
0 -20 Td
(ID Number: ${user.id_number}) Tj
0 -30 Td
(--- CONTRACT TERMS ---) Tj
0 -20 Td
(Principal Amount: ₱${contract?.loan_amount || loan.loan_amount}) Tj
0 -20 Td
(Interest Rate: ${contract?.interest_rate || loan.interest_rate}% per month) Tj
0 -20 Td
(Loan Period: ${contract?.loan_period || loan.loan_period_months} months) Tj
0 -20 Td
(Monthly Payment: ₱${calculateMonthlyPayment(contract?.loan_amount || loan.loan_amount, contract?.interest_rate || loan.interest_rate, contract?.loan_period || loan.loan_period_months)}) Tj
0 -30 Td
(By signing below, both parties agree to the terms and conditions of this contract.) Tj
ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000273 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
923
%%EOF
  `
}

// Helper function to generate statement PDF
function generateStatementPDF(user: any, loan: any): string {
  const date = new Date().toLocaleDateString()
  return `
%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >> endobj
4 0 obj << /Length 550 >> stream
BT
/F1 18 Tf 50 750 Td
(LOAN STATEMENT) Tj
0 -30 Td
/F1 12 Tf
(Statement Date: ${date}) Tj
0 -25 Td
(Account Holder: ${user.full_name}) Tj
0 -20 Td
(Account ID: ${user.id_number}) Tj
0 -30 Td
(--- ACCOUNT SUMMARY ---) Tj
0 -20 Td
(Original Loan Amount: ₱${loan.loan_amount}) Tj
0 -20 Td
(Interest Rate: ${loan.interest_rate}%) Tj
0 -20 Td
(Loan Period: ${loan.loan_period_months} months) Tj
0 -20 Td
(Current Status: ${loan.status}) Tj
0 -20 Td
(Monthly Payment: ₱${calculateMonthlyPayment(loan.loan_amount, loan.interest_rate, loan.loan_period_months)}) Tj
ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000273 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
873
%%EOF
  `
}

// Flat-rate formula: Monthly = (Principal / Term) + (Principal × 0.005)
function calculateMonthlyPayment(
  principal: number,
  monthlyRatePercent: number,
  months: number
): string {
  if (months === 0) return principal.toFixed(2)
  const x = principal / months
  const y = principal * (monthlyRatePercent / 100)
  return (x + y).toFixed(2)
}
