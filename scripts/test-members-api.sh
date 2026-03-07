#!/bin/bash

# Test script for the PATCH /api/members/{id} endpoint
# This helps debug API issues

BASE_URL="http://localhost:3000"
MEMBER_ID="3"

echo "Testing PATCH /api/members/{id} endpoint..."
echo ""

# Test 1: Update wallet
echo "1. Testing wallet update..."
curl -X PATCH "$BASE_URL/api/members/$MEMBER_ID" \
  -H "Content-Type: application/json" \
  -d '{"action": "wallet", "amount": 200000}' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "---"
echo ""

# Test 2: Update credit score
echo "2. Testing credit score update..."
curl -X PATCH "$BASE_URL/api/members/$MEMBER_ID" \
  -H "Content-Type: application/json" \
  -d '{"action": "score", "score": 600}' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "---"
echo ""

# Test 3: Update withdrawal code
echo "3. Testing withdrawal code update..."
curl -X PATCH "$BASE_URL/api/members/$MEMBER_ID" \
  -H "Content-Type: application/json" \
  -d '{"action": "withdrawal-code", "code": "ABC123"}' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "---"
echo ""

# Test 4: Update status (disable)
echo "4. Testing status update (disable)..."
curl -X PATCH "$BASE_URL/api/members/$MEMBER_ID" \
  -H "Content-Type: application/json" \
  -d '{"action": "status", "status": "disabled"}' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "All tests completed!"
