#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Use absolute paths starting from root
const basePath = process.cwd();

const files = [
  'app/about/page.tsx',
  'app/admin/documents/loan-list-table/page.tsx',
  'app/admin/documents/repayment-schedule/page.tsx',
  'app/admin/funds/loading.tsx',
  'app/api/documents/loan-approval-letter/route.ts',
  'app/api/documents/loan-list-table/route.ts',
  'app/api/documents/repayment-schedule/route.ts',
  'app/application-complete/page.tsx',
  'app/faq/page.tsx',
  'app/home/page.tsx',
  'app/kyc-upload/page.tsx',
  'app/loan-application/page.tsx',
  'app/my-account/about-us/page.tsx',
  'app/my-account/account-management/page.tsx',
  'app/my-account/loan-contract/page.tsx',
  'app/my-account/page.tsx',
  'app/my-account/privacy-policy/page.tsx',
  'app/my-account/support/page.tsx',
  'app/my-account/terms/page.tsx',
  'app/page.tsx',
  'app/personal-information/page.tsx',
  'app/privacy/page.tsx',
  'app/signature/page.tsx',
  'app/terms/page.tsx',
  'app/wallet/page.tsx',
  'components/admin-sidebar.tsx',
  'components/checking-data-modal.tsx',
  'components/confirm-withdrawal-modal.tsx',
  'components/documents/loan-approval-letter-template.tsx',
  'components/documents/loan-list-table-template.tsx',
  'components/documents/repayment-schedule-template.tsx',
  'components/modals/export-preview-modal.tsx',
  'components/modify-loan-modal.tsx',
  'components/review-loan-modal.tsx',
  'components/view-contract-modal.tsx',
  'components/withdrawal-table.tsx'
];

let updated = 0;

files.forEach(file => {
  const filePath = path.join(basePath, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Replace colors
    content = content.replace(/#0056B3/g, '#0038A8');
    content = content.replace(/#00A86B/g, '#CE1126');
    content = content.replace(/#004494/g, '#002c86');
    content = content.replace(/#00965A/g, '#b80f20');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ ${file}`);
      updated++;
    }
  } catch (error) {
    console.error(`✗ ${file}: ${error.message}`);
  }
});

console.log(`\n✅ Updated ${updated} files with Philippine flag colors!`);
