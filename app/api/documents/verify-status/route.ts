import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { DocumentVerification, APIErrorResponse } from '@/lib/types'

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

    // Get latest loan for user
    const { data: loans, error: loanError } = await supabase
      .from('loans')
      .select('id')
      .eq('user_id', parseInt(userId))
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (loanError || !loans || loans.length === 0) {
      return NextResponse.json(
        { error: 'No active loan found' } as APIErrorResponse,
        { status: 404 }
      )
    }

    const loanId = loans[0].id

    // Get document verifications for this loan
    const { data: documents, error: docError } = await supabase
      .from('document_verifications')
      .select('*')
      .eq('loan_id', loanId)
      .order('created_at', { ascending: false })

    if (docError) {
      console.error('[v0] Document query error:', docError)
      return NextResponse.json(
        { error: 'Failed to fetch document verifications' } as APIErrorResponse,
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: documents as DocumentVerification[],
      loanId,
    })
  } catch (error) {
    console.error('[v0] Document verification GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' } as APIErrorResponse,
      { status: 500 }
    )
  }
}
