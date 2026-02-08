#!/bin/bash

echo "Testing Cookie-Based Authentication Implementation"
echo "=================================================="
echo ""

# Test 1: Get CSRF Token
echo "Test 1: Getting CSRF Token..."
CSRF_RESPONSE=$(curl -s -c /tmp/cookies.txt http://localhost:5001/api/csrf-token)
echo "Response: $CSRF_RESPONSE"
echo ""

# Test 2: Check if server is running
echo "Test 2: Checking server status..."
SERVER_STATUS=$(curl -s http://localhost:5001/)
echo "Response: $SERVER_STATUS"
echo ""

echo "Manual Testing Instructions:"
echo "1. Login via frontend at http://localhost:3000"
echo "2. Open DevTools > Application > Cookies"
echo "3. Verify 'auth_token' cookie is set with HttpOnly flag"
echo "4. Verify 'session_id' cookie is set"
echo "5. Navigate to a protected route and verify it works"
echo "6. Logout and verify cookies are cleared"
