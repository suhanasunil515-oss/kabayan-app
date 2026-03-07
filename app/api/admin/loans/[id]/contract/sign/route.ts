import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    console.log('[v0] Signing contract for loan:', id);

    const { signature_image } = body;

    if (!signature_image) {
      return NextResponse.json(
        { success: false, error: 'Signature image is required' },
        { status: 400 }
      );
    }

    // Get loan and update contract
    const { data: loan, error: loanError } = await supabaseAdmin
      .from('loans')
      .select('id')
      .eq('id', parseInt(id))
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        { success: false, error: 'Loan not found' },
        { status: 404 }
      );
    }

    // Update contract signature
    const { data: updatedContract, error: updateError } = await supabaseAdmin
      .from('loan_contracts')
      .update({
        is_signed: true,
        signed_at: new Date().toISOString(),
        borrower_signature: signature_image,
        updated_at: new Date().toISOString(),
      })
      .eq('loan_id', loan.id)
      .select()
      .single();

    if (updateError) {
      console.error('[v0] Error signing contract:', updateError);
      throw updateError;
    }

    console.log('[v0] Contract signed successfully');

    return NextResponse.json({
      success: true,
      message: 'Contract signed successfully',
      contract: updatedContract,
    });
  } catch (error) {
    console.error('[v0] Contract sign error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign contract',
      },
      { status: 500 }
    );
  }
}
