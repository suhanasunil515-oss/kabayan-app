import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from './supabase';

/**
 * Normalize phone for consistent lookup.
 * - Strips spaces/dashes
 * - Removes domestic leading 0 (e.g. +6309123456789 -> +639123456789)
 * - Keeps + prefix for international format
 */
function normalizePhoneForLookup(phone: string): string[] {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const withPlus = cleaned.startsWith('+') ? cleaned : '+' + cleaned.replace(/\D/g, '');
  const digitsOnly = withPlus.replace(/\D/g, '');
  const variants: string[] = [withPlus];
  // Remove domestic leading 0: +6309123456789 -> +639123456789
  const match = digitsOnly.match(/^(\d{2,3})0(\d{9,})$/);
  if (match) variants.push('+' + match[1] + match[2]);
  // Also try digits-only format in case DB has that
  if (digitsOnly.startsWith('0')) variants.push(digitsOnly.slice(1));
  return [...new Set(variants)];
}

// User Authentication
export async function registerUser(
  phoneNumber: string,
  password: string,
  fullName: string
) {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with default credit_score of 850
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          phone_number: phoneNumber,
          password_hash: hashedPassword,
          full_name: fullName,
          credit_score: 850, // Default credit score
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function loginUser(
  phoneNumber: string,
  password: string
) {
  try {
    console.log('[v0] Login attempt - phoneNumber:', phoneNumber);
    const variants = normalizePhoneForLookup(phoneNumber);

    let data: Record<string, unknown> | null = null;
    for (const variant of variants) {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('phone_number', variant)
        .maybeSingle();
      if (user && !error) {
        data = user;
        break;
      }
    }

    if (!data) {
      console.log('[v0] User not found - phone:', phoneNumber, 'tried:', variants);
      return { success: false, error: 'User not found' };
    }

    if (!data.password_hash) {
      console.log('[v0] User has no password hash - id:', data.id);
      return { success: false, error: 'Invalid account. Please reset your password.' };
    }

    console.log('[v0] User found - id:', data.id, 'password_hash exists:', !!data.password_hash);

    // Verify password: same trim as updateUserPassword so admin-set passwords match
    const trimmedPassword = typeof password === 'string' ? password.trim() : '';
    const storedHash = data.password_hash != null ? String(data.password_hash) : '';
    let passwordMatch = await bcrypt.compare(trimmedPassword, storedHash);
    if (!passwordMatch && trimmedPassword !== password) {
      passwordMatch = await bcrypt.compare(password, storedHash);
    }

    console.log('[v0] Password comparison result:', passwordMatch);
    console.log('[v0] Password length entered:', password.length);
    console.log('[v0] Hash length stored:', (data.password_hash as string)?.length);

    if (!passwordMatch) {
      console.log('[v0] Invalid password for user:', data.id);
      return { success: false, error: 'Invalid password' };
    }

    console.log('[v0] Login successful for user:', data.id);
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Login error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getUserByPhoneNumber(phoneNumber: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Loan Applications
export async function createLoanApplication(
  userId: number,
  documentNumber: string,
  amountRequested: number,
  loanTermMonths: number,
  interestRate: number
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('loan_applications')
      .insert([
        {
          user_id: userId,
          document_number: documentNumber,
          amount_requested: amountRequested,
          loan_term_months: loanTermMonths,
          interest_rate: interestRate,
          status: 'pending',
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getLoanApplicationsByUserId(userId: number) {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'rejected')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getActiveApplicationForUser(userId: number) {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'rejected')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Fetch a single application by id and user_id (avoids getAllLoanApplications) */
export async function getApplicationByIdAndUser(applicationId: number, userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('loan_applications')
      .select('*, users(phone_number, full_name)')
      .eq('id', applicationId)
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') return { success: true, data: null };
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getLoanApplications(userId: number) {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateLoanApplicationStatus(
  applicationId: number,
  status: 'pending' | 'under_review' | 'approved' | 'rejected',
  adminMessage?: string
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('loan_applications')
      .update({
        status,
        admin_status_message: adminMessage,
        status_updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function uploadKYCDocuments(
  applicationId: number,
  frontUrl: string,
  backUrl: string,
  selfieUrl: string,
  personalInfo: object
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('loan_applications')
      .update({
        kyc_front_url: frontUrl,
        kyc_back_url: backUrl,
        selfie_url: selfieUrl,
        personal_info: personalInfo,
      })
      .eq('id', applicationId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Verification Status Management
export async function getUserVerificationStatus(userId: number) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('personal_info_completed, kyc_completed, signature_completed, last_verified_at, bank_details')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    const user = data || null;
    const bankDetails = user?.bank_details;
    const bank_details_completed = !!(
      bankDetails &&
      typeof bankDetails === 'object' &&
      (bankDetails.bankName || bankDetails.bank_name) &&
      (bankDetails.accountNumber || bankDetails.account_number)
    );
    return {
      success: true,
      data: user ? { ...user, bank_details_completed } : null,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function markPersonalInfoCompleted(userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        personal_info_completed: true,
        last_verified_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function markKYCCompleted(userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        kyc_completed: true,
        last_verified_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function markSignatureCompleted(userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        signature_completed: true,
        last_verified_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Transactions
export async function createTransaction(
  userId: number,
  type: 'manual_deposit' | 'loan_disbursement' | 'withdrawal',
  amount: number,
  description: string,
  otpCode?: string
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type,
          amount,
          description,
          otp_code: otpCode,
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getTransactions(userId: number) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateWalletBalance(
  userId: number,
  amount: number,
  isDebit: boolean = false
) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (!user) throw new Error('User not found');

    const newBalance = isDebit
      ? user.wallet_balance - amount
      : user.wallet_balance + amount;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Wallet Operations
export async function getWalletData(userId: number) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('wallet_balance, id')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return {
      success: true,
      data: {
        balance: data.wallet_balance,
        currency: 'PHP',
        userId: data.id,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// FIXED: getLoanStatusForUser - Now returns both camelCase and snake_case
export async function getLoanStatusForUser(userId: number) {
  try {
    console.log('[v0] Getting loan status for user:', userId);
    
    // First try to get data from the loans table (where admin updates go)
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .select(`
        id,
        document_number,
        order_number,
        status,
        status_color,
        status_description,
        loan_amount,
        interest_rate,
        loan_period_months,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (loanError) {
      console.error('[v0] Error fetching from loans table:', loanError);
    }

    // If we found data in the loans table, use it
    if (loanData) {
      console.log('[v0] Found loan data in loans table:', {
        document_number: loanData.document_number,
        status: loanData.status,
        status_color: loanData.status_color, // This is the database value
        status_description: loanData.status_description
      });

      // IMPORTANT: Return BOTH camelCase AND snake_case for maximum compatibility
      return {
        success: true,
        data: {
          // CamelCase versions (for frontend)
          documentNumber: loanData.document_number || loanData.order_number,
          status: loanData.status,
          statusMessage: loanData.status_description || '',
          statusColor: loanData.status_color || '#F59E0B', // This is the key field
          amountRequested: loanData.loan_amount,
          loanTerm: loanData.loan_period_months,
          interestRate: loanData.interest_rate,
          createdAt: loanData.created_at,
          allowWithdrawal: loanData.status_color === '#22C55E',
          
          // ALSO include snake_case versions (for backward compatibility)
          document_number: loanData.document_number || loanData.order_number,
          status_description: loanData.status_description || '',
          status_color: loanData.status_color || '#F59E0B', // Include this too!
          amount_requested: loanData.loan_amount,
          loan_term: loanData.loan_period_months,
          interest_rate: loanData.interest_rate,
        },
      };
    }

    // Fallback to loan_applications table if no data in loans
    console.log('[v0] No data in loans table, checking loan_applications');
    const { data: appData, error: appError } = await supabase
      .from('loan_applications')
      .select('id, document_number, status, admin_status_message, amount_requested, loan_term_months, interest_rate, created_at, status_color')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (appError && appError.code !== 'PGRST116') {
      throw appError;
    }

    if (!appData) {
      console.log('[v0] No loan application found for user:', userId);
      return { success: true, data: null };
    }

    // Check if status_color exists in the database first
    let statusColor = appData.status_color;
    
    // If no status_color in DB, use default mapping
    if (!statusColor) {
      const statusColorMap: Record<string, string> = {
        'pending': '#6C757D',
        'under_review': '#F59E0B',
        'approved': '#22C55E',
        'rejected': '#EF4444',
      };
      statusColor = statusColorMap[appData.status?.toLowerCase()] || '#6C757D';
    }

    console.log('[v0] Using loan_applications data with color:', {
      status: appData.status,
      status_color: statusColor,
      adminMessage: appData.admin_status_message
    });

    return {
      success: true,
      data: {
        // CamelCase versions
        documentNumber: appData.document_number,
        status: appData.status,
        statusMessage: appData.admin_status_message || 'Your application is being processed.',
        statusColor: statusColor,
        amountRequested: appData.amount_requested,
        loanTerm: appData.loan_term_months,
        interestRate: appData.interest_rate,
        createdAt: appData.created_at,
        allowWithdrawal: appData.status?.toLowerCase() === 'approved',
        
        // Snake_case versions
        document_number: appData.document_number,
        status_description: appData.admin_status_message || 'Your application is being processed.',
        status_color: statusColor, // Include this!
        amount_requested: appData.amount_requested,
        loan_term: appData.loan_term_months,
        interest_rate: appData.interest_rate,
      },
    };
  } catch (error) {
    console.error('[v0] getLoanStatusForUser error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// OTP Management
export async function generateOTP(userId: number) {
  try {
    // Fetch the admin-set withdrawal code from user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('withdrawal_otp')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[v0] User fetch error:', userError);
      return { success: false, error: 'User not found' };
    }

    const otp = user.withdrawal_otp;
    
    if (!otp) {
      console.error('[v0] No withdrawal code set for user');
      return { success: false, error: 'No withdrawal code set. Contact admin.' };
    }

    console.log('[v0] OTP retrieved successfully from user record');

    return {
      success: true,
      data: {
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        otpLength: otp.length,
      },
    };
  } catch (error) {
    console.error('[v0] generateOTP error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function verifyOTP(userId: number, otp: string) {
  try {
    // Fetch the admin-set withdrawal code from user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('withdrawal_otp')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[v0] User fetch error:', userError);
      return { success: false, error: 'User not found' };
    }

    // Compare the provided OTP with the user's withdrawal_otp
    if (user.withdrawal_otp === otp) {
      console.log('[v0] OTP verified successfully');
      return { success: true, data: { verified: true } };
    }

    console.warn('[v0] OTP verification failed - invalid OTP');
    return {
      success: false,
      error: 'Invalid OTP. Please try again.',
    };
  } catch (error) {
    console.error('[v0] verifyOTP error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function processWithdrawal(
  userId: number,
  amount: number,
  otp: string
) {
  try {
    console.log('[v0] Starting withdrawal process for userId:', userId, 'amount:', amount);

    // Rule 1: Verify OTP first
    const otpResult = await verifyOTP(userId, otp);
    if (!otpResult.success) {
      console.error('[v0] OTP verification failed:', otpResult.error);
      return otpResult;
    }

    // Rule 2: Check if user has an active approved loan
    const { data: loans, error: loanError } = await supabase
      .from('loans')
      .select('id, status')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (loanError) {
      console.error('[v0] Loan query error:', loanError);
      return { success: false, error: 'Failed to verify loan status' };
    }

    if (!loans || loans.length === 0) {
      console.warn('[v0] User has no active loan');
      return { success: false, error: 'You must have an active loan application to withdraw' };
    }

    const hasApprovedLoan = loans.some(loan => loan.status === 'Approved');
    if (!hasApprovedLoan) {
      console.warn('[v0] User loan is not approved');
      return { success: false, error: 'Your loan must be approved before you can withdraw' };
    }

    // Get current balance and user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_balance, full_name, phone_number, bank_details')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[v0] User query error:', userError);
      return { success: false, error: 'User not found' };
    }

    // Rule 3: Check sufficient balance
    if (user.wallet_balance < amount) {
      console.warn('[v0] Insufficient balance:', user.wallet_balance, 'requested:', amount);
      return { success: false, error: 'Insufficient balance. Your wallet balance is ₱' + user.wallet_balance };
    }

    // Update balance
    const newBalance = user.wallet_balance - amount;
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      console.error('[v0] Balance update error:', updateError);
      throw updateError;
    }

    // Parse bank details
    let bankName = 'Unknown Bank';
    let accountNumber = '••••';
    if (user.bank_details && typeof user.bank_details === 'object') {
      const bankDetails = user.bank_details as any;
      bankName = bankDetails.bankName || bankName;
      accountNumber = bankDetails.accountNumber || accountNumber;
    }

    // Create withdrawal record in withdrawals table
    const withdrawNumber = `WD-${Date.now().toString().slice(-12)}`;
    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('withdrawals')
      .insert([
        {
          withdraw_number: withdrawNumber,
          user_id: userId,
          amount,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: user.full_name,
          status: 'Pending',
          withdrawal_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (withdrawalError) {
      console.error('[v0] Withdrawal record error:', withdrawalError);
      throw withdrawalError;
    }

    // Create withdrawal transaction
    const { data: transaction, error: transError } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'withdrawal',
          amount,
          description: `Withdrawal ${withdrawNumber} processed`,
        },
      ])
      .select();

    if (transError) {
      console.error('[v0] Withdrawal transaction error:', transError);
      throw transError;
    }

    // Update loan status to "Withdrawal Processing"
    const { error: loanUpdateError } = await supabaseAdmin
      .from('loans')
      .update({
        status: 'Withdrawal Processing',
        status_description: 'Your withdrawal is currently being processed by the banking system. Please be patient during the transaction process.',
        status_color: 'bg-blue-100 text-blue-700 border-blue-300',
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (loanUpdateError) {
      console.warn('[v0] Could not update loan status:', loanUpdateError);
      // Don't throw - withdrawal already processed
    }

    console.log('[v0] Withdrawal processed successfully:', withdrawNumber);

    return {
      success: true,
      data: {
        newBalance,
        withdrawalAmount: amount,
        transactionId: transaction?.[0]?.id,
      },
    };
  } catch (error) {
    console.error('[v0] processWithdrawal error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Admin Authentication
export async function adminLogin(username: string, password: string) {
  try {
    console.log('[v0] ===== ADMIN LOGIN DEBUG =====');
    console.log('[v0] Login attempt for username:', username);
    
    // First, let's check what admins exist in the database
    const { data: allAdmins, error: listError } = await supabaseAdmin
      .from('admin')
      .select('id, username, email, is_active');
    
    if (listError) {
      console.error('[v0] Error listing admins:', listError);
    } else {
      console.log('[v0] All admins in database:', allAdmins?.map(a => a.username).join(', ') || 'none');
    }
    
    // Now try to find the specific admin
    const { data, error } = await supabaseAdmin
      .from('admin')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('[v0] Admin query error:', error);
      return { success: false, error: 'Database error: ' + error.message };
    }

    if (!data) {
      console.log('[v0] No admin found with username:', username);
      console.log('[v0] Available usernames:', allAdmins?.map(a => a.username).join(', '));
      return { success: false, error: 'Invalid username or password' };
    }

    console.log('[v0] Admin found:', { 
      id: data.id, 
      username: data.username, 
      email: data.email,
      is_active: data.is_active,
      hash_exists: !!data.password_hash,
      hash_length: data.password_hash?.length
    });

    // Check if admin is active
    if (!data.is_active) {
      console.log('[v0] Admin account is inactive');
      return { success: false, error: 'Admin account is inactive' };
    }

    // Verify password with detailed debugging
    console.log('[v0] Comparing password...');
    console.log('[v0] Stored hash (full):', data.password_hash);
    console.log('[v0] Password provided length:', password.length);
    console.log('[v0] Password provided (first char):', password.charAt(0));
    console.log('[v0] Password provided (last char):', password.charAt(password.length - 1));
    
    // Generate a test hash to see what bcrypt produces
    const testHash = await bcrypt.hash(password, 10);
    console.log('[v0] Test hash of provided password (first 30 chars):', testHash.substring(0, 30) + '...');
    console.log('[v0] Test hash full length:', testHash.length);

    const passwordMatch = await bcrypt.compare(password, data.password_hash);
    
    console.log('[v0] Password match result:', passwordMatch);

    if (!passwordMatch) {
      console.log('[v0] Password verification failed for user:', username);
      return { success: false, error: 'Invalid username or password' };
    }

    // Update last_login timestamp
    const { error: updateError } = await supabaseAdmin
      .from('admin')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id);

    if (updateError) {
      console.error('[v0] Error updating last_login:', updateError);
    }

    console.log('[v0] Admin login successful for:', username);
    console.log('[v0] ===== END DEBUG =====');

    return {
      success: true,
      data: {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
      },
    };
  } catch (error) {
    console.error('[v0] Admin login exception:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function initializeAdminFromEnv() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost.local';

    if (!adminPassword) {
      console.error('[v0] ADMIN_PASSWORD env variable not set');
      return { success: false, error: 'Admin password not configured' };
    }

    console.log('[v0] Initializing admin with username:', adminUsername);

    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('admin')
      .select('id, username')
      .eq('username', adminUsername);

    console.log('[v0] Admin existence check - error:', checkError, 'found:', existingAdmin);

    // If query succeeded and found an admin, they already exist
    if (!checkError && existingAdmin && existingAdmin.length > 0) {
      console.log('[v0] Admin already initialized with username:', adminUsername);
      return { success: true, message: 'Admin already exists' };
    }

    console.log('[v0] No existing admin found, creating new one...');

    // Hash password
    console.log('[v0] Hashing password for admin...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('[v0] Password hashed successfully. Hash length:', hashedPassword.length);

    // Create admin
    const { data, error } = await supabaseAdmin
      .from('admin')
      .insert([
        {
          username: adminUsername,
          email: adminEmail,
          password_hash: hashedPassword,
          role: 'SUPER_ADMIN',
          is_active: true,
        },
      ])
      .select();

    if (error) {
      console.error('[v0] Error creating admin:', error);
      return { success: false, error: error.message };
    }

    console.log('[v0] Admin created successfully. ID:', data?.[0]?.id, 'Username:', data?.[0]?.username);
    
    // Verify the hash was stored
    const { data: verifyData } = await supabaseAdmin
      .from('admin')
      .select('id, username, password_hash')
      .eq('id', data?.[0]?.id)
      .single();
    
    console.log('[v0] Verification - hash stored correctly:', !!verifyData?.password_hash, 'hash length:', verifyData?.password_hash?.length);

    return { success: true, data: data?.[0], message: 'Admin created successfully' };
  } catch (error) {
    console.error('[v0] Admin init exception:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Administrator Management (Superior Admin only)
export async function getAllAdmins() {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin')
      .select('id, username, email, role, is_active, created_at, last_login')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Map UI roles to DB constraint values (admin_role_check allows SUPER_ADMIN, ADMIN, MODERATOR)
const ROLE_TO_DB: Record<string, string> = {
  SUPERIOR_ADMIN: 'SUPER_ADMIN',
  VIP_ADMIN: 'ADMIN',
  REGULAR_ADMIN: 'MODERATOR',
};

export async function createAdmin(
  username: string,
  email: string,
  password: string,
  role: 'SUPERIOR_ADMIN' | 'VIP_ADMIN' | 'REGULAR_ADMIN'
) {
  try {
    const { data: existing } = await supabaseAdmin
      .from('admin')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Username already exists' };
    }

    const dbRole = ROLE_TO_DB[role] || 'MODERATOR';
    const passwordHash = await bcrypt.hash(password, 10);
    const { data, error } = await supabaseAdmin
      .from('admin')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        role: dbRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateAdminPassword(adminId: number, newPassword: string) {
  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const { error } = await supabaseAdmin
      .from('admin')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', adminId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteAdmin(adminId: number) {
  try {
    const { error } = await supabaseAdmin
      .from('admin')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', adminId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAllLoanApplications() {
  try {
    const { data, error } = await supabaseAdmin
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
        updated_at,
        users(phone_number, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Dashboard Metrics - all queries run in parallel for faster response
export async function getDashboardMetrics(startDate?: string, endDate?: string) {
  try {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];
    const dateGte = `${start}T00:00:00`;
    const dateLte = `${end}T23:59:59`;

    const [
      newUsersResult,
      allUsersResult,
      usersWithLoansResult,
      pendingLoansResult,
      approvedLoansResult,
      rejectedLoansResult,
      pendingWithdrawalsResult,
      depositsResult,
      withdrawalsResult,
    ] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).gte('created_at', dateGte).lte('created_at', dateLte),
      supabaseAdmin.from('users').select('id').gte('created_at', dateGte).lte('created_at', dateLte),
      supabaseAdmin.from('loan_applications').select('user_id'),
      supabaseAdmin.from('loan_applications').select('id', { count: 'exact', head: true }).eq('status', 'under_review').gte('created_at', dateGte).lte('created_at', dateLte),
      supabaseAdmin.from('loan_applications').select('id', { count: 'exact', head: true }).eq('status', 'approved').gte('created_at', dateGte).lte('created_at', dateLte),
      supabaseAdmin.from('loan_applications').select('id', { count: 'exact', head: true }).eq('status', 'rejected').gte('created_at', dateGte).lte('created_at', dateLte),
      supabaseAdmin.from('transactions').select('id').eq('type', 'withdrawal').is('otp_code', null).gte('created_at', dateGte).lte('created_at', dateLte),
      supabaseAdmin.from('transactions').select('amount').or('type.eq.deposit,type.eq.manual_deposit').lt('amount', 100000).gte('created_at', dateGte).lte('created_at', dateLte),
      supabaseAdmin.from('transactions').select('amount').eq('type', 'withdrawal').gte('created_at', dateGte).lte('created_at', dateLte),
    ]);

    const newUsersCount = newUsersResult.count ?? 0;
    const allUsers = allUsersResult.data || [];
    const usersWithLoansSet = new Set((usersWithLoansResult.data || []).map((l: { user_id: number }) => l.user_id));
    const newApplicants = allUsers.filter((u: { id: number }) => !usersWithLoansSet.has(u.id)).length;
    const pendingLoansCount = pendingLoansResult.count ?? 0;
    const approvedLoansCount = approvedLoansResult.count ?? 0;
    const rejectedLoansCount = rejectedLoansResult.count ?? 0;
    const pendingWithdrawals = pendingWithdrawalsResult.data?.length ?? 0;
    const totalDeposits = (depositsResult.data || []).reduce((sum: number, d: { amount?: number }) => sum + Number(d.amount || 0), 0);
    const totalWithdrawn = (withdrawalsResult.data || []).reduce((sum: number, w: { amount?: number }) => sum + Number(w.amount || 0), 0);

    return {
      success: true,
      data: {
        newUsers: newUsersCount,
        newApplicants,
        pendingApplications: pendingLoansCount,
        approvedApplications: approvedLoansCount,
        rejectedApplications: rejectedLoansCount,
        pendingWithdrawals,
        totalDeposits,
        totalWithdrawn,
        dateRange: { start, end },
      },
    };
  } catch (error) {
    console.error('[v0] Dashboard metrics error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// User Management Functions
export async function getAllUsers(skip: number = 0, limit: number = 10, search?: string, status?: string) {
  try {
    let query = supabaseAdmin
      .from('users')
      .select('*, loan_applications(id, status, amount_requested, created_at)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (search) {
      query = query.or(`phone_number.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    const rawUsers = data || [];
    const userIds = rawUsers.map((u: any) => u.id);
    const latestWalletNotes = await getLatestWalletNotesForUserIds(userIds);

    const users = rawUsers.map((user: any) => {
      const activeLoans = user.loan_applications?.filter((l: any) => l.status === 'approved') || [];

      let displayArea = 'Unknown';
      let displayIP = 'N/A';

      if (user.last_login_location) {
        displayArea = user.last_login_location;
        displayIP = user.last_login_ip || user.ip_address || 'N/A';
      } else if (user.city || user.country) {
        const parts = [];
        if (user.city) parts.push(user.city);
        if (user.country) parts.push(user.country);
        displayArea = parts.join(', ') + (user.ip_address ? `, IP: ${user.ip_address}` : '');
        displayIP = user.ip_address || 'N/A';
      } else if (user.ip_address) {
        displayArea = `Unknown, IP: ${user.ip_address}`;
        displayIP = user.ip_address;
      }

      const note = latestWalletNotes[user.id] ?? user.notes ?? null;

      return {
        id: user.id,
        name: user.full_name,
        username: user.phone_number,
        score: user.credit_score || 500,
        wallet: user.wallet_balance || 0,
        withdrawalCode: user.withdrawal_otp || null,
        registrationDate: user.created_at,
        status: user.is_banned ? 'disabled' : 'active',
        registrationArea: displayArea,
        ipAddress: displayIP,
        note,
      };
    });

    return { success: true, data: users, total: count || 0 };
  } catch (error) {
    console.error('[v0] Get all users error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function banUser(userId: number) {
  try {
    // Update user status to banned - requires is_banned column in users table
    // For now, we'll store this as a transaction note
    const { error } = await supabaseAdmin
      .from('users')
      .update({ is_banned: true })
      .eq('id', userId);

    if (error) throw error;

    console.log('[v0] User banned:', userId);
    return { success: true, message: 'User banned successfully' };
  } catch (error) {
    console.error('[v0] Ban user error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function unbanUser(userId: number) {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ is_banned: false })
      .eq('id', userId);

    if (error) throw error;

    console.log('[v0] User unbanned:', userId);
    return { success: true, message: 'User unbanned successfully' };
  } catch (error) {
    console.error('[v0] Unban user error:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Single source of truth for updating a user's login password.
 * Used by admin (User Management > Password and reset_password API).
 * Trims password, hashes with bcrypt (same as registration), updates DB, then verifies
 * so that login will work with the new password.
 */
export async function updateUserPassword(userId: number, newPassword: string): Promise<{ success: true; message: string } | { success: false; error: string }> {
  const plain = typeof newPassword === 'string' ? newPassword.trim() : '';
  if (!plain || plain.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }
  const hashedPassword = await bcrypt.hash(plain, 10);

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ password_hash: hashedPassword })
    .eq('id', userId);

  if (updateError) {
    console.error('[v0] updateUserPassword DB error:', updateError);
    return { success: false, error: `Update failed: ${updateError.message}` };
  }

  const { data: row, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('id, password_hash, phone_number')
    .eq('id', userId)
    .single();

  if (fetchError || !row?.password_hash) {
    console.error('[v0] updateUserPassword verify fetch failed:', fetchError);
    return { success: false, error: 'Password was set but could not verify. Please try again.' };
  }

  const verified = await bcrypt.compare(plain, row.password_hash);
  if (!verified) {
    console.error('[v0] updateUserPassword verify compare failed for userId:', userId);
    return { success: false, error: 'Password was set but verification failed. Please try again.' };
  }

  console.log('[v0] updateUserPassword success for userId:', userId, 'phone:', row.phone_number);
  return { success: true, message: 'Password updated successfully' };
}

export async function resetUserPassword(userId: number, newPassword: string) {
  const result = await updateUserPassword(userId, newPassword);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  const { data } = await supabaseAdmin.from('users').select('id').eq('id', userId).single();
  return { success: true, message: result.message, data: data ?? undefined };
}

export async function updateWithdrawalOTP(userId: number, otp: string) {
  try {
    const { error } = await supabaseAdmin
      .from('transactions')
      .update({ otp_code: otp })
      .eq('user_id', userId)
      .eq('type', 'withdrawal')
      .is('otp_code', null)
      .limit(1);

    if (error) throw error;

    console.log('[v0] Withdrawal OTP updated for user:', userId);
    return { success: true, message: 'OTP updated successfully' };
  } catch (error) {
    console.error('[v0] Update OTP error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateBankDetails(userId: number, bankDetails: any) {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ bank_details: bankDetails })
      .eq('id', userId);

    if (error) throw error;

    console.log('[v0] Bank details updated for user:', userId);
    return { success: true, message: 'Bank details updated successfully' };
  } catch (error) {
    console.error('[v0] Update bank details error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updatePersonalInfo(userId: number, personalInfo: any) {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ 
        full_name: personalInfo.full_name || undefined,
        phone_number: personalInfo.phone_number || undefined,
      })
      .eq('id', userId);

    if (error) throw error;

    console.log('[v0] Personal info updated for user:', userId);
    return { success: true, message: 'Personal information updated successfully' };
  } catch (error) {
    console.error('[v0] Update personal info error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getUserVerificationDetails(userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('personal_info_completed, kyc_completed, signature_completed, id')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const { data: loanApp } = await supabaseAdmin
      .from('loan_applications')
      .select('kyc_front_url, kyc_back_url, selfie_url, signature_url, personal_info')
      .eq('user_id', userId)
      .single();

    return {
      success: true,
      data: {
        ...data,
        documents: {
          kyc_front: loanApp?.kyc_front_url,
          kyc_back: loanApp?.kyc_back_url,
          selfie: loanApp?.selfie_url,
          signature: loanApp?.signature_url,
        },
      },
    };
  } catch (error) {
    console.error('[v0] Get verification details error:', error);
    return { success: false, error: (error as Error).message };
  }
}

/** Format a single wallet modification record for display in notes */
function formatWalletNote(row: { admin_username?: string | null; old_balance?: number | null; new_balance?: number | null; created_at?: string | null }): string {
  const admin = row.admin_username?.trim() || 'Unknown administrator';
  const oldVal = row.old_balance != null ? Number(row.old_balance).toLocaleString('en-PH') : '0';
  const newVal = row.new_balance != null ? Number(row.new_balance).toLocaleString('en-PH') : '0';
  const date = row.created_at ? new Date(row.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  return `Administrator username "${admin}" changed the balance from ${oldVal} to ${newVal} on ${date}.`;
}

/** Fetch full wallet modification history for a user (for notes section) */
export async function getWalletModificationHistory(userId: number, limit: number = 50) {
  try {
    const { data, error } = await supabaseAdmin
      .from('wallet_modification_history')
      .select('id, admin_username, admin_id, old_balance, new_balance, amount_changed, reason, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[v0] getWalletModificationHistory error:', err);
    return { success: false, data: [] as any[], error: (err as Error).message };
  }
}

/** Fetch latest wallet note per user (for user list note column) */
export async function getLatestWalletNotesForUserIds(userIds: number[]): Promise<Record<number, string>> {
  if (userIds.length === 0) return {};
  try {
    const { data, error } = await supabaseAdmin
      .from('wallet_modification_history')
      .select('user_id, admin_username, old_balance, new_balance, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const out: Record<number, string> = {};
    for (const row of data || []) {
      const uid = row.user_id as number;
      if (uid != null && out[uid] === undefined) out[uid] = formatWalletNote(row);
    }
    return out;
  } catch (err) {
    console.error('[v0] getLatestWalletNotesForUserIds error:', err);
    return {};
  }
}

// ---- Manual deposits (fund management) ----

/** Find user by phone number or loan document number for manual deposit */
export async function findUserByPhoneOrDocumentForDeposit(search: string) {
  const trimmed = (search || '').trim();
  if (!trimmed) return { success: false, error: 'Search is required', data: null };

  try {
    const isLikelyDocument = /^[A-Za-z0-9\-_]+$/.test(trimmed) && (trimmed.length >= 6 || /\d{4,}/.test(trimmed));
    if (isLikelyDocument) {
      const { data: app, error: appErr } = await supabaseAdmin
        .from('loan_applications')
        .select('user_id, document_number')
        .eq('document_number', trimmed)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!appErr && app?.user_id) {
        const { data: user, error: userErr } = await supabaseAdmin
          .from('users')
          .select('id, full_name, phone_number, wallet_balance')
          .eq('id', app.user_id)
          .single();
        if (!userErr && user) {
          return {
            success: true,
            data: {
              id: user.id,
              full_name: user.full_name,
              phone_number: user.phone_number,
              wallet_balance: Number(user.wallet_balance || 0),
              document_number: app.document_number,
            },
          };
        }
      }
    }

    const phoneVariants = normalizePhoneForLookup(trimmed);
    const orClause = phoneVariants.map((v) => `phone_number.eq.${v}`).join(',');
    const { data: userByVariant, error: variantErr } = await supabaseAdmin
      .from('users')
      .select('id, full_name, phone_number, wallet_balance')
      .or(orClause)
      .limit(1)
      .maybeSingle();
    if (!variantErr && userByVariant) {
      const { data: app } = await supabaseAdmin
        .from('loan_applications')
        .select('document_number')
        .eq('user_id', userByVariant.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return {
        success: true,
        data: {
          id: userByVariant.id,
          full_name: userByVariant.full_name,
          phone_number: userByVariant.phone_number,
          wallet_balance: Number(userByVariant.wallet_balance || 0),
          document_number: app?.document_number || null,
        },
      };
    }

    const { data: userByPhone, error: phoneError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, phone_number, wallet_balance')
      .ilike('phone_number', `%${trimmed}%`)
      .limit(1)
      .maybeSingle();
    if (!phoneError && userByPhone) {
      const { data: app } = await supabaseAdmin
        .from('loan_applications')
        .select('document_number')
        .eq('user_id', userByPhone.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return {
        success: true,
        data: {
          id: userByPhone.id,
          full_name: userByPhone.full_name,
          phone_number: userByPhone.phone_number,
          wallet_balance: Number(userByPhone.wallet_balance || 0),
          document_number: app?.document_number || null,
        },
      };
    }

    return { success: false, error: 'User not found', data: null };
  } catch (err) {
    console.error('[v0] findUserByPhoneOrDocumentForDeposit error:', err);
    return { success: false, error: (err as Error).message, data: null };
  }
}

/** Create manual deposit: add amount to user wallet and record in manual_deposits + wallet_modification_history */
export async function createManualDeposit(
  userId: number,
  amount: number,
  purpose: string,
  notes: string | null,
  adminId: string | null,
  adminUsername: string
) {
  if (!userId || amount <= 0) {
    return { success: false, error: 'Invalid user or amount', data: null };
  }

  try {
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id, wallet_balance')
      .eq('id', userId)
      .single();
    if (userErr || !user) return { success: false, error: 'User not found', data: null };

    const oldBalance = Number(user.wallet_balance || 0);
    const newBalance = oldBalance + amount;

    const { error: updateErr } = await supabaseAdmin
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);
    if (updateErr) return { success: false, error: 'Failed to update wallet', data: null };

    const { data: depositRow, error: insertErr } = await supabaseAdmin
      .from('manual_deposits')
      .insert({
        user_id: userId,
        amount,
        purpose: purpose || 'Manual deposit',
        notes: notes || null,
        admin_id: adminId ? parseInt(adminId, 10) : null,
        admin_username: adminUsername,
      })
      .select('id, user_id, amount, purpose, notes, admin_username, created_at')
      .single();
    if (insertErr) {
      await supabaseAdmin.from('users').update({ wallet_balance: oldBalance }).eq('id', userId);
      return { success: false, error: 'Failed to save deposit record', data: null };
    }

    const reason = purpose + (notes ? ` – ${notes}` : '');
    const { error: historyErr } = await supabaseAdmin.from('wallet_modification_history').insert({
      user_id: userId,
      admin_id: adminId ? parseInt(adminId, 10) : null,
      admin_username: adminUsername,
      old_balance: oldBalance,
      new_balance: newBalance,
      amount_changed: amount,
      reason,
    });
    if (historyErr) console.error('[v0] createManualDeposit: wallet_modification_history insert failed', historyErr);

    await supabaseAdmin.from('users').update({ notes: reason }).eq('id', userId);

    const desc = notes ? `${purpose} – ${notes}` : purpose;
    const { error: transErr } = await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      type: 'manual_deposit',
      amount,
      description: `Manual deposit by ${adminUsername}: ${desc}`,
    });
    if (transErr) {
      console.error('[v0] createManualDeposit: transactions insert failed', transErr);
    }

    return {
      success: true,
      data: { ...depositRow, new_balance: newBalance },
    };
  } catch (err) {
    console.error('[v0] createManualDeposit error:', err);
    return { success: false, error: (err as Error).message, data: null };
  }
}

/** List manual deposit records with filters and pagination */
export async function getManualDepositRecords(options: {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  const { limit = 20, offset = 0, startDate, endDate, search } = options;

  try {
    let query = supabaseAdmin
      .from('manual_deposits')
      .select(
        'id, user_id, amount, purpose, notes, admin_id, admin_username, created_at, user:users(id, full_name, phone_number)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00`);
    }
    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59`);
    }
    if (search?.trim()) {
      const q = search.trim();
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id')
        .or(`phone_number.ilike.%${q}%,full_name.ilike.%${q}%`);
      const ids = (users || []).map((u: { id: number }) => u.id);
      if (ids.length) query = query.in('user_id', ids);
      else query = query.eq('user_id', -1);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return { success: true, data: data || [], total: count ?? 0 };
  } catch (err) {
    console.error('[v0] getManualDepositRecords error:', err);
    return { success: false, data: [], total: 0, error: (err as Error).message };
  }
}

export async function getUserActivityHistory(userId: number, limit: number = 20) {
  try {
    // Run both queries in parallel for faster response
    const [transactionsResult, repaymentsResult] = await Promise.all([
      supabaseAdmin
        .from('transactions')
        .select('id, type, amount, status, description, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabaseAdmin
        .from('repayment_records')
        .select('id, amount, payment_date, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);

    if (transactionsResult.error) throw transactionsResult.error;
    if (repaymentsResult.error) throw repaymentsResult.error;

    return {
      success: true,
      data: {
        transactions: transactionsResult.data || [],
        repayments: repaymentsResult.data || [],
      },
    };
  } catch (error) {
    console.error('[v0] Get activity history error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Get single user with full details
export async function getUserDetailsById(userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[v0] Get user by ID error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Alias for backwards compatibility
export const getUserById = getUserDetailsById;

// Get user's loan applications
export async function getUserLoans(userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('loan_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[v0] Get user loans error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Withdrawal Code Management
export async function updateWithdrawalCode(userId: number, withdrawalCode: string) {
  try {
    console.log('[v0] Updating withdrawal code for userId:', userId);
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ withdrawal_otp: withdrawalCode })
      .eq('id', userId)
      .select();

    if (error) throw error;
    
    console.log('[v0] Withdrawal code updated successfully');
    return { success: true, data: data?.[0] };
  } catch (error) {
    console.error('[v0] updateWithdrawalCode error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Withdrawal Eligibility Check
export async function checkWithdrawalEligibility(userId: number) {
  try {
    console.log('[v0] Checking withdrawal eligibility for userId:', userId);
    
    // Get user data with loan info
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, wallet_balance, withdrawal_otp')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    if (!userData) throw new Error('User not found');
    
    // Get active loan data
    const { data: loanData, error: loanError } = await supabaseAdmin
      .from('loans')
      .select('id, status_color, document_number, status')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (loanError && loanError.code !== 'PGRST116') throw loanError; // PGRST116 = no rows returned
    
    const reasons = [];
    let eligible = true;
    
    // Check if user has balance > 0
    if (!userData.wallet_balance || userData.wallet_balance <= 0) {
      reasons.push('Insufficient balance');
      eligible = false;
    }
    
    // Check if loan status color is green (#22C55E)
    if (!loanData || loanData.status_color !== '#22C55E') {
      reasons.push('Loan status must be green to withdraw');
      eligible = false;
    }
    
    // Check if withdrawal code is set
    if (!userData.withdrawal_otp) {
      reasons.push('Withdrawal code not configured');
      eligible = false;
    }
    
    return {
      success: true,
      data: {
        eligible,
        reasons,
        userData: {
          wallet_balance: userData.wallet_balance,
          withdrawal_code: userData.withdrawal_otp,
          loan_status_color: loanData?.status_color,
          loan_document_number: loanData?.document_number
        }
      }
    };
  } catch (error) {
    console.error('[v0] checkWithdrawalEligibility error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Create Withdrawal Request
export async function createWithdrawalRequest(params: {
  user_id: number;
  amount: number;
  withdrawal_code: string;
  order_number: string;
  status: string;
  currency: string;
}) {
  try {
    console.log('[v0] Creating withdrawal request:', params);
    
    // Generate withdrawal number
    const withdrawNumber = `WD-${Date.now()}-${params.user_id}`;
    
    // Insert into withdrawals table
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .insert([
        {
          user_id: params.user_id,
          amount: params.amount,
          withdrawal_code: params.withdrawal_code,
          withdraw_number: withdrawNumber,
          status: params.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select();
    
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to create withdrawal request');
    
    console.log('[v0] Withdrawal request created:', data[0]);
    
    // Note: We do NOT deduct balance here - that happens only after admin approval
    // This maintains security and prevents accidental double-deductions
    
    return {
      success: true,
      data: {
        withdrawal_id: data[0].id,
        withdraw_number: withdrawNumber,
        status: params.status,
      }
    };
  } catch (error) {
    console.error('[v0] createWithdrawalRequest error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Get Available and Withdrawal Balances
export async function getBalanceBreakdown(userId: number) {
  try {
    console.log('[v0] Getting balance breakdown for userId:', userId);
    
    // Get total wallet balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    const totalBalance = userData?.wallet_balance || 0;
    
    // Get sum of pending withdrawals
    const { data: pendingWithdrawals, error: withdrawError } = await supabase
      .from('withdrawals')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'Pending');
    
    if (withdrawError) throw withdrawError;
    
    const withdrawalBalance = pendingWithdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;
    const availableBalance = totalBalance - withdrawalBalance;
    
    console.log('[v0] Balance breakdown:', { totalBalance, availableBalance, withdrawalBalance });
    
    return {
      success: true,
      data: {
        total_balance: totalBalance,
        available_balance: Math.max(0, availableBalance), // Never go below 0
        withdrawal_balance: withdrawalBalance,
        currency: 'PHP'
      }
    };
  } catch (error) {
    console.error('[v0] getBalanceBreakdown error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Update wallet balance after admin rejection (return to available)
export async function returnWithdrawalBalance(withdrawalId: number, amount: number, userId: number) {
  try {
    console.log('[v0] Returning withdrawal balance:', { withdrawalId, amount, userId });
    
    // Get current balance
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Add back to available balance
    const newBalance = (userData?.wallet_balance || 0) + amount;
    
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId)
      .select();
    
    if (updateError) throw updateError;
    
    console.log('[v0] Balance returned successfully');
    return { success: true, data: updateData?.[0] };
  } catch (error) {
    console.error('[v0] returnWithdrawalBalance error:', error);
    return { success: false, error: (error as Error).message };
  }
}
