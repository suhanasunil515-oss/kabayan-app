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

// Legacy status mapping for backward compatibility
const LEGACY_STATUS_COLOR_MAP: Record<string, string> = {
  'pending': '#F59E0B',
  'under_review': '#3B82F6',
  'approved': '#22C55E',
  'rejected': '#EF4444',
  'disbursed': '#22C55E',
  'completed': '#8B5CF6',
  'defaulted': '#7F1D1D',
  'withdrawal processing': '#6366F1',
  'refused to pay': '#DC2626',
  'cancelled': '#64748B',
  'failed': '#EF4444',
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
  
  // Try legacy mapping
  const lowerStatus = status?.toLowerCase();
  if (LEGACY_STATUS_COLOR_MAP[lowerStatus]) {
    return LEGACY_STATUS_COLOR_MAP[lowerStatus];
  }
  
  // Default color
  return '#6B7280';
}

// Status descriptions from review-loan-modal
const STATUS_DESCRIPTIONS: Record<string, string> = {
  'UNDER_REVIEW': 'Your application is currently under review. Please wait for further updates from our Finance Department.',
  'LOAN_APPROVED': 'Your loan has been approved. Please contact the Finance Department or your credit officer to obtain the OTP code.',
  'LOAN_APPROVED_CONFIRMATION': 'To obtain the OTP withdrawal code, please confirm 10% of your authorized credit limit.',
  'OTP_GENERATED': 'Your withdrawal OTP code is 798429. Please note that this OTP is valid for a single withdrawal only.',
  'WITHDRAWAL_PROCESSING': 'Your withdrawal request is currently being processed. Please wait for confirmation.',
  'WITHDRAWAL_FAILED': 'Your withdrawal request has failed. Please contact the Finance Department for further details.',
  'INVALID_BANK_NAME': 'Your withdrawal request failed because the bank name provided is invalid. Please update your banking information.',
  'INVALID_BANK_ACCOUNT': 'The bank account number provided is incorrect. The system failed to transfer funds, and they are temporarily frozen. Please contact us immediately to unfreeze your funds.',
  'INVALID_BANK_ACCOUNT_FROZEN': 'The system was unable to transfer funds to your bank account because the account information provided is incorrect. As a result, the funds have been frozen. Please contact us to resolve the issue and unfreeze your funds.',
  'MISMATCH_BENEFICIARY': 'The bank account number does not match the name on your application. The funds have been temporarily frozen. Please contact us immediately to resolve this issue.',
  'INVALID_ID_CARD': 'Your withdrawal request failed because the ID card information provided is invalid. Please upload a valid identification document.',
  'FUND_FROZEN': 'Your account has been temporarily frozen due to modifications made to your loan approved application. Please contact the Finance Department for assistance.',
  'ERROR_INFO': 'The system was unable to transfer funds due to an error. The funds have been frozen. Please contact us to unfreeze them.',
  'ACCOUNT_LIMIT_REACHED': 'The system was unable to transfer funds to your bank account as it has reached its limit. The funds have been frozen. Please contact us to unfreeze them.',
  'PROCESSING_UNFREEZE': 'Your request to unfreeze your funds is currently being processed.',
  'UNFROZEN': 'Your account has been successfully unfrozen. We apologize for any inconvenience caused and appreciate your patience.',
  'LOW_CREDIT_SCORE': 'Your credit score needs attention. Take action now to improve your credit score and secure better financial opportunities.',
  'TOP_UP_CREDIT_SCORE': 'Your credit score requires improvement. Please complete the necessary steps to increase it.',
  'WITHDRAWAL_REJECTED': 'Your withdrawal request has been rejected. Please contact the Finance Department for further details.',
  'OVERDUE': 'Your account is currently overdue. Please deposit the outstanding amount as soon as possible to avoid penalties. We apologize for any inconvenience caused and appreciate your patience.',
  'TAX': 'Tax payment is required before proceeding. Please contact the Finance Department for further instructions.',
  'TAX_SETTLED': 'Your tax payment has been successfully settled. You may proceed with your transaction.',
  'WITHDRAWAL_SUCCESSFUL': 'Your withdrawal has been successfully completed. Please check your bank account for confirmation.',
  'BANK_INFO_UPDATED': 'Your banking information has been successfully updated.',
  'PERSONAL_INFO_UPDATED': 'Your personal information has been successfully updated.',
  'INSURANCE': 'Insurance verification is required before proceeding. Please contact the Finance Department for details.',
  'GAMBLING': 'Your account has been flagged due to gambling-related activity. Please contact the Finance Department for clarification.',
  'IRREGULAR_ACTIVITY': 'We noticed some irregular activity on your account. Please update your information immediately to avoid any disruption in service.',
  'DUPLICATE_APPLICATION': 'A duplicate application has been detected. Please contact the Finance Department to resolve this issue.',
  'ACCOUNT_SUSPENDED': 'Your account has been temporarily suspended due to a policy violation or unusual activity. Please contact the Finance Department for assistance.',
  'ACCOUNT_REACTIVATED': 'Your account has been successfully reactivated. You may now continue using all services normally.',
  'ACCOUNT_DEACTIVATED': 'Your account has been deactivated. Please contact the Finance Department if you wish to reactivate it.',
  'RENEW_OTP': 'Your OTP code has expired. Please contact the Finance Department to request a new one.',
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const loanId = parseInt(id, 10);

    if (isNaN(loanId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid loan ID' },
        { status: 400 }
      );
    }

    // Try to fetch from loan_applications first with JOIN to users (explicit columns for performance)
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
          ip_address,
          created_at
        )
      `)
      .eq('id', loanId)
      .eq('is_active', true)
      .single();

    if (loanAppData && !appError) {
      
      // Calculate monthly interest and installment
      const loanAmount = Number(loanAppData.amount_requested) || 0;
      const interestRate = Number(loanAppData.interest_rate) || 0;
      const loanTermMonths = Number(loanAppData.loan_term_months) || 12;
      
      // interest_rate is monthly percentage (e.g. 0.5 = 0.5% per month)
      const monthlyInterest = loanAmount * (interestRate / 100);
      const monthlyPrincipal = loanAmount / loanTermMonths;
      const monthlyInstallment = monthlyPrincipal + monthlyInterest;
      const totalRepayment = loanAmount + (monthlyInterest * loanTermMonths);
      
      // Transform the data to match what frontend expects
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
        // KYC document URLs
        kyc_front_url: loanAppData.kyc_front_url,
        kyc_back_url: loanAppData.kyc_back_url,
        selfie_url: loanAppData.selfie_url,
        signature_url: loanAppData.signature_url,
        personal_info: loanAppData.personal_info,
        // Calculated values for loan approval letter
        monthly_interest: monthlyInterest,
        monthly_installment: monthlyInstallment,
        total_repayment: totalRepayment,
        installment_date: getNextInstallmentDate(loanAppData.created_at),
      };

      return NextResponse.json({
        success: true,
        data: transformedData,
        source: 'loan_applications',
      });
    }

    // Fallback: try loans table with JOIN to users (explicit columns for performance)
    const { data: loansData, error: loansError } = await supabaseAdmin
      .from('loans')
      .select(`
        id,
        document_number,
        order_number,
        user_id,
        loan_amount,
        interest_rate,
        loan_period_months,
        status,
        status_color,
        status_description,
        created_at,
        updated_at,
        borrower_name,
        borrower_id_number,
        bank_name,
        users:user_id (
          id,
          full_name,
          phone_number,
          email,
          id_card_number,
          bank_name,
          bank_card_number,
          city,
          country
        )
      `)
      .eq('id', loanId)
      .eq('is_active', true)
      .single();

    if (loansData && !loansError) {
      
      // Calculate monthly interest and installment
      const loanAmount = Number(loansData.loan_amount) || 0;
      const interestRate = Number(loansData.interest_rate) || 0;
      const loanTermMonths = Number(loansData.loan_period_months) || 12;
      
      // interest_rate is monthly percentage (e.g. 0.5 = 0.5% per month)
      const monthlyInterest = loanAmount * (interestRate / 100);
      const monthlyPrincipal = loanAmount / loanTermMonths;
      const monthlyInstallment = monthlyPrincipal + monthlyInterest;
      const totalRepayment = loanAmount + (monthlyInterest * loanTermMonths);
      
      const transformedData = {
        id: loansData.id,
        document_number: loansData.document_number || loansData.order_number,
        order_number: loansData.order_number || loansData.document_number,
        borrower_name: loansData.users?.full_name || loansData.borrower_name || 'N/A',
        borrower_phone: loansData.users?.phone_number || loansData.borrower_phone || 'N/A',
        borrower_id_number: loansData.users?.id_card_number || loansData.borrower_id_number || 'N/A',
        borrower_email: loansData.users?.email || null,
        loan_amount: loanAmount,
        amount_requested: loanAmount,
        interest_rate: interestRate,
        loan_period_months: loanTermMonths,
        loan_term_months: loanTermMonths,
        status: loansData.status || 'pending',
        status_color: loansData.status_color || getStatusColor(loansData.status),
        status_description: loansData.status_description || '',
        created_at: loansData.created_at,
        updated_at: loansData.updated_at,
        user_id: loansData.user_id,
        bank_name: loansData.users?.bank_name || loansData.bank_name || 'N/A',
        bank_card_number: loansData.users?.bank_card_number || loansData.bank_card_number || null,
        // Calculated values for loan approval letter
        monthly_interest: monthlyInterest,
        monthly_installment: monthlyInstallment,
        total_repayment: totalRepayment,
        installment_date: getNextInstallmentDate(loansData.created_at),
      };

      return NextResponse.json({
        success: true,
        data: transformedData,
        source: 'loans',
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[v0] Loan not found with ID:', loanId);
    }
    return NextResponse.json(
      { success: false, error: 'Loan not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('[v0] Loan GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch loan' },
      { status: 500 }
    );
  }
}

// Helper function to calculate next installment date (15th of next month)
function getNextInstallmentDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      const today = new Date();
      let nextMonth = today.getMonth() + 1;
      let year = today.getFullYear();
      if (nextMonth > 11) {
        nextMonth = 0;
        year += 1;
      }
      const nextDate = new Date(year, nextMonth, 15);
      return nextDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }).replace(/,/g, '');
    }
    
    let nextMonth = date.getMonth() + 1;
    let year = date.getFullYear();
    if (nextMonth > 11) {
      nextMonth = 0;
      year += 1;
    }
    const nextDate = new Date(year, nextMonth, 15);
    return nextDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }).replace(/,/g, '');
  } catch (e) {
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    nextDate.setDate(15);
    return nextDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }).replace(/,/g, '');
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const loanId = parseInt(id, 10);

    if (isNaN(loanId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid loan ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, statusColor, statusDescription, loanAmount, interestRate, loanPeriodMonths } = body;

    console.log('[v0] PATCH loan:', loanId, 'with body:', body);

    let result: any;

    // Try to update loan_applications first
    const appUpdates: any = {};
    if (status) appUpdates.status = status;
    if (statusColor) appUpdates.status_color = statusColor;
    if (statusDescription) appUpdates.admin_status_message = statusDescription;
    if (loanAmount) appUpdates.amount_requested = loanAmount;
    if (interestRate !== undefined) appUpdates.interest_rate = interestRate;
    if (loanPeriodMonths) appUpdates.loan_term_months = loanPeriodMonths;

    result = await supabaseAdmin
      .from('loan_applications')
      .update(appUpdates)
      .eq('id', loanId)
      .select()
      .single();

    if (!result.error) {
      console.log('[v0] Successfully updated loan_applications');
      
      // Also update the corresponding loans table record
      const loansUpdates: any = {};
      if (status) loansUpdates.status = status;
      if (statusColor) loansUpdates.status_color = statusColor;
      if (statusDescription) loansUpdates.status_description = statusDescription;
      if (loanAmount) loansUpdates.loan_amount = loanAmount;
      if (interestRate !== undefined) loansUpdates.interest_rate = interestRate;
      if (loanPeriodMonths) loansUpdates.loan_period_months = loanPeriodMonths;
      
      if (result.data?.user_id) {
        await supabaseAdmin
          .from('loans')
          .update(loansUpdates)
          .eq('user_id', result.data.user_id)
          .eq('is_active', true);
      }
      
      // Log to history
      if (status) {
        await supabaseAdmin.from('loan_status_history').insert([
          {
            loan_app_id: loanId,
            new_status: status,
            status_color: statusColor,
            description: statusDescription,
          },
        ]);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Loan updated successfully',
        data: result.data,
      });
    }

    // If loan_applications update failed, try loans table
    const updates: any = {};
    if (status) updates.status = status;
    if (statusColor) updates.status_color = statusColor;
    if (statusDescription) updates.status_description = statusDescription;
    if (loanAmount) updates.loan_amount = loanAmount;
    if (interestRate !== undefined) updates.interest_rate = interestRate;
    if (loanPeriodMonths) updates.loan_period_months = loanPeriodMonths;

    result = await supabaseAdmin
      .from('loans')
      .update(updates)
      .eq('id', loanId)
      .select()
      .single();

    if (result?.error) {
      console.error('[v0] Loan update error:', result.error);
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 400 }
      );
    }

    if (!result?.data) {
      return NextResponse.json(
        { success: false, error: 'Loan not found' },
        { status: 404 }
      );
    }

    if (status) {
      await supabaseAdmin.from('loan_status_history').insert([
        {
          loan_id: loanId,
          new_status: status,
          status_color: statusColor,
          description: statusDescription,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Loan updated successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('[v0] Loan PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update loan' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const loanId = parseInt(id, 10);

    if (isNaN(loanId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid loan ID' },
        { status: 400 }
      );
    }

    console.log('[v0] DELETE loan:', loanId);

    // Try to soft delete from loan_applications first
    const { data, error } = await supabaseAdmin
      .from('loan_applications')
      .update({ 
        is_active: false, 
        deleted_at: new Date().toISOString(),
        status: 'cancelled'
      })
      .eq('id', loanId)
      .select()
      .single();

    if (!error) {
      console.log('[v0] Successfully deleted from loan_applications');
      return NextResponse.json({
        success: true,
        message: 'Loan deleted successfully',
        data,
      });
    }

    // If loan_applications delete failed, try loans table
    const { data: loanData, error: loanError } = await supabaseAdmin
      .from('loans')
      .update({ 
        is_active: false, 
        deleted_at: new Date().toISOString(),
        status: 'cancelled'
      })
      .eq('id', loanId)
      .select()
      .single();

    if (loanError) {
      console.error('[v0] Loan delete error:', loanError);
      return NextResponse.json(
        { success: false, error: loanError.message },
        { status: 400 }
      );
    }

    if (!loanData) {
      return NextResponse.json(
        { success: false, error: 'Loan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Loan deleted successfully',
      data: loanData,
    });
  } catch (error) {
    console.error('[v0] Loan DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete loan' },
      { status: 500 }
    );
  }
}
