import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    console.log('[v0] Update signature - User ID from cookie:', userId);

    if (!userId) {
      console.log('[v0] No user ID found in cookies');
      return NextResponse.json(
        { error: 'Unauthorized - No user ID' },
        { status: 401 }
      );
    }

    // Parse the request body
    let body;
    try {
      body = await req.json();
      console.log('[v0] Request body received:', { 
        applicationId: body.applicationId, 
        hasSignatureUrl: !!body.signatureUrl,
        isSigned: body.isSigned 
      });
    } catch (parseError) {
      console.error('[v0] Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { applicationId, signatureUrl, isSigned } = body;

    if (!applicationId) {
      console.log('[v0] Missing applicationId');
      return NextResponse.json(
        { error: 'Missing applicationId' },
        { status: 400 }
      );
    }

    if (!signatureUrl) {
      console.log('[v0] Missing signatureUrl');
      return NextResponse.json(
        { error: 'Missing signatureUrl' },
        { status: 400 }
      );
    }

    console.log('[v0] Processing signature update for:', { 
      applicationId, 
      userId: parseInt(userId),
      signatureUrlLength: signatureUrl.length 
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // First check if the application exists and belongs to the user
    const { data: existingApp, error: checkError } = await supabase
      .from('loan_applications')
      .select('id, user_id, status, signature_url, is_signed')
      .eq('id', applicationId)
      .eq('user_id', parseInt(userId))
      .single();

    if (checkError) {
      console.error('[v0] Error checking application:', checkError);
      return NextResponse.json(
        { error: 'Application not found or access denied: ' + checkError.message },
        { status: 404 }
      );
    }

    if (!existingApp) {
      console.log('[v0] No application found with id:', applicationId, 'for user:', userId);
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    console.log('[v0] Found existing application:', existingApp);

    // Update the loan application with signature URL and signed status
    const updateData = {
      signature_url: signatureUrl,
      is_signed: true,
      status: 'under_review',
      updated_at: new Date().toISOString()
    };

    console.log('[v0] Updating with data:', updateData);

    const { data, error } = await supabase
      .from('loan_applications')
      .update(updateData)
      .eq('id', applicationId)
      .eq('user_id', parseInt(userId))
      .select()
      .single();

    if (error) {
      console.error('[v0] Error updating signature:', error);
      return NextResponse.json(
        { error: 'Database update failed: ' + error.message },
        { status: 400 }
      );
    }

    console.log('[v0] Signature update successful:', data);
    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('[v0] Signature update error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
