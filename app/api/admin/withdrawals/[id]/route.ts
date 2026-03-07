import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Get withdrawal details (explicit columns for performance)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
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
        processed_at,
        created_at,
        updated_at,
        user:users(
          id, full_name, phone_number, email,
          wallet_balance, id_number, bank_name,
          bank_card_number, bank_details
        ),
        processor:admin(id, username)
      `)
      .eq('id', parseInt(id))
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[v0] Error fetching withdrawal:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH: Confirm, reject, or update withdrawal
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, withdrawalCode, status } = body;

    const { data: withdrawal, error: fetchError } = await supabaseAdmin
      .from('withdrawals')
      .select('id, user_id, amount, withdrawal_code, status')
      .eq('id', parseInt(id))
      .single();

    if (fetchError || !withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    // Verify withdrawal code if provided
    if (withdrawal.withdrawal_code && withdrawalCode) {
      if (withdrawal.withdrawal_code !== withdrawalCode) {
        return NextResponse.json(
          { success: false, error: 'Invalid withdrawal code' },
          { status: 400 }
        );
      }
    }

    if (action === 'confirm') {
      // Get current user's wallet
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('wallet_balance')
        .eq('id', withdrawal.user_id)
        .single();

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Update withdrawal status to Completed
      const { data: updatedWithdrawal, error: updateError } = await supabaseAdmin
        .from('withdrawals')
        .update({
          status: 'Completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', parseInt(id))
        .select()
        .single();

      if (updateError) throw updateError;

      // Deduct from user wallet
      await supabaseAdmin
        .from('users')
        .update({
          wallet_balance: Math.max(0, user.wallet_balance - withdrawal.amount),
        })
        .eq('id', withdrawal.user_id);

      // FIX: Update loan status to WITHDRAWAL_SUCCESSFUL with proper color
      await supabaseAdmin
        .from('loans')
        .update({
          status: 'WITHDRAWAL_SUCCESSFUL',
          status_description: 'Your withdrawal has been successfully transferred to your provided bank account. Please check for verification, and if you have any issues, contact the finance department immediately. Thank you!',
          status_color: '#22C55E', // Use hex color, not Tailwind classes
          updated_at: new Date().toISOString()
        })
        .eq('user_id', withdrawal.user_id)
        .eq('is_active', true);

      return NextResponse.json({ success: true, data: updatedWithdrawal });
    } else if (action === 'reject') {

      // Update withdrawal status to Refused To Pay (rejected)
      const { data: updatedWithdrawal, error: updateError } = await supabaseAdmin
        .from('withdrawals')
        .update({
          status: 'Refused To Pay',
          updated_at: new Date().toISOString(),
        })
        .eq('id', parseInt(id))
        .select()
        .single();

      if (updateError) throw updateError;

      // Update loan status to WITHDRAWAL_FAILED with red color
      // IMPORTANT: Update the 'loans' table, not 'loan_applications'
      await supabaseAdmin
        .from('loans')
        .update({
          status: 'WITHDRAWAL_FAILED',
          status_color: '#DC2626', // Red color
          status_description: 'Your withdrawal request has failed. Please contact the Finance Department for further details.',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', withdrawal.user_id)
        .eq('is_active', true);

      return NextResponse.json({ success: true, data: updatedWithdrawal });
    } else if (action === 'cancel') {

      // Update status to Cancelled
      const { data: updatedWithdrawal, error: updateError } = await supabaseAdmin
        .from('withdrawals')
        .update({
          status: 'Cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', parseInt(id))
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, data: updatedWithdrawal });
    } else if (action === 'update-status') {

      // Validate status
      const validStatuses = ['Pending', 'Processing', 'Completed', 'Failed', 'Refused To Pay', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      // Update custom status
      const { data: updatedWithdrawal, error: updateError } = await supabaseAdmin
        .from('withdrawals')
        .update({
          status: status || 'Pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', parseInt(id))
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, data: updatedWithdrawal });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[v0] Error updating withdrawal:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete/Cancel withdrawal
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: withdrawal } = await supabaseAdmin
      .from('withdrawals')
      .select('id, status')
      .eq('id', parseInt(id))
      .single();

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of Pending or Cancelled withdrawals
    if (withdrawal.status !== 'Pending' && withdrawal.status !== 'Cancelled') {
      return NextResponse.json(
        { success: false, error: `Cannot delete ${withdrawal.status} withdrawals` },
        { status: 400 }
      );
    }

    // DO NOT refund balance - it was never deducted
    // Deleting a Pending withdrawal just removes the record
    // Available balance will automatically recalculate

    // Delete withdrawal
    const { error } = await supabaseAdmin
      .from('withdrawals')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting withdrawal:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
