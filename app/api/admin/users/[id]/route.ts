import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { canUseUserAction } from '@/lib/admin-roles';

/**
 * Permanently delete a user (member) and all related data.
 * Used to remove duplicate/multiple accounts (e.g. same person, different phone numbers).
 * Requires admin session; only SUPERIOR_ADMIN / VIP_ADMIN can delete (not REGULAR_ADMIN).
 * Related rows (loans, transactions, withdrawals, etc.) are removed by DB ON DELETE CASCADE.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    const adminRole = cookieStore.get('admin_role')?.value;

    if (!adminId || !adminRole) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!canUseUserAction(adminRole, 'delete')) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete users.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, phone_number')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('[admin] Delete user error:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message || 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User and all related data have been permanently deleted.',
    });
  } catch (err) {
    console.error('[admin] Delete user exception:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
