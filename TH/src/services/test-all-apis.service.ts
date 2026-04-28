import { testDeviceManagementAPI } from './Admin/device-management.service';
import { testBorrowRequestAPI } from './Admin/borrow-request.service';
import { testBorrowHistoryAPI } from './User/borrow-history.service';

export const testAllAPIs = async () => {
  console.log('🚀 STARTING COMPREHENSIVE API TESTING');
  console.log('==========================================');

  const results = {
    deviceManagement: null,
    borrowRequests: null,
    borrowHistory: null,
    overall: {
      success: false,
      totalTests: 3,
      passedTests: 0,
      failedTests: 0,
    },
  };

  try {
    // Test Device Management APIs
    console.log('\n1️⃣ Testing Device Management APIs...');
    results.deviceManagement = await testDeviceManagementAPI();
    if (results.deviceManagement.success) {
      results.overall.passedTests++;
      console.log('✅ Device Management APIs: PASSED');
    } else {
      results.overall.failedTests++;
      console.log('❌ Device Management APIs: FAILED');
    }

    // Test Borrow Request APIs
    console.log('\n2️⃣ Testing Borrow Request APIs...');
    results.borrowRequests = await testBorrowRequestAPI();
    if (results.borrowRequests.success) {
      results.overall.passedTests++;
      console.log('✅ Borrow Request APIs: PASSED');
    } else {
      results.overall.failedTests++;
      console.log('❌ Borrow Request APIs: FAILED');
    }

    // Test Borrow History APIs
    console.log('\n3️⃣ Testing Borrow History APIs...');
    results.borrowHistory = await testBorrowHistoryAPI();
    if (results.borrowHistory.success) {
      results.overall.passedTests++;
      console.log('✅ Borrow History APIs: PASSED');
    } else {
      results.overall.failedTests++;
      console.log('❌ Borrow History APIs: FAILED');
    }

    // Overall results
    results.overall.success = results.overall.passedTests === results.overall.totalTests;

    console.log('\n📊 FINAL TEST RESULTS');
    console.log('==========================================');
    console.log(`✅ Passed: ${results.overall.passedTests}/${results.overall.totalTests}`);
    console.log(`❌ Failed: ${results.overall.failedTests}/${results.overall.totalTests}`);
    console.log(`🎯 Success Rate: ${Math.round((results.overall.passedTests / results.overall.totalTests) * 100)}%`);

    if (results.overall.success) {
      console.log('🎉 ALL TESTS PASSED! Your APIs are ready for use.');
    } else {
      console.log('⚠️  Some tests failed. Check the details above.');
    }

    return results;

  } catch (error) {
    console.error('💥 CRITICAL ERROR during API testing:', error);
    results.overall.success = false;
    return results;
  }
};

// Quick data summary function
export const getDataSummary = async () => {
  console.log('📈 DATA SUMMARY');
  console.log('==========================================');

  try {
    const deviceTest = await testDeviceManagementAPI();
    const borrowTest = await testBorrowRequestAPI();
    const historyTest = await testBorrowHistoryAPI();

    console.log(`📱 Devices Available: ${deviceTest.devices || 0}`);
    console.log(`📋 Device Approvals: ${deviceTest.approvals || 0}`);
    console.log(`📝 Borrow Requests: ${borrowTest.totalRequests || 0}`);
    console.log(`  ├─ Pending: ${borrowTest.pendingCount || 0}`);
    console.log(`  ├─ Approved: ${borrowTest.approvedCount || 0}`);
    console.log(`  └─ Search Results: ${borrowTest.searchResults || 0}`);
    console.log(`📚 History Records: ${historyTest.totalHistory || 0}`);
    console.log(`👤 My History: ${historyTest.myHistoryCount || 0}`);

    return {
      devices: deviceTest.devices || 0,
      approvals: deviceTest.approvals || 0,
      borrowRequests: borrowTest.totalRequests || 0,
      historyRecords: historyTest.totalHistory || 0,
    };
  } catch (error) {
    console.error('Error getting data summary:', error);
    return null;
  }
};
