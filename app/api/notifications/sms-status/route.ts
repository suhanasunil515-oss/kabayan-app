import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Notification, APIErrorResponse } from '@/lib/types'

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

    // Get query parameter for notification ID (optional)
    const { searchParams } = new URL(req.url)
    const notificationId = searchParams.get('id')

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', parseInt(userId))
      .eq('notification_type', 'sms')

    if (notificationId) {
      query = query.eq('id', parseInt(notificationId))
    }

    const { data: notifications, error: notifError } = await query.order(
      'created_at',
      { ascending: false }
    )

    if (notifError) {
      console.error('[v0] Notification query error:', notifError)
      return NextResponse.json(
        { error: 'Failed to fetch SMS status' } as APIErrorResponse,
        { status: 500 }
      )
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json(
        { error: 'No SMS notifications found' } as APIErrorResponse,
        { status: 404 }
      )
    }

    // Format response
    const response = notificationId
      ? {
          success: true,
          data: {
            notificationId: notifications[0].id,
            message: notifications[0].message,
            status: notifications[0].sms_delivery_status,
            sentAt: notifications[0].sent_at,
            deliveredAt: notifications[0].updated_at,
            failureReason: notifications[0].error_message,
          },
        }
      : {
          success: true,
          data: notifications.map((n: Notification) => ({
            notificationId: n.id,
            message: n.message,
            status: n.sms_delivery_status,
            sentAt: n.sent_at,
            channel: n.channel,
          })),
        }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[v0] SMS status GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' } as APIErrorResponse,
      { status: 500 }
    )
  }
}
