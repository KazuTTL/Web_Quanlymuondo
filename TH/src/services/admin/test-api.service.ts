import axios from '@/utils/axios';

// Test API connectivity - theo cách device service
export const testAPIConnectivity = async () => {
  console.log('=== TESTING API CONNECTIVITY ===');

  const endpoints = [
    '/admin/devices',                           // Device management
    '/admin/borrow-requests',                   // Borrow requests
    '/admin/stats',                            // Statistics
    '/admin/auth/me',                          // Auth check
  ];

  const results: any = {};

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);

      // Test params khác nhau
      const testParams = endpoint.includes('borrow-requests') ?
        { status: 'pending', limit: 5 } :
        { limit: 5 };

      const response = await axios.get(endpoint, {
        params: testParams,
        timeout: 5000
      });

      results[endpoint] = {
        status: 'SUCCESS',
        statusCode: response.status,
        hasMessage: response.data?.message ? 'Yes' : 'No',
        message: response.data?.message,
        dataType: typeof response.data?.data || typeof response.data,
        isArray: Array.isArray(response.data?.data) || Array.isArray(response.data),
        dataLength: Array.isArray(response.data?.data) ? response.data.data.length :
                   Array.isArray(response.data) ? response.data.length : null,
        responseKeys: response.data ? Object.keys(response.data) : [],
        sampleData: Array.isArray(response.data?.data) && response.data.data.length > 0 ?
                   response.data.data[0] :
                   Array.isArray(response.data) && response.data.length > 0 ?
                   response.data[0] :
                   response.data,
      };
      console.log(`✅ ${endpoint} - SUCCESS`);
    } catch (error: any) {
      results[endpoint] = {
        status: 'ERROR',
        statusCode: error.response?.status,
        errorMessage: error.message,
        errorData: error.response?.data,
      };
      console.log(`❌ ${endpoint} - ERROR:`, error.response?.status, error.message);
    }
  }

  console.log('=== API TEST RESULTS ===');
  console.table(results);
  return results;
};

// Test borrow requests specifically với debug nested structure
export const testBorrowRequestsEndpoint = async () => {
  console.log('=== TESTING BORROW REQUESTS ENDPOINTS ===');

  const correctEndpoint = '/admin/borrow-requests';

  const testCases = [
    { params: {}, description: 'No params - get all' },
    { params: { status: 'pending' }, description: 'Pending requests only' },
    { params: { status: 'approved' }, description: 'Approved requests only' },
    { params: { status: 'rejected' }, description: 'Rejected requests only' },
    { params: { status: 'pending', limit: 5, page: 1 }, description: 'Pending with pagination' },
  ];

  const results: any = {};

  for (const testCase of testCases) {
    try {
      console.log(`Testing ${correctEndpoint} with ${testCase.description}:`, testCase.params);

      const response = await axios.get(correctEndpoint, {
        params: testCase.params,
        timeout: 5000
      });

      // Enhanced analysis for nested structure
      let dataLocation = 'N/A';
      let dataLength = 0;

      if (Array.isArray(response.data)) {
        dataLocation = 'response.data (direct array)';
        dataLength = response.data.length;
      } else if (Array.isArray(response.data?.data)) {
        dataLocation = 'response.data.data';
        dataLength = response.data.data.length;
      } else if (Array.isArray(response.data?.data?.data)) {
        dataLocation = 'response.data.data.data (nested)';
        dataLength = response.data.data.data.length;
      }

      results[testCase.description] = {
        status: 'SUCCESS',
        statusCode: response.status,
        hasMessage: response.data?.message ? 'Yes' : 'No',
        message: response.data?.message,
        dataLocation: dataLocation,
        dataLength: dataLength,
        structure: response.data ? Object.keys(response.data) : [],
        nestedStructure: response.data?.data ? Object.keys(response.data.data) : 'N/A',
        sampleData: Array.isArray(response.data?.data?.data) && response.data.data.data.length > 0 ?
                   response.data.data.data[0] :
                   Array.isArray(response.data?.data) && response.data.data.length > 0 ?
                   response.data.data[0] :
                   response.data?.data,
      };

      console.log(`✅ ${testCase.description} - SUCCESS`);
      console.log(`   Data found at: ${dataLocation}, Length: ${dataLength}`);

    } catch (error: any) {
      results[testCase.description] = {
        status: 'ERROR',
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.message,
        errorData: error.response?.data,
      };

      console.log(`❌ ${testCase.description} - ERROR:`, error.response?.status);
    }
  }

  console.log('=== BORROW REQUESTS TEST RESULTS ===');
  console.log(results);
  return results;
};

