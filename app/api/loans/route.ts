import { NextRequest, NextResponse } from 'next/server';
import { createLoanApplication, updateLoanApplicationStatus, getApplicationByIdAndUser, uploadKYCDocuments, getActiveApplicationForUser } from '@/lib/db-operations';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

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

    // Get user's active application
    if (action === 'get_user_application') {
      const result = await getActiveApplicationForUser(parseInt(userId));
      return NextResponse.json({ application: result.data });
    }

    const applicationId = url.searchParams.get('id');

    if (applicationId) {
      const { data: app } = await getApplicationByIdAndUser(parseInt(applicationId), parseInt(userId));
      return NextResponse.json({ application: app });
    }

    // Default: Return user's active loans from loans table
    const { data, error } = await supabaseAdmin
      .from('loans')
      .select('*')
      .eq('user_id', parseInt(userId))
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Get loans error:', error);
      return NextResponse.json({ loans: [] });
    }

    return NextResponse.json({ loans: data || [] });
  } catch (error) {
    console.error('Get application error:', error);
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

    const { action, documentNumber, amountRequested, loanTermMonths, interestRate, applicationId, status, adminMessage, frontUrl, backUrl, selfieUrl, personalInfo, signatureUrl, type, url } = await req.json();

    if (action === 'create') {
      if (!documentNumber || !amountRequested || !loanTermMonths) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      console.log('[v0] Creating loan application for user:', userId);

      const result = await createLoanApplication(
        parseInt(userId),
        documentNumber,
        amountRequested,
        loanTermMonths,
        interestRate || 0
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      // Get the newly created loan application ID
      const loanApplicationId = result.data.id;
      console.log('[v0] Created loan application with ID:', loanApplicationId);

      // Also create entry in loans table for admin visibility
      // Get user info for borrower details
      const userResponse = await supabaseAdmin
        .from('users')
        .select('full_name, phone_number, id_card_number')
        .eq('id', parseInt(userId))
        .single();

      const userData = userResponse.data;

      // Only create loans entry if we have valid user data
      if (!userData || !userData.full_name) {
        console.log('[v0] Skipping loans entry creation - no valid user data found for user:', userId);
      } else {
        console.log('[v0] Creating loan record with document number:', documentNumber);

        // Use the SAME ID as the loan application to keep them in sync
        const { error: loanError } = await supabaseAdmin
          .from('loans')
          .insert([
            {
              id: loanApplicationId, // Use the same ID from loan_applications
              user_id: parseInt(userId),
              order_number: documentNumber,
              document_number: documentNumber,
              borrower_name: userData.full_name,
              borrower_phone: userData.phone_number || 'N/A',
              borrower_id_number: userData.id_card_number || null,
              loan_amount: amountRequested,
              interest_rate: interestRate || 0,
              loan_period_months: loanTermMonths,
              status: 'Under Review',
              status_color: '#F59E0B',
              status_description: 'Your application has been received and is now under review. Our team is carefully assessing your information. You will receive an update within 24 hours.',
              is_active: true,
              loan_application_id: loanApplicationId, // Store reference to loan_applications table
            },
          ]);

        if (loanError) {
          console.error('[v0] Loan record creation error:', loanError);
          // Don't fail the whole operation if loan record fails
        } else {
          console.log('[v0] Loan record created successfully with ID:', loanApplicationId);
        }
      }

      return NextResponse.json({
        success: true,
        application: result.data,
      });
    }

    if (action === 'update_kyc_url') {
      if (!applicationId || !type || !url) {
        return NextResponse.json(
          { error: 'Missing application ID, type, or URL' },
          { status: 400 }
        );
      }

      // Update the specific KYC URL column
      const updateData: any = {};
      if (type === 'front') {
        updateData.kyc_front_url = url;
      } else if (type === 'back') {
        updateData.kyc_back_url = url;
      } else if (type === 'selfie') {
        updateData.selfie_url = url;
      }

      const { data, error } = await supabaseAdmin
        .from('loan_applications')
        .update(updateData)
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        application: data,
      });
    }

    if (action === 'upload_kyc') {
      if (!applicationId || !frontUrl || !backUrl || !selfieUrl) {
        return NextResponse.json(
          { error: 'Missing KYC documents' },
          { status: 400 }
        );
      }

      const result = await uploadKYCDocuments(
        applicationId,
        frontUrl,
        backUrl,
        selfieUrl,
        personalInfo || {}
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      // Also update the loans table with borrower information
      if (personalInfo && personalInfo.id_card_number) {
        await supabaseAdmin
          .from('loans')
          .update({ 
            borrower_id_number: personalInfo.id_card_number,
            borrower_name: personalInfo.full_name || undefined
          })
          .eq('loan_application_id', applicationId);
      }

      return NextResponse.json({
        success: true,
        application: result.data,
      });
    }

    if (action === 'update_personal_info') {
      if (!applicationId || !personalInfo) {
        return NextResponse.json(
          { error: 'Missing application ID or personal info' },
          { status: 400 }
        );
      }

      const result = await uploadKYCDocuments(
        applicationId,
        '', // Keep existing front URL
        '', // Keep existing back URL
        '', // Keep existing selfie URL
        personalInfo
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      // Also update the loans table with borrower information
      if (personalInfo.id_card_number || personalInfo.full_name) {
        await supabaseAdmin
          .from('loans')
          .update({ 
            borrower_id_number: personalInfo.id_card_number || undefined,
            borrower_name: personalInfo.full_name || undefined
          })
          .eq('loan_application_id', applicationId);
      }

      return NextResponse.json({
        success: true,
        application: result.data,
      });
    }

    if (action === 'sign_application') {
      if (!applicationId || !signatureUrl) {
        return NextResponse.json(
          { error: 'Missing application ID or signature URL' },
          { status: 400 }
        );
      }

      // Update the loan application with signature URL and signed status
      const { data, error } = await supabaseAdmin
        .from('loan_applications')
        .update({
          signature_url: signatureUrl,
          is_signed: true,
          status: 'under_review',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .eq('user_id', parseInt(userId))
        .select()
        .single();

      if (error) {
        console.error('[v0] Error updating signature:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      // Also update the loans table to reflect signed status
      await supabaseAdmin
        .from('loans')
        .update({ 
          status: 'Under Review',
          status_description: 'Application signed and under review'
        })
        .eq('loan_application_id', applicationId);

      return NextResponse.json({
        success: true,
        application: data,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Loan application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
