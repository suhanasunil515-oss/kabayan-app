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
    'PENDING': '#F59E0B',
    'under_review': '#3B82F6',
    'UNDER REVIEW': '#3B82F6',
    'approved': '#22C55E',
    'APPROVED': '#22C55E',
    'rejected': '#EF4444',
    'REJECTED': '#EF4444',
    'handling fee': '#8B5CF6',
    'HANDLING FEE': '#8B5CF6',
    'overdue record': '#DC2626',
    'OVERDUE RECORD': '#DC2626',
    'withdrawal successfully': '#22C55E',
    'WITHDRAWAL SUCCESSFULLY': '#22C55E',
    'declined': '#EF4444',
    'DECLINED': '#EF4444',
    'disbursed': '#22C55E',
    'DISBURSED': '#22C55E',
    'completed': '#22C55E',
    'COMPLETED': '#22C55E',
    'defaulted': '#7F1D1D',
    'DEFAULTED': '#7F1D1D',
    'cancelled': '#64748B',
    'CANCELLED': '#64748B',
  };
  
  const lowerStatus = status?.toLowerCase();
  if (legacyColors[status]) {
    return legacyColors[status];
  }
  if (legacyColors[lowerStatus]) {
    return legacyColors[lowerStatus];
  }
  
  return '#6B7280';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const exact = searchParams.get('exact') === 'true';
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const offset = (page - 1) * limit;

    // EXACT DOCUMENT NUMBER SEARCH - For Loan Approval Letter page
    if (exact && search) {
      const { data: exactLoan, error: exactError } = await supabaseAdmin
        .from('loan_applications')
        .select(`
          id,
          document_number,
          user_id,
          amount_requested,
          interest_rate,
          loan_term_months,
          status,
          admin_status_message,
          created_at,
          updated_at,
          kyc_front_url,
          kyc_back_url,
          selfie_url,
          signature_url,
          personal_info,
          is_active,
          users!inner (
            id,
            full_name,
            phone_number,
            id_card_number,
            bank_name,
            bank_card_number,
            email,
            city,
            country
          )
        `)
        .eq('document_number', search.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (exactError) {
        return NextResponse.json({
          success: false,
          error: 'Search error: ' + exactError.message,
          loans: [],
        }, { status: 500 });
      }

      if (exactLoan) {
        if (exactLoan.document_number !== search.trim()) {
          return NextResponse.json({
            success: false,
            error: 'Database returned mismatched document',
            loans: [],
          }, { status: 500 });
        }
        
        // Transform single loan
        const transformedLoan = {
          id: exactLoan.id,
          order_number: exactLoan.document_number,
          document_number: exactLoan.document_number,
          borrower_name: exactLoan.users?.full_name || 'Unknown',
          borrower_id_number: (exactLoan.personal_info as any)?.id_card_number || exactLoan.users?.id_card_number || 'N/A',
          borrower_phone: exactLoan.users?.phone_number || 'N/A',
          borrower_email: exactLoan.users?.email || null,
          loan_amount: Number(exactLoan.amount_requested) || 0,
          amount_requested: Number(exactLoan.amount_requested) || 0,
          interest_rate: Number(exactLoan.interest_rate) || 0,
          loan_period_months: Number(exactLoan.loan_term_months) || 12,
          loan_term_months: Number(exactLoan.loan_term_months) || 12,
          status: exactLoan.status === 'pending' ? 'PENDING' : (exactLoan.status || 'PENDING').toUpperCase(),
          status_color: getStatusColor(exactLoan.status === 'pending' ? 'PENDING' : exactLoan.status),
          status_description: exactLoan.admin_status_message || '',
          created_at: exactLoan.created_at,
          updated_at: exactLoan.updated_at,
          user_id: exactLoan.user_id,
          bank_name: exactLoan.users?.bank_name || 'N/A',
          bank_card_number: exactLoan.users?.bank_card_number || null,
          // KYC document URLs
          kyc_front_url: exactLoan.kyc_front_url,
          kyc_back_url: exactLoan.kyc_back_url,
          selfie_url: exactLoan.selfie_url,
          signature_url: exactLoan.signature_url,
          personal_info: exactLoan.personal_info,
          is_active: exactLoan.is_active,
          source: 'loan_applications',
          loan_type: 'Personal Loan',
        };

        return NextResponse.json({
          success: true,
          loans: [transformedLoan], // Array with SINGLE loan
          data: [transformedLoan],
          pagination: {
            page: 1,
            limit: 1,
            total: 1,
            pages: 1,
          },
          exact_match: true,
        });
      } else {
        return NextResponse.json({
          success: true,
          loans: [],
          data: [],
          pagination: {
            page: 1,
            limit: 1,
            total: 0,
            pages: 0,
          },
          exact_match: false,
        });
      }
    }

    // Paginated list with explicit columns for performance
    let loanAppsQuery = supabaseAdmin
      .from('loan_applications')
      .select(`
        id,
        document_number,
        user_id,
        amount_requested,
        interest_rate,
        loan_term_months,
        status,
        created_at,
        personal_info,
        users!inner(full_name, phone_number, id_card_number, bank_name)
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Apply fuzzy search only for non-exact queries
    if (search) {
      const docSearch = loanAppsQuery.ilike('document_number', `%${search}%`);
      
      if (/\d/.test(search)) {
        loanAppsQuery = docSearch;
      } else {
        const { data: matchingUsers } = await supabaseAdmin
          .from('users')
          .select('id')
          .or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
        
        const userIds = (matchingUsers || []).map((u: any) => u.id);
        
        if (userIds.length > 0) {
          loanAppsQuery = loanAppsQuery.in('user_id', userIds);
        } else {
          loanAppsQuery = docSearch;
        }
      }
    }

    if (status) {
      loanAppsQuery = loanAppsQuery.eq('status', status);
    }

    if (startDate) {
      loanAppsQuery = loanAppsQuery.gte('created_at', startDate);
    }

    if (endDate) {
      loanAppsQuery = loanAppsQuery.lte('created_at', endDate);
    }

    const { data: loanAppsData, count: loanAppsCount, error: loanAppsError } = await loanAppsQuery.range(offset, offset + limit - 1);

    if (loanAppsError) throw loanAppsError;

    // Transform loan_applications
    const transformedLoanApps = (loanAppsData || []).map((app: any) => {
      const personalId = app.personal_info?.id_card_number;
      const userId = app.users?.id_card_number;
      return {
      id: app.id,
      order_number: app.document_number,
      document_number: app.document_number,
      borrower_name: app.users?.full_name || 'Unknown',
      borrower_id_number: personalId || userId || 'N/A',
      borrower_phone: app.users?.phone_number || 'N/A',
      loan_amount: Number(app.amount_requested) || 0,
      interest_rate: Number(app.interest_rate) || 0,
      loan_period_months: Number(app.loan_term_months) || 12,
      status: app.status === 'pending' ? 'PENDING' : (app.status || 'PENDING').toUpperCase(),
      status_color: getStatusColor(app.status === 'pending' ? 'PENDING' : app.status),
      created_at: app.created_at,
      user_id: app.user_id,
      is_active: true,
      source: 'loan_applications',
      loan_type: 'Personal Loan',
    };
    });

    return NextResponse.json({
      success: true,
      loans: transformedLoanApps,
      data: transformedLoanApps,
      pagination: {
        page,
        limit,
        total: loanAppsCount || 0,
        pages: Math.ceil((loanAppsCount || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[v0] Loans GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loans', loans: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      userId,
      loanAmount,
      interestRate,
      loanPeriodMonths,
      bankName,
      borrowerName,
      borrowerIdNumber,
      borrowerPhone,
    } = body;

    if (!userId || !loanAmount || !interestRate || !loanPeriodMonths) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const { data, error } = await supabaseAdmin
      .from('loans')
      .insert([
        {
          user_id: userId,
          order_number: orderNumber,
          loan_amount: loanAmount,
          interest_rate: interestRate,
          loan_period_months: loanPeriodMonths,
          borrower_name: borrowerName,
          borrower_phone: borrowerPhone,
          status: 'PENDING',
          status_color: '#F59E0B',
          bank_name: bankName,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[v0] Loan creation error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Loan created successfully',
      data,
    });
  } catch (error) {
    console.error('[v0] Loan POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create loan' },
      { status: 500 }
    );
  }
}
