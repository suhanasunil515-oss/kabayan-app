import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * DIAGNOSTIC ENDPOINT - Helps identify data integrity issues
 * GET /api/admin/diagnostics/loan-search?document_number=DOC-XXX
 * Returns detailed information about what's in the database
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const documentNumber = searchParams.get('document_number');

    if (!documentNumber) {
      return NextResponse.json({
        success: false,
        error: 'document_number parameter required'
      }, { status: 400 });
    }

    console.log('[v0] Diagnostic search for:', documentNumber);

    // Search for ALL records with this document number (to detect duplicates)
    const { data: allMatches, error: allError } = await supabaseAdmin
      .from('loan_applications')
      .select(`
        id,
        document_number,
        user_id,
        users!inner (
          id,
          full_name,
          email
        ),
        amount_requested,
        is_active,
        status,
        created_at
      `)
      .eq('document_number', documentNumber.trim())
      .eq('is_active', true);

    if (allError) {
      throw new Error('Database query failed: ' + allError.message);
    }

    // Also search the loans table
    const { data: loansTableRecords, error: loansError } = await supabaseAdmin
      .from('loans')
      .select(`
        id,
        document_number,
        user_id,
        borrower_name,
        loan_amount,
        is_active,
        status,
        created_at
      `)
      .eq('document_number', documentNumber.trim())
      .eq('is_active', true);

    console.log('[v0] Diagnostic Results:', {
      loan_applications_matches: allMatches?.length || 0,
      loans_table_matches: loansTableRecords?.length || 0,
      records: allMatches,
    });

    return NextResponse.json({
      success: true,
      document_number: documentNumber,
      loan_applications: {
        count: allMatches?.length || 0,
        records: allMatches || [],
        has_duplicates: (allMatches?.length || 0) > 1,
      },
      loans_table: {
        count: loansTableRecords?.length || 0,
        records: loansTableRecords || [],
        has_duplicates: (loansTableRecords?.length || 0) > 1,
      },
      diagnosis: generateDiagnosis(allMatches || [], loansTableRecords || []),
    });
  } catch (error) {
    console.error('[v0] Diagnostic error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateDiagnosis(loanAppRecords: any[], loansRecords: any[]): string {
  if (loanAppRecords.length === 0 && loansRecords.length === 0) {
    return 'No records found in either table.';
  }
  
  if (loanAppRecords.length > 1) {
    return `DUPLICATE RECORDS DETECTED: ${loanAppRecords.length} records found in loan_applications table with the same document number. IDs: ${loanAppRecords.map(r => r.id).join(', ')}`;
  }
  
  if (loanAppRecords.length === 1 && loansRecords.length > 0) {
    return `Data exists in both tables. loan_applications ID: ${loanAppRecords[0].id}, loans table IDs: ${loansRecords.map(r => r.id).join(', ')}`;
  }
  
  if (loanAppRecords.length === 1) {
    return `Single record found in loan_applications. ID: ${loanAppRecords[0].id}`;
  }
  
  return 'OK - No issues detected';
}
