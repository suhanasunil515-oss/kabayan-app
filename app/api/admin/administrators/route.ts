import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllAdmins, createAdmin, updateAdminPassword, deleteAdmin } from '@/lib/db-operations';
import { canAccessAdministratorManagement } from '@/lib/admin-roles';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    const adminRole = cookieStore.get('admin_role')?.value;

    if (!adminId || !adminRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canAccessAdministratorManagement(adminRole)) {
      return NextResponse.json({ error: 'Access denied. Superior admin only.' }, { status: 403 });
    }

    const result = await getAllAdmins();
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, admins: result.data });
  } catch (error) {
    console.error('[v0] Get admins error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    const adminRole = cookieStore.get('admin_role')?.value;

    if (!adminId || !adminRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canAccessAdministratorManagement(adminRole)) {
      return NextResponse.json({ error: 'Access denied. Superior admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { action, username, email, password, role, targetAdminId, newPassword } = body;

    if (action === 'create') {
      if (!username || !email || !password || !role) {
        return NextResponse.json({ error: 'Missing username, email, password, or role' }, { status: 400 });
      }
      if (!['SUPERIOR_ADMIN', 'VIP_ADMIN', 'REGULAR_ADMIN'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }

      const result = await createAdmin(username, email, password, role);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, admin: result.data });
    }

    if (action === 'change_password') {
      if (!targetAdminId || !newPassword) {
        return NextResponse.json({ error: 'Missing admin ID or new password' }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }

      const result = await updateAdminPassword(parseInt(targetAdminId), newPassword);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      if (!targetAdminId) {
        return NextResponse.json({ error: 'Missing admin ID' }, { status: 400 });
      }
      const targetId = parseInt(targetAdminId);
      if (targetId === parseInt(adminId)) {
        return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
      }

      const result = await deleteAdmin(targetId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[v0] Admin management error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
