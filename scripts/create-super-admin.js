/**
 * Create one Super Admin account.
 * Run: node scripts/create-super-admin.js
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Load .env.local
try {
  const envPath = path.join(process.cwd(), '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const eq = line.indexOf('=');
    if (eq > 0) {
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) process.env[key] = val;
    }
  });
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const USERNAME = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
const EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@kabayanloan.com';
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2025';

if (!supabaseUrl || !supabaseKey) {
  console.error('[ERROR] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('[1/3] Checking if username already exists...');
  const { data: existing } = await supabase
    .from('admin')
    .select('id')
    .eq('username', USERNAME)
    .maybeSingle();

  if (existing) {
    console.log(`[SKIP] Admin "${USERNAME}" already exists. Use Administrator Management to create more.`);
    process.exit(0);
  }

  console.log('[2/3] Hashing password...');
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  console.log('[3/3] Inserting Super Admin...');
  const { data, error } = await supabase
    .from('admin')
    .insert({
      username: USERNAME,
      email: EMAIL,
      password_hash: passwordHash,
      role: 'SUPER_ADMIN',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id, username, email, role')
    .single();

  if (error) {
    console.error('[ERROR]', error.message);
    process.exit(1);
  }

  console.log('\n✅ Super Admin created successfully!\n');
  console.log('  Username:', USERNAME);
  console.log('  Email:   ', EMAIL);
  console.log('  Password:', PASSWORD);
  console.log('  Role:    ', data.role);
  console.log('\n  Log in at /admin-login and use "Administrator Management" to create more admins.\n');
}

main();
