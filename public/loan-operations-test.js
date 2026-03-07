// Paste this in browser console to test all Loan Operations endpoints
console.log('[v0] Loan Management Test Suite - Paste in browser console');

// Test 1: Fetch all loans
async function testFetchLoans() {
  console.log('[v0] TEST 1: Fetching all loans...');
  try {
    const response = await fetch('/api/admin/loans?page=1&limit=10');
    const data = await response.json();
    console.log('[v0] Loans fetched:', data);
    
    if (data.data && data.data.length > 0) {
      console.log('[v0] First loan ID:', data.data[0].id);
      console.log('[v0] First loan order number:', data.data[0].order_number);
      return data.data[0].id;
    }
  } catch (err) {
    console.error('[v0] Error fetching loans:', err);
  }
}

// Test 2: Update loan status
async function testUpdateStatus(loanId) {
  console.log('[v0] TEST 2: Updating loan status for ID:', loanId);
  try {
    const response = await fetch(`/api/admin/loans/${loanId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'APPROVED',
        statusColor: '#10B981',
        statusDescription: 'Approved via test'
      })
    });
    
    const data = await response.json();
    console.log('[v0] Update response:', { status: response.status, data });
    
    if (!response.ok) {
      console.error('[v0] UPDATE FAILED - Response not OK');
      return false;
    }
    
    console.log('[v0] UPDATE SUCCESS');
    return true;
  } catch (err) {
    console.error('[v0] Error updating status:', err);
    return false;
  }
}

// Test 3: Fetch contract
async function testFetchContract(loanId) {
  console.log('[v0] TEST 3: Fetching contract for ID:', loanId);
  try {
    const response = await fetch(`/api/admin/loans/${loanId}/contract`);
    const data = await response.json();
    console.log('[v0] Contract response:', { status: response.status, success: data.success });
    
    if (response.ok && data.contract) {
      console.log('[v0] Contract header:', data.contract.header);
      console.log('[v0] FETCH CONTRACT SUCCESS');
      return true;
    } else {
      console.error('[v0] FETCH CONTRACT FAILED');
      return false;
    }
  } catch (err) {
    console.error('[v0] Error fetching contract:', err);
    return false;
  }
}

// Test 4: Modify loan
async function testModifyLoan(loanId) {
  console.log('[v0] TEST 4: Modifying loan for ID:', loanId);
  try {
    const response = await fetch(`/api/admin/loans/${loanId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loanAmount: 50000,
        interestRate: 0.5,
        loanPeriodMonths: 12
      })
    });
    
    const data = await response.json();
    console.log('[v0] Modify response:', { status: response.status, data });
    
    if (!response.ok) {
      console.error('[v0] MODIFY FAILED');
      return false;
    }
    
    console.log('[v0] MODIFY SUCCESS');
    return true;
  } catch (err) {
    console.error('[v0] Error modifying loan:', err);
    return false;
  }
}

// Test 5: Delete loan (create backup first!)
async function testDeleteLoan(loanId) {
  console.log('[v0] TEST 5: Deleting loan for ID:', loanId);
  try {
    const response = await fetch(`/api/admin/loans/${loanId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    console.log('[v0] Delete response:', { status: response.status, data });
    
    if (!response.ok) {
      console.error('[v0] DELETE FAILED');
      return false;
    }
    
    console.log('[v0] DELETE SUCCESS - Loan soft deleted');
    return true;
  } catch (err) {
    console.error('[v0] Error deleting loan:', err);
    return false;
  }
}

// Run all tests
(async () => {
  console.log('[v0] ===== STARTING LOAN OPERATIONS TEST SUITE =====');
  
  const loanId = await testFetchLoans();
  
  if (!loanId) {
    console.error('[v0] No loans found. Create a loan first.');
    return;
  }
  
  console.log('[v0] Testing with loan ID:', loanId);
  console.log('[v0] ');
  
  const updateSuccess = await testUpdateStatus(loanId);
  console.log('[v0] ');
  
  const contractSuccess = await testFetchContract(loanId);
  console.log('[v0] ');
  
  const modifySuccess = await testModifyLoan(loanId);
  console.log('[v0] ');
  
  console.log('[v0] ===== TEST RESULTS =====');
  console.log('[v0] Update Status:', updateSuccess ? '✓ PASS' : '✗ FAIL');
  console.log('[v0] Fetch Contract:', contractSuccess ? '✓ PASS' : '✗ FAIL');
  console.log('[v0] Modify Loan:', modifySuccess ? '✓ PASS' : '✗ FAIL');
  console.log('[v0] ===== END TEST SUITE =====');
})();
