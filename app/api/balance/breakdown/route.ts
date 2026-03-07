import { NextRequest, NextResponse } from 'next/server'
import { getBalanceBreakdown } from '@/lib/db-operations'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getBalanceBreakdown(parseInt(userId))

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('[v0] Balance breakdown API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
