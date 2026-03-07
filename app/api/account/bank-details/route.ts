import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

// Store bank details in users table as encrypted JSON
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[v0] Fetching bank details for userId:', userId);

    // In production, bank details would be encrypted at rest
    // For now, storing in metadata field (bank_details JSONB)
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('bank_details, bank_name')
      .eq('id', parseInt(userId))
      .single();

    if (error) {
      console.log('[v0] Query error code:', error.code);
      if (error.code !== 'PGRST116') {
        console.error('[v0] Bank details fetch error:', error);
        throw error;
      }
    }

    console.log('[v0] User data retrieved:', data);

    if (!data) {
      console.log('[v0] No data found for user');
      return NextResponse.json({
        bankDetails: null,
      });
    }

    // Check if bank details were set by admin (in bank_details field with setBy flag)
    const bankDetails = data.bank_details;
    const isAdminSet = bankDetails && typeof bankDetails === 'object' ? bankDetails.setBy === 'admin' : false;

    console.log('[v0] Bank details:', { bankDetails, isAdminSet });

    return NextResponse.json({
      bankDetails: bankDetails ? {
        bankName: bankDetails.bankName || bankDetails.bank_name || '',
        accountNumber: bankDetails.account_number || bankDetails.accountNumber || '',
        isAdminSet: isAdminSet
      } : null,
    });
  } catch (error) {
    console.error('[v0] Bank details fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bankName, accountNumber } = body;

    if (!bankName || !accountNumber) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Only allow users to set bank details if admin hasn't already set them
    // First check if admin has already set them
    const { data: existingData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('bank_details')
      .eq('id', parseInt(userId))
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const existingBankDetails = existingData?.bank_details;
    const isAdminSet = existingBankDetails && typeof existingBankDetails === 'object' ? existingBankDetails.setBy === 'admin' : false;

    if (isAdminSet) {
      return NextResponse.json(
        { error: 'Bank details have been set by admin and cannot be modified' },
        { status: 403 }
      );
    }

    const bankDetails = {
      bankName,
      accountNumber,
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ bank_details: bankDetails })
      .eq('id', parseInt(userId))
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      bankDetails: data?.[0]?.bank_details,
    });
  } catch (error) {
    console.error('Bank details save error:', error);
    return NextResponse.json(
      { error: 'Failed to save bank details' },
      { status: 500 }
    );
  }
}
