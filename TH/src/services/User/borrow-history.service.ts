export interface BorrowHistory {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceSerialNumber: string;
  deviceCategory: string;
  userId: string;
  userName: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string;
  actualReturnDate: string;
  purpose: string;
  status: 'returned' | 'overdue_returned' | 'lost' | 'damaged';
  quantity: number;
  borrowDuration: number; // in days
  isOverdue: boolean;
  overdueDays?: number;
  condition: 'good' | 'damaged' | 'lost';
  conditionNotes?: string;
  approvedBy: string;
  approvedDate: string;
  returnedBy: string;
  returnedDate: string;
  rating?: number; // User rating for the device
  feedback?: string; // User feedback
  createdAt: string;
  updatedAt: string;
}

export interface BorrowHistoryListResponse {
  data: BorrowHistory[];
  total: number;
  current: number;
  pageSize: number;
}

export interface BorrowHistoryStats {
  totalBorrows: number;
  successfulReturns: number;
  overdueReturns: number;
  averageBorrowDuration: number;
  mostBorrowedCategory: string;
  totalOverdueDays: number;
}

// Mock borrow history data
const mockBorrowHistory: BorrowHistory[] = [
  {
    id: '1',
    deviceId: '1',
    deviceName: 'MacBook Pro 13"',
    deviceSerialNumber: 'MBP001',
    deviceCategory: 'Laptop',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    userEmail: 'nguyenvana@ptit.edu.vn',
    borrowDate: '2024-01-05',
    returnDate: '2024-01-10',
    actualReturnDate: '2024-01-10',
    purpose: 'Làm đồ án môn học lập trình web',
    status: 'returned',
    quantity: 1,
    borrowDuration: 5,
    isOverdue: false,
    condition: 'good',
    approvedBy: 'Admin',
    approvedDate: '2024-01-03',
    returnedBy: 'Admin',
    returnedDate: '2024-01-10',
    rating: 5,
    feedback: 'Thiết bị hoạt động tốt, rất hữu ích cho việc học tập',
    createdAt: '2024-01-03T08:30:00Z',
    updatedAt: '2024-01-10T16:30:00Z',
  },
  {
    id: '2',
    deviceId: '2',
    deviceName: 'Canon EOS R5',
    deviceSerialNumber: 'CAM001',
    deviceCategory: 'Camera',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    userEmail: 'nguyenvana@ptit.edu.vn',
    borrowDate: '2023-12-20',
    returnDate: '2023-12-25',
    actualReturnDate: '2023-12-27',
    purpose: 'Chụp ảnh sự kiện Noel',
    status: 'overdue_returned',
    quantity: 1,
    borrowDuration: 7,
    isOverdue: true,
    overdueDays: 2,
    condition: 'good',
    approvedBy: 'Admin',
    approvedDate: '2023-12-18',
    returnedBy: 'Admin',
    returnedDate: '2023-12-27',
    rating: 4,
    feedback: 'Camera chất lượng tốt nhưng pin hơi yếu',
    createdAt: '2023-12-18T10:20:00Z',
    updatedAt: '2023-12-27T14:45:00Z',
  },
  {
    id: '3',
    deviceId: '3',
    deviceName: 'iPad Pro 12.9"',
    deviceSerialNumber: 'IPD001',
    deviceCategory: 'Tablet',
    userId: 'user2',
    userName: 'Trần Thị B',
    userEmail: 'tranthib@ptit.edu.vn',
    borrowDate: '2023-12-10',
    returnDate: '2023-12-15',
    actualReturnDate: '2023-12-15',
    purpose: 'Thuyết trình đồ án',
    status: 'returned',
    quantity: 1,
    borrowDuration: 5,
    isOverdue: false,
    condition: 'good',
    approvedBy: 'Admin',
    approvedDate: '2023-12-08',
    returnedBy: 'Admin',
    returnedDate: '2023-12-15',
    rating: 5,
    feedback: 'iPad rất mượt, màn hình đẹp, phù hợp cho thuyết trình',
    createdAt: '2023-12-08T11:00:00Z',
    updatedAt: '2023-12-15T09:30:00Z',
  },
  {
    id: '4',
    deviceId: '4',
    deviceName: 'Máy chiếu Epson EB-X41',
    deviceSerialNumber: 'PRJ001',
    deviceCategory: 'Projector',
    userId: 'user3',
    userName: 'Lê Văn C',
    userEmail: 'levanc@ptit.edu.vn',
    borrowDate: '2023-11-20',
    returnDate: '2023-11-22',
    actualReturnDate: '2023-11-23',
    purpose: 'Hội thảo khoa học',
    status: 'overdue_returned',
    quantity: 1,
    borrowDuration: 3,
    isOverdue: true,
    overdueDays: 1,
    condition: 'damaged',
    conditionNotes: 'Dây HDMI bị hỏng',
    approvedBy: 'Admin',
    approvedDate: '2023-11-18',
    returnedBy: 'Admin',
    returnedDate: '2023-11-23',
    rating: 3,
    feedback: 'Máy chiếu hoạt động ổn nhưng dây kết nối có vấn đề',
    createdAt: '2023-11-18T13:20:00Z',
    updatedAt: '2023-11-23T16:15:00Z',
  },
  {
    id: '5',
    deviceId: '5',
    deviceName: 'Sony A7 III',
    deviceSerialNumber: 'CAM002',
    deviceCategory: 'Camera',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    userEmail: 'nguyenvana@ptit.edu.vn',
    borrowDate: '2023-11-01',
    returnDate: '2023-11-07',
    actualReturnDate: '2023-11-07',
    purpose: 'Quay video documentary',
    status: 'returned',
    quantity: 1,
    borrowDuration: 6,
    isOverdue: false,
    condition: 'good',
    approvedBy: 'Admin',
    approvedDate: '2023-10-30',
    returnedBy: 'Admin',
    returnedDate: '2023-11-07',
    rating: 5,
    feedback: 'Camera tuyệt vời, chất lượng video 4K rất tốt',
    createdAt: '2023-10-30T14:45:00Z',
    updatedAt: '2023-11-07T10:20:00Z',
  },
  // Extended mock borrow history data for comprehensive testing
  {
    id: '6',
    deviceId: '4',
    deviceName: 'Dell XPS 13',
    deviceSerialNumber: 'DELL001',
    deviceCategory: 'Laptop',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    userEmail: 'nguyenvana@ptit.edu.vn',
    borrowDate: '2023-12-01',
    returnDate: '2023-12-05',
    actualReturnDate: '2023-12-05',
    purpose: 'Thực hành lập trình Python',
    status: 'returned',
    quantity: 1,
    borrowDuration: 4,
    isOverdue: false,
    condition: 'good',
    approvedBy: 'Admin',
    approvedDate: '2023-11-30',
    returnedBy: 'Admin',
    returnedDate: '2023-12-05',
    rating: 4,
    feedback: 'Laptop hoạt động ổn định, phù hợp cho coding',
    createdAt: '2023-11-30T08:00:00Z',
    updatedAt: '2023-12-05T17:00:00Z',
  },
  {
    id: '7',
    deviceId: '7',
    deviceName: 'iPad Air 5',
    deviceSerialNumber: 'IPAD002',
    deviceCategory: 'Tablet',
    userId: 'user2',
    userName: 'Trần Thị B',
    userEmail: 'tranthib@ptit.edu.vn',
    borrowDate: '2023-11-15',
    returnDate: '2023-11-20',
    actualReturnDate: '2023-11-20',
    purpose: 'Vẽ thiết kế UI/UX',
    status: 'returned',
    quantity: 1,
    borrowDuration: 5,
    isOverdue: false,
    condition: 'good',
    approvedBy: 'Admin',
    approvedDate: '2023-11-14',
    returnedBy: 'Admin',
    returnedDate: '2023-11-20',
    rating: 5,
    feedback: 'iPad rất phù hợp cho thiết kế, Apple Pencil hoạt động tốt',
    createdAt: '2023-11-14T10:30:00Z',
    updatedAt: '2023-11-20T14:15:00Z',
  },
  {
    id: '8',
    deviceId: '10',
    deviceName: 'Mic Rode PodMic',
    deviceSerialNumber: 'RODE001',
    deviceCategory: 'Microphone',
    userId: 'user3',
    userName: 'Lê Văn C',
    userEmail: 'levanc@ptit.edu.vn',
    borrowDate: '2023-10-20',
    returnDate: '2023-10-25',
    actualReturnDate: '2023-10-27',
    purpose: 'Thu âm thuyết trình',
    status: 'overdue_returned',
    quantity: 1,
    borrowDuration: 7,
    isOverdue: true,
    overdueDays: 2,
    condition: 'good',
    approvedBy: 'Admin',
    approvedDate: '2023-10-19',
    returnedBy: 'Admin',
    returnedDate: '2023-10-27',
    rating: 4,
    feedback: 'Chất lượng âm thanh tốt, dễ sử dụng',
    createdAt: '2023-10-19T11:45:00Z',
    updatedAt: '2023-10-27T16:20:00Z',
  },
  {
    id: '9',
    deviceId: '8',
    deviceName: 'Surface Pro 9',
    deviceSerialNumber: 'SURFACE001',
    deviceCategory: 'Tablet',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    userEmail: 'nguyenvana@ptit.edu.vn',
    borrowDate: '2023-09-10',
    returnDate: '2023-09-15',
    actualReturnDate: '2023-09-15',
    purpose: 'Ghi chú và vẽ sơ đồ',
    status: 'returned',
    quantity: 1,
    borrowDuration: 5,
    isOverdue: false,
    condition: 'good',
    approvedBy: 'Admin',
    approvedDate: '2023-09-08',
    returnedBy: 'Admin',
    returnedDate: '2023-09-15',
    rating: 3,
    feedback: 'Thiết bị ổn nhưng pin hơi yếu',
    createdAt: '2023-09-08T09:20:00Z',
    updatedAt: '2023-09-15T13:40:00Z',
  },
  {
    id: '10',
    deviceId: '9',
    deviceName: 'Drone DJI Mini 3',
    deviceSerialNumber: 'DJI001',
    deviceCategory: 'Drone',
    userId: 'user4',
    userName: 'Phạm Thị D',
    userEmail: 'phamthid@ptit.edu.vn',
    borrowDate: '2023-08-01',
    returnDate: '2023-08-05',
    actualReturnDate: '2023-08-10',
    purpose: 'Quay phim aerial cho dự án',
    status: 'overdue_returned',
    quantity: 1,
    borrowDuration: 9,
    isOverdue: true,
    overdueDays: 5,
    condition: 'damaged',
    conditionNotes: 'Cánh quạt bị cong nhẹ',
    approvedBy: 'Admin',
    approvedDate: '2023-07-30',
    returnedBy: 'Admin',
    returnedDate: '2023-08-10',
    rating: 2,
    feedback: 'Drone bay tốt nhưng khó điều khiển trong gió',
    createdAt: '2023-07-30T15:00:00Z',
    updatedAt: '2023-08-10T18:30:00Z',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all borrow history (for admin)
export const getAllBorrowHistory = async (params?: {
  current?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
  dateRange?: [string, string];
}): Promise<BorrowHistoryListResponse> => {
  await delay(800);

  const { current = 1, pageSize = 10, status, keyword, dateRange } = params || {};

  let filteredHistory = [...mockBorrowHistory];

  // Filter by status
  if (status && status !== 'all') {
    filteredHistory = filteredHistory.filter(record => record.status === status);
  }

  // Filter by keyword
  if (keyword) {
    const searchTerm = keyword.toLowerCase();
    filteredHistory = filteredHistory.filter(record =>
      record.deviceName.toLowerCase().includes(searchTerm) ||
      record.userName.toLowerCase().includes(searchTerm) ||
      record.purpose.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by date range
  if (dateRange && dateRange[0] && dateRange[1]) {
    filteredHistory = filteredHistory.filter(record => {
      const borrowDate = new Date(record.borrowDate);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      return borrowDate >= startDate && borrowDate <= endDate;
    });
  }

  const startIndex = (current - 1) * pageSize;
  const data = filteredHistory.slice(startIndex, startIndex + pageSize);

  return {
    data,
    total: filteredHistory.length,
    current,
    pageSize,
  };
};

// Get user's own borrow history
export const getMyBorrowHistory = async (params?: {
  current?: number;
  pageSize?: number;
  status?: string;
}): Promise<BorrowHistoryListResponse> => {
  await delay(600);

  const { current = 1, pageSize = 10, status } = params || {};

  // Simulate getting current user's history
  const userId = localStorage.getItem('userId') || 'user1';
  let userHistory = mockBorrowHistory.filter(record => record.userId === userId);

  // Filter by status
  if (status && status !== 'all') {
    userHistory = userHistory.filter(record => record.status === status);
  }

  const startIndex = (current - 1) * pageSize;
  const data = userHistory.slice(startIndex, startIndex + pageSize);

  return {
    data,
    total: userHistory.length,
    current,
    pageSize,
  };
};

// Get borrow history by ID
export const getBorrowHistoryById = async (id: string): Promise<BorrowHistory> => {
  await delay(400);

  const record = mockBorrowHistory.find(h => h.id === id);
  if (!record) {
    throw new Error('Không tìm thấy lịch sử mượn trả');
  }

  return record;
};

// Get borrow history statistics
export const getBorrowHistoryStats = async (): Promise<BorrowHistoryStats> => {
  await delay(500);

  const totalBorrows = mockBorrowHistory.length;
  const successfulReturns = mockBorrowHistory.filter(h => h.status === 'returned').length;
  const overdueReturns = mockBorrowHistory.filter(h => h.status === 'overdue_returned').length;

  const totalDuration = mockBorrowHistory.reduce((sum, h) => sum + h.borrowDuration, 0);
  const averageBorrowDuration = Math.round(totalDuration / totalBorrows);

  const categoryCount: { [key: string]: number } = {};
  mockBorrowHistory.forEach(h => {
    categoryCount[h.deviceCategory] = (categoryCount[h.deviceCategory] || 0) + 1;
  });

  const mostBorrowedCategory = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  const totalOverdueDays = mockBorrowHistory
    .filter(h => h.isOverdue)
    .reduce((sum, h) => sum + (h.overdueDays || 0), 0);

  return {
    totalBorrows,
    successfulReturns,
    overdueReturns,
    averageBorrowDuration,
    mostBorrowedCategory,
    totalOverdueDays,
  };
};

// Add user rating and feedback
export const addBorrowFeedback = async (
  id: string,
  rating: number,
  feedback?: string
): Promise<BorrowHistory> => {
  await delay(400);

  const recordIndex = mockBorrowHistory.findIndex(h => h.id === id);
  if (recordIndex === -1) {
    throw new Error('Không tìm thấy lịch sử mượn trả');
  }

  mockBorrowHistory[recordIndex] = {
    ...mockBorrowHistory[recordIndex],
    rating,
    feedback,
    updatedAt: new Date().toISOString(),
  };

  return mockBorrowHistory[recordIndex];
};

// Add comprehensive test API function
export const testBorrowHistoryAPI = async () => {
  console.log('=== TESTING BORROW HISTORY API ===');

  try {
    // Test get all history
    console.log('Testing getAllBorrowHistory...');
    const allHistoryResult = await getAllBorrowHistory({
      current: 1,
      pageSize: 10,
    });
    console.log('✅ All History API working:', allHistoryResult.data.length, 'records loaded');

    // Test user's history
    console.log('Testing getMyBorrowHistory...');
    const myHistoryResult = await getMyBorrowHistory({
      current: 1,
      pageSize: 10,
    });
    console.log('✅ My History API working:', myHistoryResult.data.length, 'records loaded');

    // Test filtering by status
    console.log('Testing status filtering...');
    const returnedHistory = await getAllBorrowHistory({
      status: 'returned',
      pageSize: 50,
    });
    console.log('✅ Returned records:', returnedHistory.data.length);

    // Test statistics
    console.log('Testing getBorrowHistoryStats...');
    const statsResult = await getBorrowHistoryStats();
    console.log('✅ Statistics API working:', statsResult);

    return {
      success: true,
      totalHistory: allHistoryResult.total,
      myHistoryCount: myHistoryResult.data.length,
      returnedCount: returnedHistory.data.length,
      stats: statsResult,
    };
  } catch (error) {
    console.error('❌ Borrow History API Test Failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
