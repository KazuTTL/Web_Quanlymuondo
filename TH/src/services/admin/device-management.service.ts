export interface DeviceWithBorrowInfo {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  status: 'available' | 'borrowed' | 'maintenance' | 'broken' | 'lost';
  quantity: number;
  availableQuantity: number;
  location: string;
  description?: string;
  imageUrl?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  value?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  maintenanceHistory: MaintenanceRecord[];
  borrowHistory: DeviceBorrowRecord[];
  currentBorrower?: {
    userId: string;
    userName: string;
    borrowDate: string;
    returnDate: string;
    isOverdue: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'upgrade';
  description: string;
  cost?: number;
  performedBy: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface DeviceBorrowRecord {
  id: string;
  userId: string;
  userName: string;
  borrowDate: string;
  returnDate: string;
  actualReturnDate?: string;
  purpose: string;
  status: 'borrowed' | 'returned' | 'overdue';
  condition: 'good' | 'damaged' | 'lost';
}

export interface DeviceApproval {
  id: string;
  deviceId: string;
  requestType: 'purchase' | 'disposal' | 'transfer' | 'maintenance';
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
  details: any;
  priority: 'low' | 'medium' | 'high';
}

// Mock maintenance records
const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    date: '2024-01-10',
    type: 'routine',
    description: 'Vệ sinh và kiểm tra tổng quát',
    performedBy: 'Kỹ thuật viên A',
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-01-15',
    type: 'repair',
    description: 'Thay thế bàn phím',
    cost: 500000,
    performedBy: 'Kỹ thuật viên B',
    status: 'completed',
  },
];

// Mock device borrow records
const mockDeviceBorrowRecords: DeviceBorrowRecord[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    borrowDate: '2024-01-05',
    returnDate: '2024-01-10',
    actualReturnDate: '2024-01-10',
    purpose: 'Làm đồ án',
    status: 'returned',
    condition: 'good',
  },
];

