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
      .select('id')
      .eq('user_id', parseInt(userId))
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (loanError || !loanApp) {
      console.log('[v0] No approved loan found for user');
      return NextResponse.json({
        records: [],
        summary: {
          totalPaid: 0,
          onTimePayments: 0,
          latePayments: 0,
          remainingBalance: 0,
        },
      });
    }

    // Fetch repayment records for this loan
    const { data: records, error: recordsError } = await supabaseAdmin
      .from('repayment_records')
      .select('*')
      .eq('loan_application_id', loanApp.id)
      .eq('status', 'completed')
      .order('date', { ascending: false });

    if (recordsError) {
      console.error('[v0] Error fetching records:', recordsError);
      return NextResponse.json({
        records: [],
        summary: {
          totalPaid: 0,
          onTimePayments: 0,
          latePayments: 0,
          remainingBalance: 0,
        },
      });
    }

    // If no records exist, return empty state
    if (!records || records.length === 0) {
      console.log('[v0] No repayment records found for loan');
      return NextResponse.json({
        records: [],
        summary: {
          totalPaid: 0,
          onTimePayments: 0,
          latePayments: 0,
          remainingBalance: 0,
        },
      });
    }

    // Get repayment schedule to calculate on-time and late payments
    const { data: schedule } = await supabaseAdmin
      .from('repayment_schedule')
      .select('*')
      .eq('loan_application_id', loanApp.id);

    // Count on-time and late payments based on due dates
    let onTimePayments = 0;
    let latePayments = 0;

    if (schedule) {
      schedule.forEach((installment) => {
        if (installment.status === 'paid' && installment.paid_date) {
          const paidDate = new Date(installment.paid_date);
          const dueDate = new Date(installment.due_date);
          if (paidDate <= dueDate) {
            onTimePayments++;
          } else {
            latePayments++;
          }
        }
      });
    }

    // Calculate summary
    const totalPaid = records.reduce((sum, rec) => sum + parseFloat(rec.amount || 0), 0);

    const summary = {
      totalPaid,
      onTimePayments,
      latePayments,
      remainingBalance: 0, // This would need to be calculated from loan total - paid
    };

    console.log('[v0] Repayment records loaded:', { count: records.length, summary });

    return NextResponse.json({
      records: records.map((rec) => ({
        id: rec.id,
        date: rec.date,
        transactionId: rec.transaction_id,
        amount: parseFloat(rec.amount),
        method: rec.method,
        status: rec.status,
        notes: rec.notes,
      })),
      summary,
    });
  } catch (error) {
    console.error('[v0] Records error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
