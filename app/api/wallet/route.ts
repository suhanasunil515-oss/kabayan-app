import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, amount, withdrawal_code, order_number } = await req.json();

    console.log('[v0] Withdrawal request:', { 
      action, 
      amount, 
      withdrawal_code: withdrawal_code ? '***' : null, 
      order_number,
      userId 
    });

    if (action === 'submit-withdrawal') {
      // Validate required fields
      if (!amount || !withdrawal_code || !order_number) {
        console.log('[v0] Missing required fields:', { amount, withdrawal_code, order_number });
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Verify user has sufficient balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('wallet_balance, withdrawal_otp')
        .eq('id', parseInt(userId))
        .single();

      if (userError || !userData) {
        console.error('[v0] User fetch error:', userError);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      console.log('[v0] User data:', { 
        wallet_balance: userData.wallet_balance, 
        withdrawal_otp_exists: !!userData.withdrawal_otp 
      });

      // Check balance
      if (userData.wallet_balance < amount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      // Verify withdrawal code matches
      if (userData.withdrawal_otp !== withdrawal_code) {
        console.log('[v0] OTP mismatch:', { 
          expected: userData.withdrawal_otp ? '***' : null, 
          provided: '***' 
        });
        return NextResponse.json(
          { error: 'Invalid withdrawal code' },
          { status: 400 }
        );
      }

      // Get current timestamp
      const now = new Date().toISOString();

      // Generate a unique withdraw number
      const withdrawNumber = `WD-${Date.now()}-${userId}`;

      // Create withdrawal record matching your exact table structure
      // IMPORTANT: Status must be exactly 'Pending' (capital P) as per the check constraint
      const withdrawalData = {
        withdraw_number: withdrawNumber,
        user_id: parseInt(userId),
        withdrawal_code: withdrawal_code,
        amount: amount,
        status: 'Pending', // Must match exactly: 'Pending', 'Processing', 'Completed', 'Failed', 'Refused To Pay', 'Cancelled'
        document_number: order_number,
        created_at: now,
        updated_at: now,
        bank_name: '', // User will need to add bank details later
        account_number: '', // User will need to add bank details later
        account_name: '', // User will need to add bank details later
        withdrawal_date: now,
        notes: `Withdrawal request for loan ${order_number}`
      };

      console.log('[v0] Attempting to insert withdrawal:', withdrawalData);

      const { data: insertedData, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert([withdrawalData])
        .select();

      if (withdrawalError) {
        console.error('[v0] Withdrawal creation error details:', {
          code: withdrawalError.code,
          message: withdrawalError.message,
          details: withdrawalError.details,
          hint: withdrawalError.hint
        });

        return NextResponse.json(
          { error: `Failed to create withdrawal: ${withdrawalError.message}` },
          { status: 500 }
        );
      }

      console.log('[v0] Withdrawal created successfully:', insertedData);

      // ========== FIX: Update loan status to WITHDRAWAL_PROCESSING ==========
      try {
        console.log('[v0] Updating loan status to WITHDRAWAL_PROCESSING for user:', userId);
        
        const { error: loanUpdateError } = await supabase
          .from('loans')
          .update({
            status: 'WITHDRAWAL_PROCESSING',
            status_color: '#6366F1', // Indigo color for processing
            status_description: 'Your withdrawal request is currently being processed. Please wait for confirmation.',
            updated_at: now
          })
          .eq('user_id', parseInt(userId))
          .eq('is_active', true);

        if (loanUpdateError) {
          console.error('[v0] Failed to update loan status:', loanUpdateError);
          // Don't fail the main request if loan update fails
        } else {
          console.log('[v0] Loan status updated to WITHDRAWAL_PROCESSING successfully');
        }
      } catch (loanError) {
        console.error('[v0] Loan update error:', loanError);
      }
      // ======================================================================

      // Also create a transaction record for this withdrawal
      try {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([{
            user_id: parseInt(userId),
            type: 'withdrawal',
            amount: amount,
            description: `Withdrawal request #${withdrawNumber} for loan ${order_number}`,
            otp_code: withdrawal_code,
            created_at: now
          }]);

        if (transactionError) {
          console.error('[v0] Failed to create transaction record:', transactionError);
          // Don't fail the main request if transaction record fails
        }
      } catch (txError) {
        console.error('[v0] Transaction creation error:', txError);
      }

      return NextResponse.json({
        success: true,
        withdrawal: insertedData?.[0] || null,
        withdraw_number: withdrawNumber,
        message: 'Withdrawal request submitted successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[v0] Wallet API error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's withdrawal history
    const { data: withdrawals, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', parseInt(userId))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Withdrawals fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch withdrawals' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      withdrawals: withdrawals || []
    });
  } catch (error) {
    console.error('[v0] Wallet API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
