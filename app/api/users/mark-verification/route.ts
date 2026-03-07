import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { step } = body

    if (!step) {
      return NextResponse.json(
        { error: 'Step is required' },
        { status: 400 }
      )
    }

    // Map step to database column name
    const columnMap: Record<string, string> = {
      personal_info: 'personal_info_completed',
      personal_info_completed: 'personal_info_completed',
      kyc: 'kyc_completed',
      kyc_completed: 'kyc_completed',
      signature: 'signature_completed',
      signature_completed: 'signature_completed',
    }

    const column = columnMap[step]
    if (!column) {
      return NextResponse.json(
        { error: 'Invalid step' },
        { status: 400 }
      )
    }

    // Update verification status in users table
    const updateData = {
      [column]: true,
      last_verified_at: new Date().toISOString(),
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      console.error('[v0] Error marking verification:', error)
      return NextResponse.json(
        { error: 'Failed to mark verification' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Mark verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