// Test authentication - theo cách device service
export const testAuth = async () => {
  console.log('=== TESTING AUTHENTICATION ===');

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  console.log('Stored token:', token ? token.substring(0, 50) + '...' : 'None');
  console.log('Stored role:', role);

  if (!token) {
    return { success: false, error: 'No token found' };
  }

  try {
    const response = await axios.get('/admin/auth/me');
    console.log('✅ Auth test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.log('❌ Auth test failed:', error.response?.status, error.message);
    return { success: false, error: error.response?.data };
  }
};

// Test và tạo data thực trong database
export const testAndCreateSampleData = async () => {
  console.log('=== TESTING AND CREATING SAMPLE DATA ===');

  try {
    // 1. Kiểm tra devices trong database
    console.log('1. Checking devices in database...');
    const devicesResponse = await axios.get('/admin/devices');
    console.log('Devices response:', devicesResponse.data);

    if (!devicesResponse.data?.data || devicesResponse.data.data.length === 0) {
      console.log('❌ No devices found in database');

      // Tạo device test trước
      console.log('Creating test device...');
      const testDevice = {
        name: 'Laptop Dell Test',
        serialNumber: 'TEST001',
        category: 'Laptop',
        location: 'Phòng test',
        quantity: 5,
        availableQuantity: 5,
        description: 'Device được tạo để test',
      };

      const deviceCreateResponse = await axios.post('/admin/devices', testDevice);
      console.log('Test device created:', deviceCreateResponse.data);
    }

    // 2. Lấy lại devices sau khi tạo
    const finalDevicesResponse = await axios.get('/admin/devices');
    const devices = finalDevicesResponse.data?.data || [];

    if (devices.length === 0) {
      throw new Error('Still no devices available after creation attempt');
    }

    console.log('✅ Available devices:', devices.length);

    // 3. Kiểm tra users
    console.log('2. Checking current user...');
    const userResponse = await axios.get('/admin/auth/me');
    console.log('Current user:', userResponse.data);

    // 4. Tạo borrow request test
    console.log('3. Creating test borrow request...');
    const testBorrowRequest = {
      deviceId: devices[0]._id,
      borrowDate: new Date().toISOString(),
      returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      purpose: 'Test borrow request từ API test function',
      note: 'Dữ liệu test được tạo tự động từ test function',
    };

    console.log('Creating borrow request with data:', testBorrowRequest);

    // Thử endpoint user trước (người dùng thường tạo request)
    try {
      const borrowResponse = await axios.post('/user/borrow-requests', testBorrowRequest);
      console.log('✅ Test borrow request created:', borrowResponse.data);
    } catch (error: any) {
      console.log('❌ Failed to create via /user/borrow-requests, trying admin endpoint');

      // Fallback: thử qua admin endpoint
      const adminBorrowResponse = await axios.post('/admin/borrow-requests', testBorrowRequest);
      console.log('✅ Test borrow request created via admin:', adminBorrowResponse.data);
    }

    // 5. Kiểm tra kết quả
    console.log('4. Verifying created data...');
    const verifyResponse = await axios.get('/admin/borrow-requests', { params: { status: 'pending' } });
    console.log('Verification - borrow requests in database:', verifyResponse.data);

    return {
      success: true,
      message: 'Sample data created successfully',
      devices: devices.length,
      borrowRequests: verifyResponse.data?.data?.length || 0,
    };

  } catch (error: any) {
    console.error('❌ Error in test and create sample data:', error);
    console.error('Error response:', error.response?.data);

    return {
      success: false,
      error: error.message,
      details: error.response?.data,
    };
  }
};
