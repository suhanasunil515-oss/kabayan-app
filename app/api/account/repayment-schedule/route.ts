import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's approved loan
    const { data: loanApp, error: loanError } = await supabaseAdmin
      .from('loan_applications')
      .select('id, amount_requested, status')
      .eq('user_id', parseInt(userId))
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (loanError || !loanApp) {
      console.log('[v0] No approved loan found for user');
      return NextResponse.json({
        installments: [],
        summary: {
          totalAmount: 0,
          paidAmount: 0,
          remainingBalance: 0,
          nextDueDate: null,
        },
      });
    }

    // Fetch repayment schedule for this loan
    const { data: schedule, error: scheduleError } = await supabaseAdmin
      .from('repayment_schedule')
      .select('*')
      .eq('loan_application_id', loanApp.id)
      .order('installment_number', { ascending: true });

    if (scheduleError) {
      console.error('[v0] Error fetching schedule:', scheduleError);
      return NextResponse.json({
        installments: [],
        summary: {
          totalAmount: 0,
          paidAmount: 0,
          remainingBalance: 0,
          nextDueDate: null,
        },
      });
    }

    // If no schedule exists, return empty state
    if (!schedule || schedule.length === 0) {
      console.log('[v0] No repayment schedule found for loan');
      return NextResponse.json({
        installments: [],
        summary: {
          totalAmount: 0,
          paidAmount: 0,
          remainingBalance: 0,
          nextDueDate: null,
        },
      });
    }

    // Calculate summary
    const summary = {
      totalAmount: schedule.reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0),
      paidAmount: schedule
        .filter((inst) => inst.status === 'paid')
        .reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0),
      remainingBalance: schedule
        .filter((inst) => inst.status !== 'paid')
        .reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0),
      nextDueDate: schedule.find((inst) => inst.status !== 'paid')?.due_date,
    };

    console.log('[v0] Repayment schedule loaded:', { count: schedule.length, summary });

    return NextResponse.json({
      installments: schedule.map((inst) => ({
        id: inst.id,
        installmentNumber: inst.installment_number,
        dueDate: inst.due_date,
        amount: parseFloat(inst.amount),
        principalAmount: parseFloat(inst.principal_amount),
        interestAmount: parseFloat(inst.interest_amount),
        status: inst.status,
        paidDate: inst.paid_date,
        lateFee: inst.late_fee ? parseFloat(inst.late_fee) : undefined,
      })),
      summary,
    });
  } catch (error) {
    console.error('[v0] Schedule error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
