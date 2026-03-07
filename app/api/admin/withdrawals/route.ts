import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Generate unique withdraw number
function generateWithdrawNumber() {
  return Date.now().toString().slice(-15);
}

// GET: List all withdrawals with filters
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('withdrawals')
      .select(`
        id,
        withdraw_number,
        document_number,
        withdrawal_code,
        amount,
        status,
        withdrawal_date,
        user_id,
        user:users(id, full_name, phone_number, wallet_balance)
      `, { count: 'exact' });

    if (startDate) {
      query = query.gte('withdrawal_date', new Date(startDate).toISOString());
    }

    if (endDate) {
      query = query.lte('withdrawal_date', new Date(endDate).toISOString());
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`withdraw_number.ilike.%${search}%,document_number.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('withdrawal_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[v0] Error fetching withdrawals:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Create new withdrawal request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, bankName, accountNumber, accountName, withdrawalCode } = body;

    if (!userId || !amount || !bankName || !accountNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check user wallet balance
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (userData.wallet_balance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    // Create withdrawal record
    const withdrawNumber = generateWithdrawNumber();
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .insert([
        {
          withdraw_number: withdrawNumber,
          user_id: userId,
          amount,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          withdrawal_code: withdrawalCode,
          status: 'Pending',
          withdrawal_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('[v0] Error creating withdrawal:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
