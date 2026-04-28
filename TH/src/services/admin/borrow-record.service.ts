import axios from '@/utils/axios';

export interface BorrowRecord {
  _id: string;
  borrowRequestId: string;
  userId: string;
  deviceId: string;
  borrowDate: string;
  returnDate: string;
  actualReturnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  note: string;
  createdAt: string;
  updatedAt: string;
  borrowRequest: {
    _id: string;
    purpose: string;
    note: string;
  };
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

export interface BorrowRecordStatistics {
  totalBorrowed: number;
  totalReturned: number;
  totalOverdue: number;
  dueSoon: number;
}

export interface BorrowRecordQuery {
  current?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  deviceId?: string;
  userId?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

interface BorrowRecordResponse {
  data: BorrowRecord[];
  current: number;
  pageSize: number;
  total: number;
  statistics: BorrowRecordStatistics;
}

// Lấy tất cả bản ghi mượn trả - Sửa để parse đúng nested structure
export const getAllBorrowRecords = async (params: BorrowRecordQuery = {}): Promise<BorrowRecordResponse> => {
  try {
    console.log('=== BORROW RECORD SERVICE CALL START ===');

    // Thử endpoint chính trước
    let response;
    try {
      response = await axios.get('/admin/borrow-records', {
        params: {
          page: params.current,
          limit: params.pageSize,
          status: params.status,
          keyword: params.keyword,
          startDate: params.startDate,
          endDate: params.endDate,
          userId: params.userId,
          deviceId: params.deviceId,
        }
      });
      console.log('✅ Main borrow-records endpoint works');
    } catch (error) {
      console.log('❌ Main endpoint failed, trying approved requests');

      // Fallback: lấy approved requests và map thành records
      response = await axios.get('/admin/borrow-requests', {
        params: {
          status: 'approved', // Chỉ lấy approved requests
          keyword: params.keyword,
          startDate: params.startDate,
          endDate: params.endDate,
        }
      });
    }

    console.log('Raw response:', response.data);

    // Parse response data
    let recordData = [];
    let total = 0;

    if (response.data?.data) {
      if (Array.isArray(response.data.data)) {
        recordData = response.data.data;
        total = response.data.total || recordData.length;
      }
    }

    // Map approved requests to borrow records format
    const mappedRecords = recordData.map((item: any) => {
      // Nếu đây là borrow request, map sang borrow record
      if (item.status === 'approved' || !item.borrowRequestId) {
        return {
          _id: item._id,
          borrowRequestId: item._id,
          userId: item.userId || item.user?._id,
          deviceId: item.deviceId || item.device?._id,
          borrowDate: item.borrowDate,
          returnDate: item.returnDate,
          actualReturnDate: item.actualReturnDate || null,
          status: item.actualReturnDate ? 'returned' : 'borrowed',
          note: item.note || '',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          borrowRequest: {
            _id: item._id,
            purpose: item.purpose || 'No purpose',
            note: item.note || '',
          },
          user: {
            _id: item.user?._id || item.userId,
            name: item.user?.name || 'Unknown User',
            email: item.user?.email || 'unknown@email.com',
            phone: item.user?.phone || '',
            studentId: item.user?.studentId || '',
          },
          device: {
            _id: item.device?._id || item.deviceId,
            name: item.device?.name || 'Unknown Device',
            serialNumber: item.device?.serialNumber || 'N/A',
            category: item.device?.category || 'Other',
            imageUrl: item.device?.imageUrl || '',
          },
        };
      }
      // Nếu đây đã là borrow record, giữ nguyên
      return item;
    });

    // Calculate statistics
    const today = new Date();
    const statistics = {
      totalBorrowed: mappedRecords.filter((r: any) => r.status === 'borrowed').length,
      totalReturned: mappedRecords.filter((r: any) => r.status === 'returned').length,
      totalOverdue: mappedRecords.filter((r: any) => {
        if (r.status === 'returned') return false;
        const dueDate = new Date(r.returnDate);
        return today > dueDate;
      }).length,
      dueSoon: mappedRecords.filter((r: any) => {
        if (r.status === 'returned') return false;
        const dueDate = new Date(r.returnDate);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays >= 0 && diffDays <= 3;
      }).length,
    };

    return {
      data: mappedRecords,
      current: params.current || 1,
      pageSize: params.pageSize || 10,
      total: total,
      statistics: statistics,
    };

  } catch (error: any) {
    console.error('=== BORROW RECORD SERVICE ERROR ===');
    console.error('Error:', error);

    return {
      data: [],
      current: params.current || 1,
      pageSize: params.pageSize || 10,
      total: 0,
      statistics: {
        totalBorrowed: 0,
        totalReturned: 0,
        totalOverdue: 0,
        dueSoon: 0,
      },
    };
  }
};

// Lấy chi tiết bản ghi mượn trả - theo cách device service
export const getBorrowRecordById = async (id: string): Promise<BorrowRecord> => {
  try {
    console.log('=== GET BORROW RECORD BY ID ===');
    console.log('Record ID:', id);

    // Sử dụng borrow request endpoint vì record được map từ approved request
    const response = await axios.get(`/admin/borrow-requests/${id}`);

    console.log('Response:', response.data);

    let record = response.data?.data || response.data;

    // Map từ borrow request sang borrow record format
    return {
      _id: record._id || record.id,
      borrowRequestId: record._id,
      userId: record.userId || record.user?._id,
      deviceId: record.deviceId || record.device?._id,
      borrowDate: record.borrowDate || new Date().toISOString(),
      returnDate: record.returnDate || new Date().toISOString(),
      actualReturnDate: record.actualReturnDate || null,
      status: 'borrowed',
      note: record.note || '',
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: record.updatedAt || new Date().toISOString(),
      borrowRequest: {
        _id: record._id,
        purpose: record.purpose || 'No purpose',
        note: record.note || '',
      },
      user: {
        _id: record.user?._id || 'unknown',
        name: record.user?.name || 'Unknown User',
        email: record.user?.email || 'unknown@email.com',
        phone: record.user?.phone || '',
        studentId: record.user?.studentId || '',
        ...record.user,
      },
      device: {
        _id: record.device?._id || 'unknown',
        name: record.device?.name || 'Unknown Device',
        serialNumber: record.device?.serialNumber || 'N/A',
        category: record.device?.category || 'Other',
        imageUrl: record.device?.imageUrl || '',
        ...record.device,
      },
    };
  } catch (error: any) {
    console.error('Error fetching borrow record details:', error);
    throw error;
  }
};

// Xác nhận trả thiết bị - sử dụng return endpoint từ borrow request
export const confirmReturnDevice = async (id: string): Promise<void> => {
  try {
    console.log('=== CONFIRM RETURN DEVICE ===');
    console.log('Record ID:', id);

    const response = await axios.patch(`/admin/borrow-requests/${id}/return`);

    console.log('Confirm return response:', response.data);

    if (response.data?.message) {
      console.log('Server message:', response.data.message);
    }
  } catch (error: any) {
    console.error('Error confirming return device:', error);
    console.error('Response data:', error.response?.data);
    throw error;
  }
};

// Lấy thống kê bản ghi mượn trả - theo cách device service
export const getBorrowRecordStatistics = async (): Promise<BorrowRecordStatistics> => {
  try {
    let response;
    try {
      response = await axios.get('/admin/borrow-records/statistics');
    } catch (e) {
      try {
        response = await axios.get('/admin/stats/borrow-records');
      } catch (e2) {
        // Fallback: calculate from record list
        const recordsResponse = await getAllBorrowRecords();
        const records = recordsResponse.data;
        const today = new Date();

        return {
          totalBorrowed: records.filter(r => r.status === 'borrowed').length,
          totalReturned: records.filter(r => r.status === 'returned').length,
          totalOverdue: records.filter(r => {
            if (r.status === 'returned') return false;
            const dueDate = new Date(r.returnDate);
            return today > dueDate;
          }).length,
          dueSoon: records.filter(r => {
            if (r.status === 'returned') return false;
            const dueDate = new Date(r.returnDate);
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            return diffDays >= 0 && diffDays <= 3;
          }).length,
        };
      }
    }

    let stats = {
      totalBorrowed: 0,
      totalReturned: 0,
      totalOverdue: 0,
      dueSoon: 0,
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
    console.error('Error fetching borrow record statistics:', error);
    return {
      totalBorrowed: 0,
      totalReturned: 0,
      totalOverdue: 0,
      dueSoon: 0,
    };
  }
};

// Gửi email nhắc nhở - có thể chưa có endpoint, để fallback
export const sendReminderEmail = async (id: string): Promise<void> => {
  try {
    console.log('=== SEND REMINDER EMAIL ===');
    console.log('Record ID:', id);

    const response = await axios.post(`/admin/borrow-requests/${id}/send-reminder`);

    console.log('Send reminder response:', response.data);

    if (response.data?.message) {
      console.log('Server message:', response.data.message);
    }
  } catch (error: any) {
    console.error('Error sending reminder email:', error);
    console.error('Response data:', error.response?.data);
    throw error;
  }
};

// Cập nhật trạng thái - có thể chưa có endpoint
export const updateState = async (recordId: string, data: { state: string }) => {
  try {
    console.log('=== UPDATE RECORD STATE ===');
    console.log('Record ID:', recordId);
    console.log('Update data:', data);

    const response = await axios.patch(`/admin/borrow-requests/${recordId}`, data);

    console.log('Update state response:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('Error updating record state:', error);
    console.error('Response data:', error.response?.data);
    throw error;
  }
};

// Thêm function test để kiểm tra endpoints
export const testBorrowRecordEndpoints = async () => {
  console.log('=== TESTING BORROW RECORD ENDPOINTS ===');

  const endpoints = [
    '/admin/borrow-records',
    '/admin/borrow-requests?status=approved',

  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint);
      console.log(`✅ ${endpoint}:`, {
        status: response.status,
        dataLength: response.data?.data?.length || 0,
        sampleData: response.data?.data?.[0],
      });
    } catch (error: any) {
      console.log(`❌ ${endpoint}:`, error.response?.status, error.message);
    }
  }
};
