import { NextRequest, NextResponse } from 'next/server';
import { getUserDetailsById, getLoanApplications, getTransactions, markPersonalInfoCompleted, markKYCCompleted, markSignatureCompleted, getUserVerificationStatus } from '@/lib/db-operations';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Get verification status
    if (action === 'get_verification_status') {
      const result = await getUserVerificationStatus(parseInt(userId));
      if (!result.success) {
        return NextResponse.json(
          { verification: { personal_info_completed: false, kyc_completed: false, signature_completed: false } }
        );
      }
      return NextResponse.json({ verification: result.data });
    }

    const userResult = await getUserDetailsById(parseInt(userId));
    if (!userResult.success) {
      return NextResponse.json(
        { error: userResult.error },
        { status: 400 }
      );
    }

    const { password_hash, ...userWithoutPassword } = userResult.data;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { action } = await req.json();

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.delete('user_id');
      return response;
    }

    if (action === 'get_loans') {
      const result = await getLoanApplications(parseInt(userId));
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      return NextResponse.json({ loans: result.data });
    }

    if (action === 'get_transactions') {
      const result = await getTransactions(parseInt(userId));
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      return NextResponse.json({ transactions: result.data });
    }

    if (action === 'mark_verification') {
      const { step } = await req.json();
      let result;

      if (step === 'personal_info') {
        result = await markPersonalInfoCompleted(parseInt(userId));
      } else if (step === 'kyc') {
        result = await markKYCCompleted(parseInt(userId));
      } else if (step === 'signature') {
        result = await markSignatureCompleted(parseInt(userId));
      } else {
        return NextResponse.json(
          { error: 'Invalid verification step' },
          { status: 400 }
        );
      }

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, user: result.data });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('User action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { full_name } = body;

    if (!full_name) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    // Update user's full_name in database
    const { error } = await supabaseAdmin
      .from('users')
      .update({ full_name })
      .eq('id', userId);

    if (error) {
      console.error('[v0] Error updating user full_name:', error);
      return NextResponse.json(
        { error: 'Failed to update user information' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Put user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
