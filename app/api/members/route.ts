import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getLatestWalletNotesForUserIds } from '@/lib/db-operations';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' });

    // Add search filter (search by phone or name)
    if (search) {
      query = query.or(`phone_number.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Add date range filter
    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString());
    }
    if (endDate) {
      // Add 1 day to include the entire end date
      const endOfDay = new Date(endDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query = query.lt('created_at', endOfDay.toISOString());
    }

    // Execute query with pagination
    const { data: users, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[v0] Supabase error:', error);
      throw error;
    }

    const userIds = (users || []).map((u: any) => u.id);
    const latestWalletNotes = userIds.length > 0 ? await getLatestWalletNotesForUserIds(userIds) : {};

    // Transform data to match expected structure; Note column shows latest wallet change or user.notes
    const transformedUsers = (users || []).map((user: any) => ({
      id: user.id,
      name: user.full_name || 'Unknown',
      username: user.phone_number,
      score: user.credit_score || 500,
      wallet: user.wallet_balance || 0,
      withdrawalCode: user.withdrawal_otp || null,
      registrationDate: user.created_at,
      status: user.is_banned ? 'disabled' : 'active',
      registrationArea:
        user.registration_location ||
        (user.city && user.country ? `${user.city}, ${user.country}` : null) ||
        `Unknown, IP: ${user.ip_address || 'N/A'}`,
      ipAddress: user.ip_address || 'N/A',
      lastLoginLocation: user.last_login_location,
      lastLoginIp: user.last_login_ip,
      lastLoginAt: user.last_login_at,
      note: latestWalletNotes[user.id] ?? user.notes ?? null,
      email: user.email,
    }));

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[v0] Members API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch members',
      },
      { status: 500 }
    );
  }
}
