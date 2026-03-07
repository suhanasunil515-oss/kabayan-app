import { NextRequest, NextResponse } from 'next/server'
import { getLoanStatusForUser } from '@/lib/db-operations'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    console.log('[v0] Loan status API called for user:', userId)

    if (!userId) {
      console.log('[v0] No user_id in cookies')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await getLoanStatusForUser(parseInt(userId))
    console.log('[v0] Loan status result:', { success: result.success, hasData: !!result.data, error: result.error })
    
    if (!result.success) {
      console.error('[v0] Loan status error:', result.error)
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    console.log('[v0] Returning loan data:', result.data)
    return NextResponse.json({
      loan: result.data,
    })
  } catch (error) {
    console.error('[v0] Loan status GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
