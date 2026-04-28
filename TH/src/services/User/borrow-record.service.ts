import axios from '@/utils/axios';

export interface BorrowRecord {
  id: number;
  userId: number;
  deviceId: number;
  borrowRequestId: number;
  actualBorrowDate: string;
  actualReturnDate: string | null;
  status: 'borrowed' | 'returned' | 'overdue';
  notes: string | null;
}

const borrowRecordService = {
  getUserBorrowRecords: async () => {
    const response = await axios.get('/user/borrow-records');
    return response.data;
  },

  getBorrowRecordById: async (id: number) => {
    const response = await axios.get(`/user/borrow-records/${id}`);
    return response.data;
  },

  // Admin only
  getAllBorrowRecords: async () => {
    const response = await axios.get('/admin/borrow-records');
    return response.data;
  },

  recordDeviceReturn: async (id: number, notes?: string) => {
    const response = await axios.put(`/admin/borrow-records/${id}/return`, { notes });
    return response.data;
  },
};

export default borrowRecordService;