// Extended mock devices with more test data
const mockDevicesWithBorrowInfo: DeviceWithBorrowInfo[] = [
  {
    id: '1',
    name: 'MacBook Pro 13" M2',
    serialNumber: 'MBP001',
    category: 'Laptop',
    status: 'borrowed',
    quantity: 1,
    availableQuantity: 0,
    location: 'Phòng 301',
    description: 'MacBook Pro 13 inch với chip M2, RAM 16GB, SSD 512GB',
    imageUrl: 'https://example.com/macbook.jpg',
    purchaseDate: '2023-09-15',
    warrantyExpiry: '2025-09-15',
    value: 35000000,
    condition: 'excellent',
    maintenanceHistory: mockMaintenanceRecords,
    borrowHistory: mockDeviceBorrowRecords,
    currentBorrower: {
      userId: 'user1',
      userName: 'Nguyễn Văn A',
      borrowDate: '2024-01-15',
      returnDate: '2024-01-20',
      isOverdue: false,
    },
    createdAt: '2023-09-15T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Canon EOS R5',
    serialNumber: 'CAM001',
    category: 'Camera',
    status: 'available',
    quantity: 2,
    availableQuantity: 2,
    location: 'Phòng 205',
    description: 'Camera mirrorless full-frame 45MP với khả năng quay 8K',
    imageUrl: 'https://example.com/canon-r5.jpg',
    purchaseDate: '2023-10-20',
    warrantyExpiry: '2025-10-20',
    value: 90000000,
    condition: 'excellent',
    maintenanceHistory: [],
    borrowHistory: [],
    createdAt: '2023-10-20T09:15:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
  },
  {
    id: '3',
    name: 'iPad Pro 12.9"',
    serialNumber: 'IPD001',
    category: 'Tablet',
    status: 'maintenance',
    quantity: 1,
    availableQuantity: 0,
    location: 'Phòng bảo trì',
    description: 'iPad Pro 12.9 inch với chip M2, 256GB',
    purchaseDate: '2023-08-10',
    warrantyExpiry: '2025-08-10',
    value: 28000000,
    condition: 'good',
    maintenanceHistory: [
      {
        id: '3',
        date: '2024-01-18',
        type: 'repair',
        description: 'Sửa chữa màn hình bị nứt',
        cost: 8000000,
        performedBy: 'Trung tâm bảo hành Apple',
        status: 'in_progress',
      },
    ],
    borrowHistory: [
      {
        id: '2',
        userId: 'user3',
        userName: 'Lê Văn C',
        borrowDate: '2024-01-10',
        returnDate: '2024-01-15',
        actualReturnDate: '2024-01-15',
        purpose: 'Thuyết trình',
        status: 'returned',
        condition: 'damaged',
      },
    ],
    createdAt: '2023-08-10T11:30:00Z',
    updatedAt: '2024-01-18T08:45:00Z',
  },
  // Add more test devices
  {
    id: '4',
    name: 'Dell XPS 13',
    serialNumber: 'DELL001',
    category: 'Laptop',
    status: 'available',
    quantity: 3,
    availableQuantity: 2,
    location: 'Phòng 302',
    description: 'Dell XPS 13 với Intel i7, RAM 16GB, SSD 512GB',
    purchaseDate: '2023-11-01',
    warrantyExpiry: '2025-11-01',
    value: 25000000,
    condition: 'good',
    maintenanceHistory: [],
    borrowHistory: [
      {
        id: '3',
        userId: 'user2',
        userName: 'Trần Thị B',
        borrowDate: '2024-01-01',
        returnDate: '2024-01-05',
        actualReturnDate: '2024-01-05',
        purpose: 'Học tập',
        status: 'returned',
        condition: 'good',
      },
    ],
    currentBorrower: {
      userId: 'user4',
      userName: 'Phạm Thị D',
      borrowDate: '2024-01-18',
      returnDate: '2024-01-23',
      isOverdue: false,
    },
    createdAt: '2023-11-01T10:00:00Z',
    updatedAt: '2024-01-18T09:00:00Z',
  },
  {
    id: '5',
    name: 'Sony A7 III',
    serialNumber: 'SONY001',
    category: 'Camera',
    status: 'available',
    quantity: 1,
    availableQuantity: 1,
    location: 'Phòng 205',
    description: 'Camera mirrorless full-frame 24MP',
    purchaseDate: '2023-07-15',
    warrantyExpiry: '2025-07-15',
    value: 45000000,
    condition: 'good',
    maintenanceHistory: [
      {
        id: '4',
        date: '2024-01-01',
        type: 'routine',
        description: 'Vệ sinh cảm biến',
        performedBy: 'Kỹ thuật viên C',
        status: 'completed',
      },
    ],
    borrowHistory: [],
    createdAt: '2023-07-15T14:30:00Z',
    updatedAt: '2024-01-01T16:00:00Z',
  },
  {
    id: '6',
    name: 'Máy chiếu Epson EB-X41',
    serialNumber: 'EPSON001',
    category: 'Projector',
    status: 'broken',
    quantity: 1,
    availableQuantity: 0,
    location: 'Phòng bảo trì',
    description: 'Máy chiếu độ phân giải XGA',
    purchaseDate: '2022-03-10',
    warrantyExpiry: '2024-03-10',
    value: 15000000,
    condition: 'poor',
    maintenanceHistory: [
      {
        id: '5',
        date: '2024-01-20',
        type: 'repair',
        description: 'Sửa chữa bóng đèn hỏng',
        cost: 2000000,
        performedBy: 'Trung tâm bảo trì',
        status: 'in_progress',
      },
    ],
    borrowHistory: [
      {
        id: '4',
        userId: 'user3',
        userName: 'Lê Văn C',
        borrowDate: '2024-01-10',
        returnDate: '2024-01-15',
        actualReturnDate: '2024-01-15',
        purpose: 'Hội thảo',
        status: 'returned',
        condition: 'damaged',
      },
    ],
    createdAt: '2022-03-10T08:00:00Z',
    updatedAt: '2024-01-20T11:30:00Z',
  },
  {
    id: '7',
    name: 'iPad Air 5',
    serialNumber: 'IPAD002',
    category: 'Tablet',
    status: 'available',
    quantity: 4,
    availableQuantity: 4,
    location: 'Phòng 103',
    description: 'iPad Air 5 với chip M1, 64GB',
    purchaseDate: '2023-12-01',
    warrantyExpiry: '2025-12-01',
    value: 18000000,
    condition: 'excellent',
    maintenanceHistory: [],
    borrowHistory: [],
    createdAt: '2023-12-01T13:00:00Z',
    updatedAt: '2023-12-01T13:00:00Z',
  },
  {
    id: '8',
    name: 'Surface Pro 9',
    serialNumber: 'SURFACE001',
    category: 'Tablet',
    status: 'maintenance',
    quantity: 2,
    availableQuantity: 0,
    location: 'Phòng bảo trì',
    description: 'Microsoft Surface Pro 9 với Intel i5',
    purchaseDate: '2023-06-20',
    warrantyExpiry: '2025-06-20',
    value: 30000000,
    condition: 'fair',
    maintenanceHistory: [
      {
        id: '6',
        date: '2024-01-19',
        type: 'upgrade',
        description: 'Nâng cấp RAM và SSD',
        cost: 5000000,
        performedBy: 'Kỹ thuật viên D',
        status: 'scheduled',
      },
    ],
    borrowHistory: [
      {
        id: '5',
        userId: 'user5',
        userName: 'Hoàng Văn E',
        borrowDate: '2024-01-05',
        returnDate: '2024-01-12',
        actualReturnDate: '2024-01-14',
        purpose: 'Thuyết trình',
        status: 'returned',
        condition: 'good',
      },
    ],
    createdAt: '2023-06-20T11:45:00Z',
    updatedAt: '2024-01-19T10:15:00Z',
  },
  {
    id: '9',
    name: 'Drone DJI Mini 3',
    serialNumber: 'DJI001',
    category: 'Drone',
    status: 'lost',
    quantity: 1,
    availableQuantity: 0,
    location: 'Không xác định',
    description: 'Drone quay phim 4K',
    purchaseDate: '2023-05-15',
    warrantyExpiry: '2025-05-15',
    value: 20000000,
    condition: 'poor',
    maintenanceHistory: [],
    borrowHistory: [
      {
        id: '6',
        userId: 'user6',
        userName: 'Vũ Thị F',
        borrowDate: '2024-01-08',
        returnDate: '2024-01-12',
        purpose: 'Quay phim sự kiện',
        status: 'overdue',
        condition: 'lost',
      },
    ],
    createdAt: '2023-05-15T15:20:00Z',
    updatedAt: '2024-01-12T18:00:00Z',
  },
  {
    id: '10',
    name: 'Mic Rode PodMic',
    serialNumber: 'RODE001',
    category: 'Microphone',
    status: 'available',
    quantity: 5,
    availableQuantity: 3,
    location: 'Phòng 401',
    description: 'Microphone thu âm chuyên nghiệp',
    purchaseDate: '2023-08-25',
    warrantyExpiry: '2025-08-25',
    value: 8000000,
    condition: 'excellent',
    maintenanceHistory: [],
    borrowHistory: [
      {
        id: '7',
        userId: 'user7',
        userName: 'Đỗ Văn G',
        borrowDate: '2024-01-16',
        returnDate: '2024-01-18',
        actualReturnDate: '2024-01-18',
        purpose: 'Podcast',
        status: 'returned',
        condition: 'good',
      },
    ],
    currentBorrower: {
      userId: 'user8',
      userName: 'Bùi Thị H',
      borrowDate: '2024-01-19',
      returnDate: '2024-01-22',
      isOverdue: false,
    },
    createdAt: '2023-08-25T12:10:00Z',
    updatedAt: '2024-01-19T14:30:00Z',
  },
];

