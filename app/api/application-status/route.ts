import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { ApplicationStatusResponse, APIErrorResponse } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' } as APIErrorResponse,
        { status: 401 }
      )
    }

    // Get latest active loan
    const { data: loans, error: loanError } = await supabase
      .from('loans')
      .select('id, status, created_at, updated_at')
      .eq('user_id', parseInt(userId))
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (loanError || !loans) {
      return NextResponse.json(
        { error: 'No active loan found' } as APIErrorResponse,
        { status: 404 }
      )
    }

    // Get document verification statuses
    const { data: documents, error: docError } = await supabase
      .from('document_verifications')
      .select('document_type, verification_status, verified_at')
      .eq('loan_id', loans.id)

    if (docError) {
      console.error('[v0] Document query error:', docError)
      return NextResponse.json(
        { error: 'Failed to fetch documents' } as APIErrorResponse,
        { status: 500 }
      )
    }

    // Calculate completion percentage based on status stages
    const stages = [
      { name: 'Application', status: 'Application' },
      { name: 'KYC Verification', status: 'KYC Verification' },
      { name: 'Document Review', status: 'Document Review' },
      { name: 'Approved', status: 'Approved' },
      { name: 'Withdrawal Processing', status: 'Withdrawal Processing' },
      { name: 'Withdrawal Success', status: 'Withdrawal Success' },
    ]

    const currentStageIndex = stages.findIndex(s => s.status === loans.status)
    const completionPercentage = currentStageIndex === -1 
      ? 0 
      : Math.round(((currentStageIndex + 1) / stages.length) * 100)

    // Determine next steps
    const nextSteps: string[] = []
    if (loans.status === 'Application') {
      nextSteps.push('Complete KYC verification')
      nextSteps.push('Upload required documents')
    } else if (loans.status === 'KYC Verification') {
      nextSteps.push('Wait for KYC verification to complete')
      nextSteps.push('Upload additional documents if requested')
    } else if (loans.status === 'Document Review') {
      nextSteps.push('Wait for document review')
      nextSteps.push('Respond to verification requests promptly')
    } else if (loans.status === 'Approved') {
      nextSteps.push('Review loan agreement')
      nextSteps.push('Submit withdrawal request')
    } else if (loans.status === 'Withdrawal Processing') {
      nextSteps.push('Wait for banking system processing')
      nextSteps.push('Check your bank account for the transfer')
    }

    const response: ApplicationStatusResponse = {
      loanId: loans.id,
      status: loans.status,
      currentStage: stages[currentStageIndex]?.name || 'Unknown',
      completionPercentage,
      documentsStatus: (documents || []).map(doc => ({
        documentType: doc.document_type,
        status: doc.verification_status,
        verifiedAt: doc.verified_at,
      })),
      nextSteps,
      lastUpdated: loans.updated_at,
    }

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error('[v0] Application status GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' } as APIErrorResponse,
      { status: 500 }
    )
  }
}
