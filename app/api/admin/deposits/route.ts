import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  findUserByPhoneOrDocumentForDeposit,
  createManualDeposit,
  getManualDepositRecords,
} from '@/lib/db-operations';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? undefined;
    const startDate = searchParams.get('startDate') ?? undefined;
    const endDate = searchParams.get('endDate') ?? undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (searchParams.get('searchUser') === 'true') {
      const q = searchParams.get('q') || '';
      const result = findUserByPhoneOrDocumentForDeposit(q);
      const resolved = await result;
      if (!resolved.success) {
        return NextResponse.json(
          { success: false, error: resolved.error || 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, user: resolved.data });
    }

    const result = await getManualDepositRecords({
      limit,
      offset,
      startDate,
      endDate,
      search,
    });
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch records' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      limit,
      offset,
    });
  } catch (err) {
    console.error('[v0] GET /api/admin/deposits error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    const adminUsername = cookieStore.get('admin_username')?.value || null;
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let adminDisplayName = adminUsername;
    if (!adminDisplayName) {
      const { supabaseAdmin } = await import('@/lib/supabase');
      const { data: adminRow } = await supabaseAdmin
        .from('admin')
        .select('username')
        .eq('id', parseInt(adminId, 10))
        .maybeSingle();
      adminDisplayName = adminRow?.username ?? 'Unknown administrator';
    }

    const body = await req.json();
    const { userId, amount, purpose, notes } = body;

    if (userId == null || userId === '') {
      return NextResponse.json(
        { success: false, error: 'User is required. Search for a user first.' },
        { status: 400 }
      );
    }
    const parsedUserId = parseInt(String(userId), 10);
    if (Number.isNaN(parsedUserId) || parsedUserId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid user. Please search for the user again.' },
        { status: 400 }
      );
    }
    const parsedAmount = parseFloat(String(amount));
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'A valid positive amount is required.' },
        { status: 400 }
      );
    }

    const result = await createManualDeposit(
      parsedUserId,
      parsedAmount,
      purpose || 'Manual deposit',
      notes || null,
      adminId,
      adminDisplayName
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Deposit failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Deposit completed. Wallet balance updated.',
    });
  } catch (err) {
    console.error('[v0] POST /api/admin/deposits error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
