import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    // Get all admins
    const { data: admins, error: getError } = await supabaseAdmin
      .from('admin')
      .select('id, username, email, is_active, password_hash');

    if (getError) {
      return NextResponse.json({ error: getError.message }, { status: 400 });
    }

    return NextResponse.json({
      admins: admins?.map((a) => ({
        id: a.id,
        username: a.username,
        email: a.email,
        is_active: a.is_active,
        hasPasswordHash: !!a.password_hash,
        passwordHashLength: a.password_hash?.length || 0,
      })),
      count: admins?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, password } = body;

    // Test bcrypt hashing
    if (action === 'test_hash') {
      const testPassword = password || 'Easyloan$8';
      const hash = await bcrypt.hash(testPassword, 10);
      const verify = await bcrypt.compare(testPassword, hash);
      return NextResponse.json({
        password: testPassword,
        hash,
        hashLength: hash.length,
        verifyResult: verify,
        message: 'Hash test successful',
      });
    }

    // Force reinit admin - update instead of delete/insert
    if (action === 'force_init') {
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD;
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost.local';

      if (!adminPassword) {
        console.error('[v0] ADMIN_PASSWORD not set');
        return NextResponse.json(
          { error: 'ADMIN_PASSWORD not set' },
          { status: 400 }
        );
      }

      console.log('[v0] Force reinit - hashing password for:', adminUsername);

      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      console.log('[v0] Hash created, length:', hashedPassword.length);

      // Try to update existing admin first
      const { error: updateError, data: updateData } = await supabaseAdmin
        .from('admin')
        .update({
          password_hash: hashedPassword,
          email: adminEmail,
          role: 'SUPER_ADMIN',
          is_active: true,
          last_login: null,
        })
        .eq('username', adminUsername)
        .select();

      if (updateError) {
        console.error('[v0] Update error:', updateError);
        return NextResponse.json(
          { error: 'Update failed: ' + updateError.message },
          { status: 400 }
        );
      }

      console.log('[v0] Admin updated successfully');

      // Verify the hash was stored
      const { data: verifyData } = await supabaseAdmin
        .from('admin')
        .select('id, username, password_hash')
        .eq('username', adminUsername)
        .single();

      console.log('[v0] Verification - stored hash length:', verifyData?.password_hash?.length);

      return NextResponse.json({
        success: true,
        admin: updateData?.[0],
        verification: {
          storedHashLength: verifyData?.password_hash?.length,
          expectedHashLength: 60,
        },
        message: 'Admin reinitialized successfully. Hash stored with length: ' + (verifyData?.password_hash?.length || 0),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[v0] Debug endpoint error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
