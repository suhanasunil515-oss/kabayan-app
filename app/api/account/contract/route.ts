import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { formatPHP } from '@/lib/currency';
import { generateFullContract } from '@/lib/contract-generator';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's most recent active loan (any status, so users can see contract while under review)
    const { data: loanApps, error: loansError } = await supabase
      .from('loan_applications')
      .select('id, user_id, amount_requested, loan_term_months, interest_rate, personal_info')
      .eq('user_id', parseInt(userId))
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (loansError || !loanApps || loanApps.length === 0) {
      return NextResponse.json(
        { error: 'No loan application found' },
        { status: 404 }
      );
    }

    const loanApp = loanApps[0];
    const personalInfo = loanApp.personal_info || {};
    const borrowerName = personalInfo.full_name || 'Borrower';
    const borrowerPhone = personalInfo.phone_number || 'N/A';
    const borrowerId = personalInfo.id_card_number || personalInfo.id_number || 'N/A';

    console.log('[v0] Contract generation with ID:', {
      id_card_number: personalInfo.id_card_number,
      id_number: personalInfo.id_number,
      final_borrowerId: borrowerId
    });

    // Get or create contract from loan_contracts table
    let contract = null;
    const { data: existingContract } = await supabase
      .from('loan_contracts')
      .select('*')
      .eq('loan_id', loanApp.id)
      .single();

    if (!existingContract) {
      // Generate new contract with exact 10-article template
      try {
        const contractGenerated = generateFullContract({
          borrower_name: borrowerName,
          id_number: borrowerId,
          phone_number: borrowerPhone,
          loan_amount: loanApp.amount_requested,
          interest_rate: loanApp.interest_rate,
          loan_period_months: loanApp.loan_term_months,
          bank_name: 'EasyLoan'
        });

        const { data: newContract, error: insertError } = await supabase
          .from('loan_contracts')
          .insert({
            loan_id: loanApp.id,
            borrower_name: borrowerName,
            id_number: borrowerId,
            phone_number: borrowerPhone,
            loan_amount: loanApp.amount_requested,
            interest_rate: loanApp.interest_rate,
            loan_period: loanApp.loan_term_months,
            bank_name: 'EasyLoan',
            full_document: contractGenerated.full_document,
            contract_body: contractGenerated.body,
            is_signed: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('[v0] Contract insert error:', insertError);
          throw insertError;
        }
        contract = newContract;
      } catch (err) {
        console.error('[v0] Contract generation error:', err);
        throw err;
      }
    } else {
      contract = existingContract;
    }

    if (!contract) {
      return NextResponse.json(
        { error: 'Failed to create contract' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        loan_id: contract.loan_id,
        document_number: `LN-${loanApp.id}`,
        borrower_name: contract.borrower_name,
        borrower_id_number: contract.id_number,
        borrower_phone: contract.phone_number,
        loan_amount: formatPHP(loanApp.amount_requested),
        interest_rate: `${loanApp.interest_rate}%/month`,
        loan_period: `${loanApp.loan_term_months} months`,
        bank_name: contract.bank_name,
        contract_text: contract.full_document || contract.contract_body || '',
        signed_at: contract.signed_at,
        is_active: true
      }
    });
  } catch (error) {
    console.error('Contract fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
