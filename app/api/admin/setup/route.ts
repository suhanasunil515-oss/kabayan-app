import { NextRequest, NextResponse } from 'next/server';
import { createAdmin } from '@/lib/db-operations';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { count } = await supabaseAdmin
      .from('admin')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({ setupRequired: (count || 0) === 0 });
  } catch (error) {
    return NextResponse.json({ setupRequired: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { count } = await supabaseAdmin
      .from('admin')
      .select('*', { count: 'exact', head: true });

    if ((count || 0) > 0) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 400 });
    }

    const { username, email, password } = await req.json();
    if (!username || !email || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'Username, email, and password (min 8 chars) required' },
        { status: 400 }
      );
    }

    const result = await createAdmin(username, email.trim(), password, 'SUPERIOR_ADMIN');
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
