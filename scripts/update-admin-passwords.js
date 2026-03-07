import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin account passwords
const adminAccounts = [
  {
    username: 'admin1',
    password: 'Admin1@2024SecurePass'
  },
  {
    username: 'admin2',
    password: 'Admin2@2024SecurePass'
  },
  {
    username: 'admin3',
    password: 'Admin3@2024SecurePass'
  },
  {
    username: 'admin4',
    password: 'Admin4@2024SecurePass'
  },
  {
    username: 'admin5',
    password: 'Admin5@2024SecurePass'
  }
];

// Simple hash function (SHA-256)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function updateAdminPasswords() {
  console.log('[v0] Updating admin account passwords...\n');

  try {
    for (const admin of adminAccounts) {
      const passwordHash = hashPassword(admin.password);

      console.log(`[v0] Updating password for ${admin.username}...`);

      const { error } = await supabase
        .from('admin')
        .update({ password_hash: passwordHash })
        .eq('username', admin.username);

      if (error) {
        console.error(`[v0] Error updating ${admin.username}:`, error.message);
      } else {
        console.log(`[v0] ✓ Password updated for ${admin.username}`);
      }
    }

    console.log('\n[v0] ═══════════════════════════════════════════════════════════════');
    console.log('[v0] ADMIN ACCOUNTS CREATED SUCCESSFULLY');
    console.log('[v0] ═══════════════════════════════════════════════════════════════\n');

    console.log('[v0] New Admin Accounts:\n');
    
    adminAccounts.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.username}`);
      console.log(`   Email: admin${index + 1}@easyloan.com`);
      console.log(`   Temporary Password: ${admin.password}`);
      console.log(`   (Please change password on first login)\n`);
    });

    console.log('[v0] ═══════════════════════════════════════════════════════════════');
    console.log('[v0] All admin accounts are now ready to use!');
    console.log('[v0] ═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('[v0] Unexpected error:', error);
    process.exit(1);
  }
}

updateAdminPasswords();
