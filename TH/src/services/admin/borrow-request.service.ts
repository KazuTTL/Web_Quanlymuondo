import axios from '@/utils/axios';

export interface BorrowRequest {
  id: string;
  _id: string;
  userId: string;
  deviceId: string;
  borrowDate: string;
  returnDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  purpose: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    studentId?: string;
  };
  device: {
    _id: string;
    name: string;
    serialNumber: string;
    category: string;
    imageUrl?: string;
  };
}

export interface BorrowRequestParams {
  current?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
  userId?: string;
  deviceId?: string;
  sortField?: string;
  startDate?: string;
  endDate?: string;
  sortOrder?: 'ascend' | 'descend';
}

export interface BorrowRequestResponse {
  data: BorrowRequest[];
  total: number;
  current: number;
  pageSize: number;
}

export interface UpdateStatusRequest {
  status: 'approved' | 'rejected';
}

// Lấy tất cả yêu cầu mượn - Sửa để parse đúng nested data structure
export const getAllBorrowRequests = async (params: BorrowRequestParams = {}): Promise<BorrowRequestResponse> => {
  try {
    console.log('=== BORROW REQUEST SERVICE CALL START ===');
    console.log('Input params:', params);

    // Check authentication first
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log('Token exists:', !!token);
    console.log('User role:', role);

    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Making API call to /admin/borrow-requests');

    const response = await axios.get('/admin/borrow-requests', {
      params: {
        status: params.status,
        keyword: params.keyword,
        startDate: params.startDate,
        endDate: params.endDate,
      }
    });

    console.log('=== RAW API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    console.log('Response message:', response.data?.message);
    console.log('Response data type:', typeof response.data?.data);
    console.log('Is data array:', Array.isArray(response.data?.data));

    // NEW: Check nested data structure
    if (response.data?.data?.data) {
      console.log('Nested data type:', typeof response.data.data.data);
      console.log('Nested data is array:', Array.isArray(response.data.data.data));
      console.log('Nested data length:', response.data.data.data?.length);
    }

    // Handle response - Backend format: {message: "...", data: {data: [...], total: 5, current: 1, pageSize: 10}}
    let requests = [];
    let total = 0;

    if (response.data) {
      // Case 1: Nested structure {message: "...", data: {data: [...], total: ...}}
      if (response.data.message && response.data.data && Array.isArray(response.data.data.data)) {
        console.log('✅ Found nested backend response format');
        console.log('Backend message:', response.data.message);
        requests = response.data.data.data; // Access nested data.data.data
        total = response.data.data.total || requests.length;
        console.log('Extracted requests:', requests.length);
        console.log('Extracted total:', total);
      }
      // Case 2: Standard format {message: "...", data: [...]}
      else if (response.data.message && Array.isArray(response.data.data)) {
        console.log('✅ Found standard backend response format');
        console.log('Backend message:', response.data.message);
        requests = response.data.data;
        total = response.data.total || requests.length;
      }
      // Case 3: Direct array
      else if (Array.isArray(response.data)) {
        console.log('✅ Found direct array response');
        requests = response.data;
        total = requests.length;
      }
      // Case 4: Object with data property
      else if (response.data.data && Array.isArray(response.data.data)) {
        console.log('✅ Found object with data property');
        requests = response.data.data;
        total = response.data.total || requests.length;
      }
      else {
        console.log('❌ Unknown response structure');
        console.log('Available keys:', Object.keys(response.data));
        console.log('response.data.data keys:', response.data.data ? Object.keys(response.data.data) : 'N/A');
        console.log('Full response.data:', response.data);

        // Try to find array in nested structure
        if (response.data.data && typeof response.data.data === 'object') {
          for (const key of Object.keys(response.data.data)) {
            if (Array.isArray(response.data.data[key])) {
              console.log(`✅ Found array in nested key: data.${key}`);
              requests = response.data.data[key];
              total = requests.length;
              break;
            }
          }
        }
      }
    }

    console.log('=== PROCESSED RESULTS ===');
    console.log('Requests found:', requests.length);
    console.log('Total count:', total);

    if (requests.length > 0) {
      console.log('Sample request:', requests[0]);
    } else {
      console.log('⚠️ No requests found - checking if array exists but is empty');
    }

    // Validate and map request data
    const validatedRequests = requests.map((request: any, index: number) => {
      console.log(`Mapping request ${index}:`, request);

      return {
        ...request,
        id: request._id || request.id || `request-${index}`,
        _id: request._id || request.id || `request-${index}`,
        status: request.status || 'pending',
        borrowDate: request.borrowDate || new Date().toISOString(),
        returnDate: request.returnDate || new Date().toISOString(),
        purpose: request.purpose || 'No purpose specified',
        note: request.note || '',
        createdAt: request.createdAt || new Date().toISOString(),
        updatedAt: request.updatedAt || new Date().toISOString(),
        user: {
          _id: request.user?._id || request.userId || 'unknown-user',
          name: request.user?.name || request.user?.fullName || 'Unknown User',
          email: request.user?.email || 'unknown@email.com',
          phone: request.user?.phone || '',
          studentId: request.user?.studentId || '',
          ...request.user,
        },
        device: {
          _id: request.device?._id || request.deviceId || 'unknown-device',
          name: request.device?.name || 'Unknown Device',
          serialNumber: request.device?.serialNumber || 'N/A',
          category: request.device?.category || 'Other',
          imageUrl: request.device?.imageUrl || '',
          ...request.device,
        },
      };
    });

    const result = {
      data: validatedRequests,
      current: params.current || 1,
      pageSize: params.pageSize || 10,
      total: total,
    };

    console.log('=== FINAL RESULT ===');
    console.log('Returning result:', result);
    console.log('Final data length:', result.data.length);

    return result;

  } catch (error: any) {
    console.error('=== BORROW REQUEST SERVICE ERROR ===');
    console.error('Error:', error);

    if (error.response?.status === 401) {
      console.error('❌ Authentication failed');
      localStorage.clear();
      window.location.href = '/auth/login';
    }

    return {
      data: [],
      current: params.current || 1,
      pageSize: params.pageSize || 10,
      total: 0,
    };
  }
};

// Thêm function để tạo test data trong database
export const createTestBorrowRequest = async (testData: {
  deviceId: string;
  borrowDate: string;
  returnDate: string;
  purpose: string;
  note?: string;
}): Promise<BorrowRequest> => {
  try {
    console.log('=== CREATE TEST BORROW REQUEST ===');
    console.log('Test data:', testData);

    const response = await axios.post('/user/borrow-requests', testData);

    console.log('Create test request response:', response.data);

    let createdRequest = response.data?.data || response.data;

    return {
      ...createdRequest,
      id: createdRequest._id || createdRequest.id,
    };
  } catch (error: any) {
    console.error('Error creating test borrow request:', error);
    throw error;
  }
};

// Lấy chi tiết yêu cầu mượn theo ID - theo cách device service
export const getBorrowRequestById = async (id: string): Promise<BorrowRequest> => {
  try {
    console.log('=== GET BORROW REQUEST BY ID ===');
    console.log('Request ID:', id);

    const response = await axios.get(`/admin/borrow-requests/${id}`);

    console.log('Response:', response.data);

    let request = response.data?.data || response.data;

    return {
      ...request,
      id: request._id || request.id,
      user: {
        _id: request.user?._id || 'unknown',
        name: request.user?.name || 'Unknown',
        email: request.user?.email || 'unknown@email.com',
        phone: request.user?.phone || '',
        studentId: request.user?.studentId || '',
        ...request.user,
      },
      device: {
        _id: request.device?._id || 'unknown',
        name: request.device?.name || 'Unknown Device',
        serialNumber: request.device?.serialNumber || 'N/A',
        category: request.device?.category || 'Other',
        imageUrl: request.device?.imageUrl || '',
        ...request.device,
      },
    };
  } catch (error: any) {
    console.error('Error fetching borrow request details:', error);
    throw error;
  }
};

// Duyệt yêu cầu mượn - theo cách device service
export const approveRequest = async (id: string): Promise<void> => {
  try {
    console.log('=== APPROVE REQUEST ===');
    console.log('Request ID:', id);

    const response = await axios.patch(`/admin/borrow-requests/${id}/approve`);

    console.log('Approve response:', response.data);

    if (response.data?.message) {
      console.log('Server message:', response.data.message);
    }
  } catch (error: any) {
    console.error('Error approving request:', error);
    console.error('Response data:', error.response?.data);
    throw error;
  }
};

// Từ chối yêu cầu mượn - theo cách device service
export const rejectRequest = async (id: string): Promise<void> => {
  try {
    console.log('=== REJECT REQUEST ===');
    console.log('Request ID:', id);

    const response = await axios.patch(`/admin/borrow-requests/${id}/reject`);

    console.log('Reject response:', response.data);

    if (response.data?.message) {
      console.log('Server message:', response.data.message);
    }
  } catch (error: any) {
    console.error('Error rejecting request:', error);
    console.error('Response data:', error.response?.data);
    throw error;
  }
};

// Trả thiết bị (Admin only) - theo cách device service
export const returnDevice = async (id: string): Promise<void> => {
  try {
    console.log('=== RETURN DEVICE ===');
    console.log('Request ID:', id);

    const response = await axios.patch(`/admin/borrow-requests/${id}/return`);

    console.log('Return device response:', response.data);

    if (response.data?.message) {
      console.log('Server message:', response.data.message);
    }
  } catch (error: any) {
    console.error('Error returning device:', error);
    console.error('Response data:', error.response?.data);
    throw error;
  }
};

// Lấy thống kê yêu cầu mượn - theo cách device service
export const getBorrowRequestStatistics = async () => {
  try {
    let response;
    try {
      response = await axios.get('/admin/borrow-requests/statistics');
    } catch (e) {
      try {
        response = await axios.get('/admin/stats/borrow-requests');
      } catch (e2) {
        // Fallback: calculate from request list
        const requestsResponse = await getAllBorrowRequests();
        const requests = requestsResponse.data;

        return {
          totalRequests: requests.length,
          pendingRequests: requests.filter(r => r.status === 'pending').length,
          approvedRequests: requests.filter(r => r.status === 'approved').length,
          rejectedRequests: requests.filter(r => r.status === 'rejected').length,
        };
      }
    }

    let stats = {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
    };

    if (response?.data) {
      if (response.data.success && response.data.data) {
        stats = { ...stats, ...response.data.data };
      } else if (response.data.data) {
        stats = { ...stats, ...response.data.data };
      } else {
        stats = { ...stats, ...response.data };
      }
    }

    return stats;
  } catch (error) {
    console.error('Error fetching borrow request statistics:', error);
    return {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
    };
  }
};