// Mock device approval requests
const mockDeviceApprovals: DeviceApproval[] = [
  {
    id: '1',
    deviceId: 'new',
    requestType: 'purchase',
    requestedBy: 'Trưởng khoa CNTT',
    requestDate: '2024-01-15',
    status: 'pending',
    details: {
      deviceName: 'MacBook Pro 14" M3',
      quantity: 5,
      estimatedCost: 200000000,
      reason: 'Nâng cấp thiết bị cho phòng thí nghiệm',
      vendor: 'Apple Authorized Reseller',
    },
    priority: 'high',
  },
  {
    id: '2',
    deviceId: '3',
    requestType: 'disposal',
    requestedBy: 'Quản lý thiết bị',
    requestDate: '2024-01-12',
    status: 'approved',
    approvedBy: 'Giám đốc',
    approvedDate: '2024-01-14',
    details: {
      reason: 'Thiết bị hỏng không thể sửa chữa',
      disposalMethod: 'Bán phế liệu',
      estimatedValue: 2000000,
    },
    priority: 'medium',
  },
  {
    id: '3',
    deviceId: 'new',
    requestType: 'purchase',
    requestedBy: 'Phòng IT',
    requestDate: '2024-01-18',
    status: 'pending',
    details: {
      deviceName: 'Camera Sony FX3',
      quantity: 2,
      estimatedCost: 180000000,
      reason: 'Thiết bị quay phim chuyên nghiệp cho khoa Truyền thông',
      vendor: 'Sony Vietnam',
    },
    priority: 'medium',
  },
  {
    id: '4',
    deviceId: '6',
    requestType: 'maintenance',
    requestedBy: 'Kỹ thuật viên A',
    requestDate: '2024-01-20',
    status: 'rejected',
    rejectedReason: 'Chi phí sửa chữa cao hơn giá trị thiết bị',
    details: {
      maintenanceType: 'repair',
      estimatedCost: 18000000,
      description: 'Thay thế toàn bộ hệ thống quang học',
    },
    priority: 'low',
  },
  {
    id: '5',
    deviceId: '8',
    requestType: 'transfer',
    requestedBy: 'Trưởng phòng 302',
    requestDate: '2024-01-17',
    status: 'approved',
    approvedBy: 'Phó giám đốc',
    approvedDate: '2024-01-19',
    details: {
      fromLocation: 'Phòng 103',
      toLocation: 'Phòng 302',
      reason: 'Phục vụ lớp học chuyên ngành',
    },
    priority: 'low',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get devices with detailed borrow information
export const getDevicesWithBorrowInfo = async (params?: {
  current?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  keyword?: string;
}): Promise<{ data: DeviceWithBorrowInfo[]; total: number; current: number; pageSize: number }> => {
  await delay(800);

  const { current = 1, pageSize = 10, status, category, keyword } = params || {};

  let filteredDevices = [...mockDevicesWithBorrowInfo];

  // Filter by status
  if (status && status !== 'all') {
    filteredDevices = filteredDevices.filter(device => device.status === status);
  }

  // Filter by category
  if (category && category !== 'all') {
    filteredDevices = filteredDevices.filter(device => device.category === category);
  }

  // Filter by keyword
  if (keyword) {
    const searchTerm = keyword.toLowerCase();
    filteredDevices = filteredDevices.filter(device =>
      device.name.toLowerCase().includes(searchTerm) ||
      device.serialNumber.toLowerCase().includes(searchTerm) ||
      device.description?.toLowerCase().includes(searchTerm)
    );
  }

  const startIndex = (current - 1) * pageSize;
  const data = filteredDevices.slice(startIndex, startIndex + pageSize);

  return {
    data,
    total: filteredDevices.length,
    current,
    pageSize,
  };
};

// Get device approval requests
export const getDeviceApprovals = async (params?: {
  current?: number;
  pageSize?: number;
  status?: string;
  requestType?: string;
}): Promise<{ data: DeviceApproval[]; total: number; current: number; pageSize: number }> => {
  await delay(600);

  const { current = 1, pageSize = 10, status, requestType } = params || {};

  let filteredApprovals = [...mockDeviceApprovals];

  // Filter by status
  if (status && status !== 'all') {
    filteredApprovals = filteredApprovals.filter(approval => approval.status === status);
  }

  // Filter by request type
  if (requestType && requestType !== 'all') {
    filteredApprovals = filteredApprovals.filter(approval => approval.requestType === requestType);
  }

  const startIndex = (current - 1) * pageSize;
  const data = filteredApprovals.slice(startIndex, startIndex + pageSize);

  return {
    data,
    total: filteredApprovals.length,
    current,
    pageSize,
  };
};

// Approve device request
export const approveDeviceRequest = async (
  id: string,
  data: { approvedBy: string; notes?: string }
): Promise<DeviceApproval> => {
  await delay(800);

  const approvalIndex = mockDeviceApprovals.findIndex(approval => approval.id === id);
  if (approvalIndex === -1) {
    throw new Error('Không tìm thấy yêu cầu phê duyệt');
  }

  const approval = mockDeviceApprovals[approvalIndex];
  if (approval.status !== 'pending') {
    throw new Error('Chỉ có thể phê duyệt yêu cầu đang chờ xử lý');
  }

  mockDeviceApprovals[approvalIndex] = {
    ...approval,
    status: 'approved',
    approvedBy: data.approvedBy,
    approvedDate: new Date().toISOString().split('T')[0],
  };

  return mockDeviceApprovals[approvalIndex];
};

// Reject device request
export const rejectDeviceRequest = async (
  id: string,
  data: { rejectedBy: string; reason: string }
): Promise<DeviceApproval> => {
  await delay(600);

  const approvalIndex = mockDeviceApprovals.findIndex(approval => approval.id === id);
  if (approvalIndex === -1) {
    throw new Error('Không tìm thấy yêu cầu phê duyệt');
  }

  const approval = mockDeviceApprovals[approvalIndex];
  if (approval.status !== 'pending') {
    throw new Error('Chỉ có thể từ chối yêu cầu đang chờ xử lý');
  }

  mockDeviceApprovals[approvalIndex] = {
    ...approval,
    status: 'rejected',
    rejectedReason: data.reason,
  };

  return mockDeviceApprovals[approvalIndex];
};

// Schedule device maintenance
export const scheduleDeviceMaintenance = async (
  deviceId: string,
  data: {
    type: 'routine' | 'repair' | 'upgrade';
    description: string;
    scheduledDate: string;
    performedBy: string;
    estimatedCost?: number;
  }
): Promise<MaintenanceRecord> => {
  await delay(500);

  const newMaintenance: MaintenanceRecord = {
    id: String(Date.now()),
    date: data.scheduledDate,
    type: data.type,
    description: data.description,
    cost: data.estimatedCost,
    performedBy: data.performedBy,
    status: 'scheduled',
  };

  // Add to device's maintenance history
  const deviceIndex = mockDevicesWithBorrowInfo.findIndex(d => d.id === deviceId);
  if (deviceIndex !== -1) {
    mockDevicesWithBorrowInfo[deviceIndex].maintenanceHistory.push(newMaintenance);
    mockDevicesWithBorrowInfo[deviceIndex].status = 'maintenance';
    mockDevicesWithBorrowInfo[deviceIndex].availableQuantity = 0;
  }

  return newMaintenance;
};

// Complete device maintenance
export const completeDeviceMaintenance = async (
  deviceId: string,
  maintenanceId: string,
  data: {
    actualCost?: number;
    notes?: string;
    newCondition?: 'excellent' | 'good' | 'fair' | 'poor';
  }
): Promise<DeviceWithBorrowInfo> => {
  await delay(600);

  const deviceIndex = mockDevicesWithBorrowInfo.findIndex(d => d.id === deviceId);
  if (deviceIndex === -1) {
    throw new Error('Không tìm thấy thiết bị');
  }

  const device = mockDevicesWithBorrowInfo[deviceIndex];
  const maintenanceIndex = device.maintenanceHistory.findIndex(m => m.id === maintenanceId);

  if (maintenanceIndex === -1) {
    throw new Error('Không tìm thấy lịch sử bảo trì');
  }

  // Update maintenance record
  device.maintenanceHistory[maintenanceIndex] = {
    ...device.maintenanceHistory[maintenanceIndex],
    status: 'completed',
    cost: data.actualCost || device.maintenanceHistory[maintenanceIndex].cost,
  };

  // Update device status and condition
  mockDevicesWithBorrowInfo[deviceIndex] = {
    ...device,
    status: 'available',
    availableQuantity: device.quantity,
    condition: data.newCondition || device.condition,
    updatedAt: new Date().toISOString(),
  };

  return mockDevicesWithBorrowInfo[deviceIndex];
};

// Force return overdue device
export const forceReturnDevice = async (
  deviceId: string,
  data: {
    returnedBy: string;
    condition: 'good' | 'damaged' | 'lost';
    notes?: string;
    penalty?: number;
  }
): Promise<DeviceWithBorrowInfo> => {
  await delay(800);

  const deviceIndex = mockDevicesWithBorrowInfo.findIndex(d => d.id === deviceId);
  if (deviceIndex === -1) {
    throw new Error('Không tìm thấy thiết bị');
  }

  const device = mockDevicesWithBorrowInfo[deviceIndex];
  if (!device.currentBorrower) {
    throw new Error('Thiết bị hiện không được mượn bởi ai');
  }

  // Update device status
  mockDevicesWithBorrowInfo[deviceIndex] = {
    ...device,
    status: data.condition === 'good' ? 'available' :
           data.condition === 'damaged' ? 'maintenance' : 'lost',
    availableQuantity: data.condition === 'good' ? device.quantity : 0,
    currentBorrower: undefined,
    updatedAt: new Date().toISOString(),
  };

  // Add to borrow history
  const borrowRecord: DeviceBorrowRecord = {
    id: String(Date.now()),
    userId: device.currentBorrower.userId,
    userName: device.currentBorrower.userName,
    borrowDate: device.currentBorrower.borrowDate,
    returnDate: device.currentBorrower.returnDate,
    actualReturnDate: new Date().toISOString().split('T')[0],
    purpose: 'Force returned due to overdue',
    status: 'returned',
    condition: data.condition,
  };

  mockDevicesWithBorrowInfo[deviceIndex].borrowHistory.push(borrowRecord);

  return mockDevicesWithBorrowInfo[deviceIndex];
};

// Get device utilization statistics
export const getDeviceUtilizationStats = async () => {
  await delay(400);

  const totalDevices = mockDevicesWithBorrowInfo.length;
  const availableDevices = mockDevicesWithBorrowInfo.filter(d => d.status === 'available').length;
  const borrowedDevices = mockDevicesWithBorrowInfo.filter(d => d.status === 'borrowed').length;
  const maintenanceDevices = mockDevicesWithBorrowInfo.filter(d => d.status === 'maintenance').length;

  const utilizationRate = totalDevices > 0 ? (borrowedDevices / totalDevices) * 100 : 0;

  const categoryStats = mockDevicesWithBorrowInfo.reduce((acc, device) => {
    acc[device.category] = (acc[device.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalDevices,
    availableDevices,
    borrowedDevices,
    maintenanceDevices,
    utilizationRate: Math.round(utilizationRate),
    categoryStats,
  };
};

// Add test API function
export const testDeviceManagementAPI = async () => {
  console.log('=== TESTING DEVICE MANAGEMENT API ===');

  try {
    // Test get devices
    console.log('Testing getDevicesWithBorrowInfo...');
    const devicesResult = await getDevicesWithBorrowInfo({
      current: 1,
      pageSize: 5,
    });
    console.log('✅ Devices API working:', devicesResult.data.length, 'devices loaded');

    // Test get approvals
    console.log('Testing getDeviceApprovals...');
    const approvalsResult = await getDeviceApprovals({
      current: 1,
      pageSize: 10,
    });
    console.log('✅ Approvals API working:', approvalsResult.data.length, 'approvals loaded');

    // Test statistics
    console.log('Testing getDeviceUtilizationStats...');
    const statsResult = await getDeviceUtilizationStats();
    console.log('✅ Statistics API working:', statsResult);

    return {
      success: true,
      devices: devicesResult.data.length,
      approvals: approvalsResult.data.length,
      stats: statsResult,
    };
  } catch (error) {
    console.error('❌ Device Management API Test Failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
