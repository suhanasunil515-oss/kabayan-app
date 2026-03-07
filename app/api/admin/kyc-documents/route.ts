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

    // Try to fetch from loan_applications table first (where KYC images are stored)
    const { data: loanApplications, error: appError } = await supabase
      .from('loan_applications')
      .select('id, kyc_front_url, kyc_back_url, user_id, document_number')
      .eq('id', parseInt(loanId))
      .single()

    if (appError) {
      console.log('[v0] loan_applications fetch error:', appError.message)
    }

    if (loanApplications?.kyc_front_url) {
      console.log('[v0] Found KYC front image in loan_applications')
      return NextResponse.json({
        kyc_documents: [
          {
            id: loanApplications.id,
            front_id_image: loanApplications.kyc_front_url,
            back_id_image: loanApplications.kyc_back_url,
            document_number: loanApplications.document_number
          }
        ]
      })
    }

    // Try to fetch from loans table to get user_id, then fetch from users table
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('id, user_id, document_number')
      .eq('id', parseInt(loanId))
      .single()

    if (loanError) {
      console.log('[v0] loans fetch error:', loanError.message)
    }

    if (loan?.user_id) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, id_photos, signature_image')
        .eq('id', loan.user_id)
        .single()

      if (userError) {
        console.log('[v0] users fetch error:', userError.message)
      }

      if (user?.id_photos && Array.isArray(user.id_photos) && user.id_photos.length > 0) {
        const frontIdPhoto = user.id_photos.find(
          (photo: any) => photo.type === 'front' || photo.type === 'id_front'
        )
        
        if (frontIdPhoto) {
          console.log('[v0] Found KYC front image in users table')
          return NextResponse.json({
            kyc_documents: [
              {
                id: loan.id,
                front_id_image: frontIdPhoto.url || frontIdPhoto,
                back_id_image: null,
                document_number: loan.document_number
              }
            ]
          })
        }
      }
    }

    // No KYC document found - return empty array
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
