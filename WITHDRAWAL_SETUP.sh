#!/bin/bash
# Withdrawal List System - Setup and Testing Script
# This script provides quick commands to set up and test the withdrawal system

echo "================================"
echo "Withdrawal List System - Setup"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database Setup
echo -e "${YELLOW}Step 1: Create Withdrawal Tables${NC}"
echo "Run this command to create the database schema:"
echo "  npm run db:execute scripts/create-withdrawals-table.sql"
echo ""

# Verify Database
echo -e "${YELLOW}Step 2: Verify Database Created${NC}"
echo "Check if tables created successfully:"
echo "  SELECT * FROM withdrawals LIMIT 1;"
echo ""

# Add Sample Data
echo -e "${YELLOW}Step 3: Add Sample Data (Optional)${NC}"
echo "Insert test data for development:"
echo "  npm run db:execute scripts/sample-withdrawals.sql"
echo ""

# Start Application
echo -e "${YELLOW}Step 4: Start Application${NC}"
echo "Run the development server:"
echo "  npm run dev"
echo ""
echo "Application will be available at: http://localhost:3000"
echo ""

# Access Withdrawal List
echo -e "${YELLOW}Step 5: Access Withdrawal List${NC}"
echo "Navigate to: http://localhost:3000/admin/funds"
echo "You need to be logged in as admin"
echo ""

# Test API Endpoints
echo -e "${YELLOW}Testing API Endpoints${NC}"
echo ""
echo "1. List withdrawals:"
echo '   curl "http://localhost:3000/api/admin/withdrawals"'
echo ""
echo "2. List withdrawals with filters:"
echo '   curl "http://localhost:3000/api/admin/withdrawals?status=Pending&limit=10"'
echo ""
echo "3. Get withdrawal details:"
echo '   curl "http://localhost:3000/api/admin/withdrawals/1"'
echo ""
echo "4. Create withdrawal (POST):"
echo '   curl -X POST "http://localhost:3000/api/admin/withdrawals" \'
echo '     -H "Content-Type: application/json" \'
echo '     -d "{\"userId\": 1, \"amount\": 50000, \"bankName\": \"Test Bank\", \"accountNumber\": \"1234567890\", \"accountName\": \"Test User\"}"'
echo ""
echo "5. Confirm withdrawal (PATCH):"
echo '   curl -X PATCH "http://localhost:3000/api/admin/withdrawals/1" \'
echo '     -H "Content-Type: application/json" \'
echo '     -d "{\"action\": \"confirm\", \"withdrawalCode\": \"CODE123\", \"adminId\": 1}"'
echo ""
echo "6. Delete withdrawal (DELETE):"
echo '   curl -X DELETE "http://localhost:3000/api/admin/withdrawals/1"'
echo ""

# Testing Checklist
echo -e "${YELLOW}Frontend Testing Checklist${NC}"
echo ""
echo "Page Load:"
echo "  [ ] Withdrawal List page loads without errors"
echo "  [ ] Header shows 'Withdrawal List' title"
echo "  [ ] Sidebar shows 'Fund Management' as active"
echo ""
echo "Table Display:"
echo "  [ ] All 9 columns visible"
echo "  [ ] Withdrawal numbers display correctly"
echo "  [ ] Amounts formatted as numbers (no currency)"
echo "  [ ] Dates in DD/MM/YYYY HH:mm format"
echo "  [ ] Status badges show correct colors"
echo ""
echo "Filtering:"
echo "  [ ] Date range picker works"
echo "  [ ] Status dropdown filters data"
echo "  [ ] Search by name works"
echo "  [ ] Search by number works"
echo "  [ ] Refresh button reloads data"
echo ""
echo "Actions:"
echo "  [ ] Checking Data button opens modal"
echo "  [ ] Modal shows member information"
echo "  [ ] Confirm Withdrawal opens confirmation"
echo "  [ ] Delete button shows confirmation"
echo "  [ ] Confirm successful deducts wallet"
echo ""
echo "Modals:"
echo "  [ ] Member details modal displays correctly"
echo "  [ ] Confirmation modal shows withdrawal details"
echo "  [ ] Withdrawal code field appears when needed"
echo "  [ ] Error messages display properly"
echo "  [ ] Close buttons work"
echo ""
echo "Data Persistence:"
echo "  [ ] Status updates persist after refresh"
echo "  [ ] Wallet balance updates correctly"
echo "  [ ] Admin ID recorded in database"
echo "  [ ] Timestamps are accurate"
echo ""

# Troubleshooting
echo -e "${YELLOW}Troubleshooting${NC}"
echo ""
echo "If you encounter issues:"
echo ""
echo "1. Database connection error:"
echo "   - Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
echo "   - Verify database is accessible"
echo ""
echo "2. API endpoint returns 404:"
echo "   - Verify withdrawals table exists"
echo "   - Check API route files are in correct location"
echo ""
echo "3. Modal won't open:"
echo "   - Check browser console for errors"
echo "   - Verify React is properly loaded"
echo ""
echo "4. Wallet not updating:"
echo "   - Check admin_id in localStorage"
echo "   - Verify user has sufficient balance"
echo ""

# File Structure
echo -e "${YELLOW}File Structure${NC}"
echo ""
echo "Database:"
echo "  ✓ /scripts/create-withdrawals-table.sql"
echo "  ✓ /scripts/sample-withdrawals.sql"
echo ""
echo "API Routes:"
echo "  ✓ /app/api/admin/withdrawals/route.ts"
echo "  ✓ /app/api/admin/withdrawals/[id]/route.ts"
echo ""
echo "Frontend:"
echo "  ✓ /app/admin/funds/page.tsx"
echo "  ✓ /components/withdrawal-table.tsx"
echo "  ✓ /components/confirm-withdrawal-modal.tsx"
echo "  ✓ /components/checking-data-modal.tsx"
echo "  ✓ /components/delete-confirm-dialog.tsx"
echo ""
echo "Utilities:"
echo "  ✓ /lib/utils.ts (formatDate)"
echo "  ✓ /lib/withdrawal-utils.ts (status colors)"
echo ""
echo "Documentation:"
echo "  ✓ /WITHDRAWAL_LIST_DOCUMENTATION.md"
echo "  ✓ /WITHDRAWAL_QUICK_START.md"
echo "  ✓ /WITHDRAWAL_IMPLEMENTATION_SUMMARY.md"
echo ""

# Next Steps
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next Steps:"
echo "1. Execute the database migration"
echo "2. Start the development server"
echo "3. Log in as admin"
echo "4. Navigate to /admin/funds"
echo "5. Test the withdrawal list features"
echo ""
echo "For detailed information, see:"
echo "  - WITHDRAWAL_LIST_DOCUMENTATION.md"
echo "  - WITHDRAWAL_QUICK_START.md"
echo ""
