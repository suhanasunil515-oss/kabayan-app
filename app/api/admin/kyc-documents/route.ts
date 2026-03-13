import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const loanId = searchParams.get('loan_id')

    if (!loanId) {
      return NextResponse.json(
        { error: 'loan_id parameter is required' },
        { status: 400 }
      )
    }

    console.log('[v0] Fetching KYC documents for loan_id:', loanId)

    let loanApp: { id: number; kyc_front_url?: string | null; kyc_back_url?: string | null; selfie_url?: string | null; document_number?: string } | null = null

    // 1) Try loan_applications by id (loan_id might be loan_application id)
    const { data: appById, error: appError } = await supabase
      .from('loan_applications')
      .select('id, kyc_front_url, kyc_back_url, selfie_url, document_number')
      .eq('id', parseInt(loanId))
      .maybeSingle()

    if (!appError && appById) {
      loanApp = appById
    }

    // 2) If not found, loan_id may be loans.id — get loan_application_id from loans then fetch
    if (!loanApp) {
      const { data: loanRow, error: loanError } = await supabase
        .from('loans')
        .select('id, loan_application_id, user_id, document_number')
        .eq('id', parseInt(loanId))
        .maybeSingle()

      if (!loanError && loanRow?.loan_application_id) {
        const { data: appByLoanId } = await supabase
          .from('loan_applications')
          .select('id, kyc_front_url, kyc_back_url, selfie_url, document_number')
          .eq('id', loanRow.loan_application_id)
          .maybeSingle()
        if (appByLoanId) loanApp = appByLoanId
      }

      // 3) Fallback: find latest loan_application for this user (by user_id from loans)
      if (!loanApp && loanRow?.user_id) {
        const { data: latestApp } = await supabase
          .from('loan_applications')
          .select('id, kyc_front_url, kyc_back_url, selfie_url, document_number')
          .eq('user_id', loanRow.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (latestApp) loanApp = latestApp
      }
    }

    if (loanApp && (loanApp.kyc_front_url || loanApp.kyc_back_url || loanApp.selfie_url)) {
      console.log('[v0] Found KYC in loan_applications')
      return NextResponse.json({
        kyc_documents: [
          {
            id: loanApp.id,
            front_id_image: loanApp.kyc_front_url ?? null,
            back_id_image: loanApp.kyc_back_url ?? null,
            selfie_image: loanApp.selfie_url ?? null,
            document_number: loanApp.document_number ?? null
          }
        ]
      })
    }

    // Fallback: users.id_photos (legacy)
    const { data: loanRow } = await supabase
      .from('loans')
      .select('id, user_id, document_number')
      .eq('id', parseInt(loanId))
      .maybeSingle()

    if (loanRow?.user_id) {
      const { data: user } = await supabase
        .from('users')
        .select('id, id_photos')
        .eq('id', loanRow.user_id)
        .maybeSingle()

      if (user?.id_photos && Array.isArray(user.id_photos) && user.id_photos.length > 0) {
        const frontPhoto = user.id_photos.find((p: any) => p.type === 'front' || p.type === 'id_front')
        const backPhoto = user.id_photos.find((p: any) => p.type === 'back' || p.type === 'id_back')
        const selfiePhoto = user.id_photos.find((p: any) => p.type === 'selfie')
        if (frontPhoto || backPhoto || selfiePhoto) {
          return NextResponse.json({
            kyc_documents: [
              {
                id: loanRow.id,
                front_id_image: frontPhoto?.url ?? frontPhoto ?? null,
                back_id_image: backPhoto?.url ?? backPhoto ?? null,
                selfie_image: selfiePhoto?.url ?? selfiePhoto ?? null,
                document_number: loanRow.document_number
              }
            ]
          })
        }
      }
    }

    console.log('[v0] No KYC documents found for loan_id:', loanId)
    return NextResponse.json({
      kyc_documents: []
    })
  } catch (error) {
    console.error('[v0] KYC API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KYC documents' },
      { status: 500 }
    )
  }
}
