import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { updateUserPassword } from '@/lib/db-operations';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid member ID' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', memberId)
      .single();

    if (error) {
      console.error('[v0] Supabase error:', error);
      throw error;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // Fetch bank details from users table (bank_details JSONB field)
    let bankName = user.bank_name || null;
    let bankCardNumber = user.bank_card_number || null;
    let accountNumber = null;
    
    // Check if bank_details JSON exists in user record
    if (user.bank_details && typeof user.bank_details === 'object') {
      const bankDetails = user.bank_details as any;
      bankName = bankDetails.bankName || bankDetails.bank_name || bankName;
      accountNumber = bankDetails.accountNumber || bankDetails.account_number || null;
      bankCardNumber = bankDetails.bankCardNumber || bankCardNumber;
    }

    // Also check withdrawals table as fallback
    let withdrawal = null; // Declare the withdrawal variable here
    if (!bankName && !accountNumber) {
      const { data: withdrawalData } = await supabaseAdmin
        .from('withdrawals')
        .select('bank_name, account_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (withdrawalData) {
        withdrawal = withdrawalData;
        bankName = withdrawal.bank_name;
        accountNumber = withdrawal.account_number;
      }
    }

    // Fetch loan applications for this user (newest first); use the first one that has KYC so admins see uploaded docs
    const { data: loanApps } = await supabaseAdmin
      .from('loan_applications')
      .select('personal_info, kyc_front_url, kyc_back_url, selfie_url, signature_url, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const applications = loanApps || [];
    const loanAppWithKyc = applications.find(
      (app: { kyc_front_url?: string | null; kyc_back_url?: string | null; selfie_url?: string | null }) =>
        app.kyc_front_url || app.kyc_back_url || app.selfie_url
    );
    const loanApp = loanAppWithKyc || applications[0] || null;

    // Parse personal_info to get more details
    let personalInfoData = {};
    if (loanApp?.personal_info && typeof loanApp.personal_info === 'object') {
      personalInfoData = loanApp.personal_info;
    }

    // Build ID photos array from KYC documents (Front ID, Back ID, Selfie with ID)
    const idPhotos = [];
    if (loanApp?.kyc_front_url) {
      idPhotos.push({ id: 1, url: loanApp.kyc_front_url, type: 'front' });
    }
    if (loanApp?.kyc_back_url) {
      idPhotos.push({ id: 2, url: loanApp.kyc_back_url, type: 'back' });
    }
    if (loanApp?.selfie_url) {
      idPhotos.push({ id: 3, url: loanApp.selfie_url, type: 'selfie' });
    }

    const transformedUser = {
      id: user.id,
      name: user.full_name || (personalInfoData as any)?.full_name || 'Unknown',
      username: user.phone_number,
      email: user.email,
      score: user.credit_score || 500,
      wallet: user.wallet_balance || 0,
      withdrawal_code: user.withdrawal_otp || null,
      registration_date: user.created_at,
      status: user.is_banned ? 'disabled' : 'active',
      registration_area: user.city && user.country ? `${user.city}, ${user.country}` : user.city || user.country || 'Unknown',
      ip_address: user.ip_address || 'N/A',
      // 🔴 ADD THESE THREE LINES
      last_login_location: user.last_login_location,
      last_login_ip: user.last_login_ip,
      last_login_at: user.last_login_at,
      // 🔴
      note: user.notes || null,
      // Comprehensive member data
      full_name: user.full_name || (personalInfoData as any)?.full_name || 'Unknown',
      facebook_name: (personalInfoData as any)?.facebook_name || user.facebook_name || null,
      id_card_number: (personalInfoData as any)?.id_card_number || user.id_card_number || null,
      id_photos: idPhotos.length > 0 ? idPhotos : (user.id_photos || []),
      living_address: (personalInfoData as any)?.living_address || user.living_address || null,
      loan_purpose: (personalInfoData as any)?.loan_purpose || user.loan_purpose || null,
      company_name: (personalInfoData as any)?.company_name || user.company_name || null,
      position: (personalInfoData as any)?.position || user.position || null,
      seniority: (personalInfoData as any)?.seniority || user.seniority || null,
      monthly_income: (personalInfoData as any)?.monthly_income || user.monthly_income || 0,
      unit_address: (personalInfoData as any)?.unit_address || user.unit_address || null,
      contact_person1: (personalInfoData as any)?.contact_person1 || user.contact_person1 || null,
      contact_person2: (personalInfoData as any)?.contact_person2 || user.contact_person2 || null,
      signature_image: loanApp?.signature_url || user.signature_image || null,
      // Missing fields - add gender, date_of_birth, relative_name, relative_phone
      gender: (personalInfoData as any)?.gender || user.gender || null,
      date_of_birth: (personalInfoData as any)?.date_of_birth || user.date_of_birth || null,
      relative_name: (personalInfoData as any)?.relative_name || user.relative_name || ((personalInfoData as any)?.contact_person1?.name) || null,
      relative_phone: (personalInfoData as any)?.relative_phone || user.relative_phone || ((personalInfoData as any)?.contact_person1?.phone) || null,
      bank_name: bankName,
      bank_card_number: bankCardNumber,
      account_number: accountNumber,
      bank_details: {
        bankName: bankName,
        accountNumber: accountNumber,
        setBy: user.bank_details?.setBy || null,
        updatedAt: user.bank_details?.updatedAt || null,
      },
      // System data
      personalInfoCompleted: user.personal_info_completed,
      kycCompleted: user.kyc_completed,
      signatureCompleted: user.signature_completed,
    };

    return NextResponse.json({
      success: true,
      data: transformedUser,
    });
  } catch (error) {
    console.error('[v0] Member detail API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch member',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid member ID' },
        { status: 400 }
      );
    }

    console.log('[v0] PATCH request for member:', memberId);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log('[v0] PATCH body:', body);
    const { action, ...updates } = body;

    const dbUpdates: any = {};

    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    let adminDisplayName = cookieStore.get('admin_username')?.value || null;

    // Resolve admin display name for audit: use cookie, else look up by admin_id so notes show who made the change
    if (!adminDisplayName && adminId) {
      const { data: adminRow } = await supabaseAdmin
        .from('admin')
        .select('username')
        .eq('id', parseInt(adminId))
        .maybeSingle();
      adminDisplayName = adminRow?.username ?? 'Unknown administrator';
    }
    if (!adminDisplayName) adminDisplayName = 'Unknown administrator';

    // Get current user wallet for comparison (if wallet action)
    let oldWallet = 0;
    if (action === 'wallet') {
      const { data: currentUser } = await supabaseAdmin
        .from('users')
        .select('wallet_balance')
        .eq('id', memberId)
        .single();
      oldWallet = currentUser?.wallet_balance || 0;
    }

    // Handle different action types with proper mapping
    if (action === 'wallet' && updates.amount !== undefined) {
      const newBalance = parseFloat(updates.amount);
      const reason = updates.reason || 'Admin wallet modification';
      dbUpdates.wallet_balance = newBalance;
      dbUpdates.notes = reason;
      console.log('[v0] Updating wallet:', dbUpdates.wallet_balance);

      const { error: historyError } = await supabaseAdmin
        .from('wallet_modification_history')
        .insert({
          user_id: memberId,
          admin_id: adminId ? parseInt(adminId) : null,
          admin_username: adminDisplayName,
          old_balance: oldWallet,
          new_balance: newBalance,
          amount_changed: newBalance - oldWallet,
          reason,
          created_at: new Date().toISOString(),
        });
      if (historyError) console.error('[v0] Error logging wallet modification:', historyError);
    } else if (action === 'score' && updates.score !== undefined) {
      dbUpdates.credit_score = parseInt(updates.score);
      console.log('[v0] Updating credit score:', dbUpdates.credit_score);
    } else if (action === 'withdrawal-code' && updates.code !== undefined) {
      dbUpdates.withdrawal_otp = updates.code;
      console.log('[v0] Updating withdrawal code');
    } else if (action === 'password' && updates.password !== undefined) {
      const result = await updateUserPassword(memberId, updates.password);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }
      const { data: userData } = await supabaseAdmin.from('users').select('*').eq('id', memberId).single();
      const { password_hash: _, ...userWithoutPassword } = userData || {};
      return NextResponse.json({
        success: true,
        message: result.message,
        data: userWithoutPassword,
      });
    } else if (action === 'bank') {
      // Store bank details in users table with admin flag
      dbUpdates.bank_name = updates.bankName || '';
      // Store account number in bank_details as JSON with setBy flag
      dbUpdates.bank_details = {
        bankName: updates.bankName || '',
        account_number: updates.accountNumber || '',
        setBy: 'admin', // Flag to indicate admin set this
        setAt: new Date().toISOString(),
      };
      console.log('[v0] Updating bank details with admin flag');
    } else if (action === 'identity') {
      dbUpdates.id_card_number = updates.idNumber;
      // Optionally store actual name if needed
      if (updates.actualName) {
        dbUpdates.full_name = updates.actualName;
      }
      console.log('[v0] Updating identity');
    } else if (action === 'status') {
      // Toggle status: if currently active, disable it; if disabled, enable it
      const isBanning = updates.status === 'disabled' || updates.status === true;
      dbUpdates.is_banned = isBanning;
      console.log('[v0] Updating status to:', isBanning ? 'banned' : 'active');
    } else {
      // Generic update - map common field names
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'action') {
          dbUpdates[key] = value;
        }
      });
      console.log('[v0] Generic update:', dbUpdates);
    }

    if (Object.keys(dbUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    console.log('[v0] Database updates:', dbUpdates);

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(dbUpdates)
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      console.error('[v0] Supabase update error:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Database update failed: ${error.message}`,
        },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Member not found after update' },
        { status: 404 }
      );
    }

    console.log('[v0] Member updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      data,
    });
  } catch (error) {
    console.error('[v0] Member update API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update member';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
