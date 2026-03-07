#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = [
  'app/about/page.tsx',
  'app/admin/dashboard/page.tsx',
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

// Color replacements
const colorReplacements = [
  { old: '#0056B3', new: '#0038A8' },
  { old: '#00A86B', new: '#CE1126' },
  { old: '#004494', new: '#002c86' },
  { old: '#00965A', new: '#b80f20' }
];

let filesUpdated = 0;
let filesNotFound = 0;

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`✗ File not found: ${file}`);
      filesNotFound++;
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    colorReplacements.forEach(({ old, new: newColor }) => {
      if (content.includes(old)) {
        content = content.replace(new RegExp(old.replace(/[#]/g, '\\#'), 'g'), newColor);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${file}`);
      filesUpdated++;
    }
  } catch (error) {
    console.log(`✗ Error processing ${file}: ${error.message}`);
    filesNotFound++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`Files updated: ${filesUpdated}`);
console.log(`Files skipped/not found: ${filesNotFound}`);
console.log(`Total files processed: ${filesToUpdate.length}`);
