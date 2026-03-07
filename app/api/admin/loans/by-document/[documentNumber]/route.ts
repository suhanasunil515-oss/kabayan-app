import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Complete status color mapping from review-loan-modal
const STATUS_COLOR_MAP: Record<string, string> = {
  'UNDER_REVIEW': '#3B82F6',
  'LOAN_APPROVED': '#22C55E',
  'LOAN_APPROVED_CONFIRMATION': '#22C55E',
  'OTP_GENERATED': '#22C55E',
  'WITHDRAWAL_PROCESSING': '#6366F1',
  'WITHDRAWAL_FAILED': '#DC2626',
  'INVALID_BANK_NAME': '#EF4444',
  'INVALID_BANK_ACCOUNT': '#EF4444',
  'INVALID_BANK_ACCOUNT_FROZEN': '#EF4444',
  'MISMATCH_BENEFICIARY': '#EF4444',
  'INVALID_ID_CARD': '#EF4444',
  'FUND_FROZEN': '#EF4444',
  'ERROR_INFO': '#EF4444',
  'ACCOUNT_LIMIT_REACHED': '#EF4444',
  'PROCESSING_UNFREEZE': '#6366F1',
  'UNFROZEN': '#22C55E',
  'LOW_CREDIT_SCORE': '#F97316',
  'TOP_UP_CREDIT_SCORE': '#8B5CF6',
  'WITHDRAWAL_REJECTED': '#DC2626',
  'OVERDUE': '#B91C1C',
  'TAX': '#F59E0B',
  'TAX_SETTLED': '#22C55E',
  'WITHDRAWAL_SUCCESSFUL': '#22C55E',
  'BANK_INFO_UPDATED': '#22C55E',
  'PERSONAL_INFO_UPDATED': '#22C55E',
  'INSURANCE': '#0EA5E9',
  'GAMBLING': '#F43F5E',
  'IRREGULAR_ACTIVITY': '#DC2626',
  'DUPLICATE_APPLICATION': '#E11D48',
  'ACCOUNT_SUSPENDED': '#DC2626',
  'ACCOUNT_REACTIVATED': '#22C55E',
  'ACCOUNT_DEACTIVATED': '#64748B',
  'RENEW_OTP': '#F59E0B',
};

function getStatusColor(status: string): string {
  // Try exact match first
  if (STATUS_COLOR_MAP[status]) {
    return STATUS_COLOR_MAP[status];
  }
  
  // Try uppercase version
  const upperStatus = status?.toUpperCase();
  if (STATUS_COLOR_MAP[upperStatus]) {
    return STATUS_COLOR_MAP[upperStatus];
  }
  
  // Legacy colors for backward compatibility
  const legacyColors: Record<string, string> = {
    'pending': '#F59E0B',
    'under_review': '#3B82F6',
    'approved': '#22C55E',
    'rejected': '#EF4444',
  };
  
  const lowerStatus = status?.toLowerCase();
  if (legacyColors[lowerStatus]) {
    return legacyColors[lowerStatus];
  }
  
  return '#6B7280';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentNumber: string }> }
) {
  try {
    const { documentNumber } = await params;
    const decodedDocNumber = decodeURIComponent(documentNumber);

    // Fetch by document_number with explicit columns for better performance
    const { data: loanAppData, error: appError } = await supabaseAdmin
      .from('loan_applications')
      .select(`
        id,
        document_number,
        user_id,
        amount_requested,
        interest_rate,
        loan_term_months,
        status,
        status_color,
        admin_status_message,
        created_at,
        updated_at,
        kyc_front_url,
        kyc_back_url,
        selfie_url,
        signature_url,
        personal_info,
        is_active,
        users:user_id (
          id,
          full_name,
          phone_number,
          email,
          id_card_number,
          bank_name,
          bank_card_number,
          city,
          country,
          ip_address
        )
      `)
      .eq('document_number', decodedDocNumber)
      .eq('is_active', true)
      .single();

    if (appError) {
      console.error('[v0] Error fetching loan by document_number:', appError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Loan not found: ' + appError.message 
        },
        { status: 404 }
      );
    }

    if (!loanAppData) {
      console.error('[v0] No loan found for document:', decodedDocNumber);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Loan with document number ' + decodedDocNumber + ' not found' 
        },
        { status: 404 }
      );
    }

    // CRITICAL VERIFICATION: Ensure document number matches exactly
    if (loanAppData.document_number !== decodedDocNumber) {
      console.error('[v0] CRITICAL MISMATCH:', {
        requested: decodedDocNumber,
        returned: loanAppData.document_number,
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database integrity error: document number mismatch' 
        },
        { status: 500 }
      );
    }

    // Calculate loan values
    const loanAmount = Number(loanAppData.amount_requested) || 0;
    const interestRate = Number(loanAppData.interest_rate) || 0;
    const loanTermMonths = Number(loanAppData.loan_term_months) || 12;

    // interest_rate is stored as monthly percentage (e.g. 0.5 = 0.5% per month)
    const monthlyInterest = loanAmount * (interestRate / 100);
    const monthlyPrincipal = loanAmount / loanTermMonths;
    const monthlyInstallment = monthlyPrincipal + monthlyInterest;
    const totalRepayment = loanAmount + (monthlyInterest * loanTermMonths);

    // Transform the data
    const transformedData = {
      id: loanAppData.id,
      document_number: loanAppData.document_number,
      order_number: loanAppData.document_number,
      borrower_name: loanAppData.users?.full_name || 'N/A',
      borrower_phone: loanAppData.users?.phone_number || 'N/A',
      borrower_id_number: loanAppData.users?.id_card_number || 'N/A',
      borrower_email: loanAppData.users?.email || null,
      loan_amount: loanAmount,
      amount_requested: loanAmount,
      interest_rate: interestRate,
      loan_period_months: loanTermMonths,
      loan_term_months: loanTermMonths,
      status: loanAppData.status || 'pending',
      status_color: loanAppData.status_color || getStatusColor(loanAppData.status),
      status_description: loanAppData.admin_status_message || '',
      created_at: loanAppData.created_at,
      updated_at: loanAppData.updated_at,
      user_id: loanAppData.user_id,
      bank_name: loanAppData.users?.bank_name || 'N/A',
      bank_card_number: loanAppData.users?.bank_card_number || null,
      kyc_front_url: loanAppData.kyc_front_url,
      kyc_back_url: loanAppData.kyc_back_url,
      selfie_url: loanAppData.selfie_url,
      signature_url: loanAppData.signature_url,
      personal_info: loanAppData.personal_info,
      is_active: loanAppData.is_active,
      monthly_interest: monthlyInterest,
      monthly_installment: monthlyInstallment,
      total_repayment: totalRepayment,
      source: 'loan_applications',
      loan_type: 'Personal Loan',
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error('[v0] Unexpected error in loan by-document endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unexpected error' 
      },
      { status: 500 }
    );
  }
}
