// Test KYC Verification Flow
// Run this with: node test-kyc-flow.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(status, message) {
  const icon = status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'info' ? '📋' : '⏳';
  const color = status === 'success' ? colors.green : status === 'error' ? colors.red : status === 'info' ? colors.blue : colors.yellow;
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

// Test 1: Register/Login a test user
async function testAuth() {
  try {
    log('pending', 'Test 1: Testing Authentication...');
    
    const testUser = {
      name: 'KYC Test User',
      email: `kyctest${Date.now()}@test.com`,
      password: 'TestPassword123!',
      country: 'IN'
    };

    // Register
    try {
      const registerResponse = await axios.post(`${API_URL}/register`, testUser);
      authToken = registerResponse.data.token;
      userId = registerResponse.data.user.id;
      log('success', `User registered: ${testUser.email}`);
    } catch (error) {
      if (error.response?.status === 400) {
        // User might exist, try login
        const loginResponse = await axios.post(`${API_URL}/login`, {
          email: testUser.email,
          password: testUser.password
        });
        authToken = loginResponse.data.token;
        userId = loginResponse.data.user.id;
        log('success', `User logged in: ${testUser.email}`);
      } else {
        throw error;
      }
    }

    log('success', `Auth Token obtained: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    log('error', `Authentication failed: ${error.message}`);
    return false;
  }
}

// Test 2: Create KYC Record
async function testCreateKyc() {
  try {
    log('pending', 'Test 2: Creating KYC Record...');
    
    const response = await axios.post(
      `${API_URL}/kyc/create`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      log('success', `KYC Record created with ID: ${response.data.data.id}`);
      log('info', `Initial Status: ${response.data.data.verificationStatus}`);
      log('info', `Document Verified: ${response.data.data.isDocumentVerified}`);
      log('info', `Address Verified: ${response.data.data.isAddressVerified}`);
      return true;
    }
    return false;
  } catch (error) {
    log('error', `Create KYC failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 3: Update Document Status (Simulate document verification success)
async function testUpdateDocument() {
  try {
    log('pending', 'Test 3: Updating Document Verification Status...');
    
    const response = await axios.put(
      `${API_URL}/kyc/update-document`,
      {
        documentReference: 'TEST-DOC-REF-' + Date.now(),
        isDocumentVerified: true,
        amlReference: 'TEST-AML-REF-' + Date.now()
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      log('success', 'Document verification status updated');
      log('info', `New Status: ${response.data.data.verificationStatus}`);
      log('info', `Document Reference: ${response.data.data.documentReference}`);
      log('info', `AML Reference: ${response.data.data.amlReference}`);
      log('info', `Submitted At: ${response.data.data.documentSubmittedAt}`);
      return true;
    }
    return false;
  } catch (error) {
    log('error', `Update Document failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 4: Get KYC Status
async function testGetStatus() {
  try {
    log('pending', 'Test 4: Fetching KYC Status...');
    
    const response = await axios.get(
      `${API_URL}/kyc/status`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      log('success', 'KYC Status retrieved successfully');
      const kyc = response.data.data;
      console.log('\n📊 Current KYC Status:');
      console.log(`   ID: ${kyc.id}`);
      console.log(`   Verification Status: ${kyc.verificationStatus}`);
      console.log(`   Document Verified: ${kyc.isDocumentVerified}`);
      console.log(`   Address Verified: ${kyc.isAddressVerified}`);
      console.log(`   Document Reference: ${kyc.documentReference || 'N/A'}`);
      console.log(`   Address Reference: ${kyc.addressReference || 'N/A'}`);
      console.log(`   AML Reference: ${kyc.amlReference || 'N/A'}`);
      console.log(`   Created At: ${kyc.createdAt}`);
      console.log(`   Updated At: ${kyc.updatedAt}\n`);
      return true;
    }
    return false;
  } catch (error) {
    log('error', `Get Status failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 5: Update Address Status (Simulate address verification success)
async function testUpdateAddress() {
  try {
    log('pending', 'Test 5: Updating Address Verification Status...');
    
    const response = await axios.put(
      `${API_URL}/kyc/update-address`,
      {
        addressReference: 'TEST-ADDR-REF-' + Date.now(),
        isAddressVerified: true
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      log('success', 'Address verification status updated');
      log('info', `New Status: ${response.data.data.verificationStatus}`);
      log('info', `Address Reference: ${response.data.data.addressReference}`);
      log('info', `Submitted At: ${response.data.data.addressSubmittedAt}`);
      
      if (response.data.data.verificationStatus === 'Verified') {
        log('success', '🎉 FULL KYC VERIFICATION COMPLETE!');
      }
      return true;
    }
    return false;
  } catch (error) {
    log('error', `Update Address failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 6: Final Status Check
async function testFinalStatus() {
  try {
    log('pending', 'Test 6: Final Status Verification...');
    
    const response = await axios.get(
      `${API_URL}/kyc/status`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      const kyc = response.data.data;
      console.log('\n🎯 Final KYC Status Report:');
      console.log('═'.repeat(50));
      console.log(`   User ID: ${userId}`);
      console.log(`   KYC ID: ${kyc.id}`);
      console.log(`   Overall Status: ${colors.green}${kyc.verificationStatus}${colors.reset}`);
      console.log(`   Document Verified: ${kyc.isDocumentVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Address Verified: ${kyc.isAddressVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Document Reference: ${kyc.documentReference}`);
      console.log(`   Address Reference: ${kyc.addressReference}`);
      console.log(`   AML Reference: ${kyc.amlReference}`);
      console.log('═'.repeat(50));
      
      // Verify expected state
      if (kyc.verificationStatus === 'Verified' && 
          kyc.isDocumentVerified === true && 
          kyc.isAddressVerified === true) {
        log('success', 'All verification checks passed! ✨');
        return true;
      } else {
        log('error', 'Verification state mismatch!');
        return false;
      }
    }
    return false;
  } catch (error) {
    log('error', `Final Status Check failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 7: Test Declined Scenario
async function testDeclinedScenario() {
  try {
    log('pending', 'Test 7: Testing Declined Scenario...');
    
    // Create new user for decline test
    const testUser = {
      name: 'KYC Decline Test',
      email: `kycdecline${Date.now()}@test.com`,
      password: 'TestPassword123!',
      country: 'IN'
    };

    const registerResponse = await axios.post(`${API_URL}/register`, testUser);
    const declineToken = registerResponse.data.token;

    // Create KYC
    await axios.post(
      `${API_URL}/kyc/create`,
      {},
      { headers: { Authorization: `Bearer ${declineToken}` } }
    );

    // Update with declined document
    const response = await axios.put(
      `${API_URL}/kyc/update-document`,
      {
        documentReference: 'TEST-DECLINED-' + Date.now(),
        isDocumentVerified: false, // DECLINED
        amlReference: null
      },
      { headers: { Authorization: `Bearer ${declineToken}` } }
    );

    if (response.data.data.verificationStatus === 'Declined') {
      log('success', 'Declined scenario handled correctly');
      log('info', `Status correctly set to: ${response.data.data.verificationStatus}`);
      return true;
    } else {
      log('error', `Expected 'Declined' but got: ${response.data.data.verificationStatus}`);
      return false;
    }
  } catch (error) {
    log('error', `Declined Scenario test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting KYC Verification Flow Tests\n');
  console.log('═'.repeat(50));
  
  const results = [];

  // Run tests sequentially
  results.push({ name: 'Authentication', passed: await testAuth() });
  if (!results[0].passed) {
    log('error', 'Authentication failed. Cannot continue tests.');
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  results.push({ name: 'Create KYC', passed: await testCreateKyc() });
  
  await new Promise(resolve => setTimeout(resolve, 500));
  results.push({ name: 'Update Document', passed: await testUpdateDocument() });
  
  await new Promise(resolve => setTimeout(resolve, 500));
  results.push({ name: 'Get Status', passed: await testGetStatus() });
  
  await new Promise(resolve => setTimeout(resolve, 500));
  results.push({ name: 'Update Address', passed: await testUpdateAddress() });
  
  await new Promise(resolve => setTimeout(resolve, 500));
  results.push({ name: 'Final Status', passed: await testFinalStatus() });
  
  await new Promise(resolve => setTimeout(resolve, 500));
  results.push({ name: 'Declined Scenario', passed: await testDeclinedScenario() });

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('═'.repeat(50));
  
  results.forEach(result => {
    const status = result.passed ? `${colors.green}✅ PASSED${colors.reset}` : `${colors.red}❌ FAILED${colors.reset}`;
    console.log(`   ${result.name.padEnd(25)} ${status}`);
  });
  
  const totalPassed = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log('═'.repeat(50));
  console.log(`\n   Total: ${totalPassed}/${totalTests} tests passed`);
  
  if (totalPassed === totalTests) {
    log('success', '🎉 ALL TESTS PASSED! KYC System is fully operational!');
  } else {
    log('error', `${totalTests - totalPassed} test(s) failed. Please review errors above.`);
  }
  
  console.log('\n');
}

// Check server connection first
async function checkServer() {
  try {
    await axios.get('http://localhost:5000/');
    log('success', 'Server is running at http://localhost:5000');
    return true;
  } catch (error) {
    log('error', 'Server is not running. Please start the server with: cd server && npm run dev');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
})();

