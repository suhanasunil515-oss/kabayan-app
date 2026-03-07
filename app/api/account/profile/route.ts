import { NextRequest, NextResponse } from 'next/server';
import { getUserDetailsById } from '@/lib/db-operations';
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

    // Fetch user profile data
    const userResult = await getUserDetailsById(parseInt(userId));
    if (!userResult.success) {
      return NextResponse.json(
        { error: userResult.error },
        { status: 400 }
      );
    }

    const user = userResult.data;
    console.log('[v0] User from DB:', { id: user.id, full_name: user.full_name, phone_number: user.phone_number });
    
    // Try to fetch full name from loan application if user's full_name is still the phone number
    let fullName = user.full_name;
    if (!fullName || fullName === user.phone_number) {
      try {
        const { data: loanApp, error: loanError } = await supabaseAdmin
          .from('loan_applications')
          .select('personal_info')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (loanError) {
          console.log('[v0] Loan app query error:', loanError.message);
        }
        
        if (loanApp?.personal_info && typeof loanApp.personal_info === 'object') {
          const personalInfo = loanApp.personal_info as any;
          if (personalInfo.full_name) {
            fullName = personalInfo.full_name;
            console.log('[v0] Found full_name from loan application:', fullName);
            
            // Also update the user's full_name in the users table for next time
            await supabaseAdmin
              .from('users')
              .update({ full_name: fullName })
              .eq('id', userId)
              .catch((err) => console.error('[v0] Error updating user full_name:', err));
          }
        }
      } catch (e) {
        console.error('[v0] Error fetching loan application:', e);
      }
    }

    const { password_hash, ...userWithoutPassword } = user;

    // Determine credit label based on score
    let creditLabel = 'Low credit';
    if (user.credit_score > 700) {
      creditLabel = 'High credit';
    } else if (user.credit_score > 300) {
      creditLabel = 'Medium credit';
    }

    console.log('[v0] Returning profile with full_name:', fullName);

    return NextResponse.json({
      profile: {
        ...userWithoutPassword,
        full_name: fullName,
        creditLabel,
        joinedDate: user.created_at,
      },
    });
  } catch (error) {
    console.error('[v0] Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
