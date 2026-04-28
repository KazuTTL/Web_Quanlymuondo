import axios from '@/utils/axios';

export interface BorrowRequest {
  _id: string;
  userId: string;
  deviceId: string;
  borrowDate: string;
  returnDate: string;
  quantity: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  note?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  device?: {
    _id: string;
    name: string;
    serialNumber: string;
    category: string;
  };
}

export interface CreateBorrowRequestData {
  deviceId: string;
  borrowDate: string;
  returnDate: string;
  quantity: number;
  purpose: string;
}

export interface BorrowRequestListResponse {
  data: BorrowRequest[];
  current: number;
  pageSize: number;
  total: number;
}

// Tạo yêu cầu mượn thiết bị - Sửa endpoint theo backend user routes
export async function createBorrowRequest(data: CreateBorrowRequestData): Promise<BorrowRequest> {
  try {
    console.log('=== CREATE BORROW REQUEST API CALL ===');
    console.log('Data being sent:', data);

    // Backend user routes không có `/api/user/borrow-requests`
    // Endpoint đúng có thể là `/user/devices/borrow-request` hoặc tương tự
    const response = await axios.post('/user/borrow-requests', data);

    console.log('Create borrow request response:', response.data);

    let result = response.data?.data || response.data;
    return result;
  } catch (error: any) {
    console.error('Error creating borrow request:', error);
    console.error('Response data:', error.response?.data);
    throw error;
  }
}

// Lấy danh sách yêu cầu mượn của user
export async function getUserBorrowRequests(params?: {
  current?: number;
  pageSize?: number;
  status?: string;
}): Promise<BorrowRequestListResponse> {
  try {
    console.log('=== GET USER BORROW REQUESTS API CALL ===');
    console.log('Params:', params);

    // Backend route: `/user/devices/my-requests` theo device.router.js
    const response = await axios.get('/user/devices/my-requests', { params });

    console.log('User borrow requests response:', response.data);

    let requests = [];
    let total = 0;

    if (response.data) {
      if (Array.isArray(response.data)) {
        requests = response.data;
        total = requests.length;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        requests = response.data.data;
        total = response.data.total || requests.length;
      }
    }

    return {
      data: requests,
      current: params?.current || 1,
      pageSize: params?.pageSize || 10,
      total: total,
    };
  } catch (error: any) {
    console.error('Error fetching user borrow requests:', error);
    console.error('Response data:', error.response?.data);

    return {
      data: [],
      current: params?.current || 1,
      pageSize: params?.pageSize || 10,
      total: 0,
    };
  }
}

// Alias cho backward compatibility
export const getBorrowRequests = getUserBorrowRequests;

// Lấy chi tiết yêu cầu mượn - sử dụng tên function đúng
export async function getBorrowRequestDetail(id: string): Promise<BorrowRequest> {
  const response = await axios.get(`/user/borrow-requests/${id}`);
  return response.data.data;
}

// Alias cho backward compatibility
export const getBorrowRequestById = getBorrowRequestDetail;

// Hủy yêu cầu mượn
export async function cancelBorrowRequest(id: string): Promise<void> {
  await axios.delete(`/user/borrow-requests/${id}`);
}
