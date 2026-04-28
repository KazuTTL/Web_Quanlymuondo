import axios from '@/utils/axios';

export interface Device {
  _id: string;
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  status: 'available' | 'borrowed' | 'maintenance' | 'broken' | 'lost';
  location: string;
  description?: string;
  quantity: number;
  availableQuantity?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceListParams {
  current?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  category?: string;
}

export interface DeviceListResponse {
  data: Device[];
  current: number;
  pageSize: number;
  total: number;
}

export interface CreateDeviceRequest {
  name: string;
  serialNumber: string;
  category: string;
  location: string;
  description?: string;
  quantity: number;
  imageUrl?: string;
}

export interface UpdateDeviceRequest {
  name?: string;
  serialNumber?: string;
  category?: string;
  status?: string;
  location?: string;
  description?: string;
  quantity?: number;
  imageUrl?: string;
}

export interface DeviceStatistics {
  total: number;
  available: number;
  borrowed: number;
  maintenance: number;
  broken: number;
  lost: number;
}

// Lấy danh sách thiết bị (admin có thể xem tất cả)
export const getDevices = async (params: DeviceListParams = {}): Promise<DeviceListResponse> => {
  try {
    console.log('=== DEVICE SERVICE CALL START ===');
    console.log('Input params:', params);

    // Check authentication first
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log('Token exists:', !!token);
    console.log('User role:', role);

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Test multiple endpoints to find the correct one
    const endpoints = [
      '/admin/devices',
      '/api/admin/devices',
      '/devices',
    ];

    let response;
    let workingEndpoint = '';

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        response = await axios.get(endpoint);
        workingEndpoint = endpoint;
        console.log(`✅ Success with endpoint: ${endpoint}`);
        break;
      } catch (error: any) {
        console.log(`❌ Failed with endpoint ${endpoint}:`, error.response?.status);
        if (error.response?.status !== 404) {
          throw error; // If it's not 404, throw the error
        }
      }
    }

    if (!response) {
      console.log('❌ All endpoints failed');
      return {
        data: [],
        current: params.current || 1,
        pageSize: params.pageSize || 10,
        total: 0,
      };
    }

    console.log('=== RAW API RESPONSE ===');
    console.log('Working endpoint:', workingEndpoint);
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    console.log('Response type:', typeof response.data);
    console.log('Is array:', Array.isArray(response.data));

    // Handle different response structures from backend
    let devices = [];
    let total = 0;

    if (response.data) {
      if (Array.isArray(response.data)) {
        devices = response.data;
        total = devices.length;
        console.log('✅ Direct array response');
      }
      else if (response.data.success !== undefined && response.data.data) {
        if (Array.isArray(response.data.data)) {
          devices = response.data.data;
          total = response.data.total || devices.length;
        }
        console.log('✅ Success wrapper response');
      }
      else if (response.data.data && Array.isArray(response.data.data)) {
        devices = response.data.data;
        total = response.data.total || devices.length;
        console.log('✅ Nested data response');
      }
      else {
        console.log('❌ Unknown response structure');
        console.log('Response keys:', Object.keys(response.data));
        console.log('Full response:', JSON.stringify(response.data, null, 2));

        // Try to find any array in response
        for (const key of Object.keys(response.data)) {
          if (Array.isArray(response.data[key])) {
            console.log(`Found array in key: ${key}`);
            devices = response.data[key];
            total = devices.length;
            break;
          }
        }
      }
    }

    console.log('=== PROCESSED RESULTS ===');
    console.log('Final devices count:', devices.length);
    console.log('Sample device:', devices[0]);

    // If no devices found, create mock data to test UI
    if (devices.length === 0) {
      console.log('⚠️ No devices from API, creating mock data for testing');
      devices = [
        {
          _id: 'mock-1',
          name: 'Laptop Dell Test',
          serialNumber: 'TEST001',
          category: 'Laptop',
          status: 'available',
          location: 'Phòng A101',
          quantity: 5,
          availableQuantity: 3,
          description: 'Mock device for testing',
          imageUrl: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'mock-2',
          name: 'Máy chiếu Epson Test',
          serialNumber: 'TEST002',
          category: 'Projector',
          status: 'borrowed',
          location: 'Phòng B203',
          quantity: 2,
          availableQuantity: 0,
          description: 'Mock projector for testing',
          imageUrl: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      total = devices.length;
    }

    // Ensure each device has consistent structure
    const mappedDevices = devices.map((device: any, index: number) => ({
      ...device,
      id: device._id || device.id || `device-${index}`,
      _id: device._id || device.id || `device-${index}`,
      name: device.name || 'Unknown Device',
      serialNumber: device.serialNumber || 'N/A',
      category: device.category || 'Other',
      status: device.status || 'available',
      location: device.location || 'Unknown',
      quantity: Number(device.quantity) || 1,
      availableQuantity: Number(device.availableQuantity) || Number(device.quantity) || 1,
      createdAt: device.createdAt || new Date().toISOString(),
      updatedAt: device.updatedAt || new Date().toISOString(),
    }));

    const result = {
      data: mappedDevices,
      current: params.current || 1,
      pageSize: params.pageSize || 10,
      total: total,
    };

    console.log('=== RETURNING RESULT ===');
    console.log('Result:', result);
    return result;

  } catch (error: any) {
    console.error('=== DEVICE SERVICE ERROR ===');
    console.error('Error:', error);

    if (error.response?.status === 401) {
      console.error('❌ Authentication failed');
      localStorage.clear();
      window.location.href = '/auth/login';
    }

    // Return mock data on error
    return {
      data: [
        {
          _id: 'error-mock-1',
          id: 'error-mock-1',
          name: 'Mock Device (API Error)',
          serialNumber: 'ERROR001',
          category: 'Test',
          status: 'available' as const,
          location: 'Test Location',
          quantity: 1,
          availableQuantity: 1,
          description: 'Mock device due to API error',
          imageUrl: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      current: params.current || 1,
      pageSize: params.pageSize || 10,
      total: 1,
    };
  }
};

// Lấy chi tiết thiết bị theo ID
export const getDeviceById = async (id: string): Promise<Device> => {
  const response = await axios.get(`/admin/devices/${id}`);
  let device = response.data?.data || response.data;
  return {
    ...device,
    id: device._id || device.id,
  };
};

// Tạo thiết bị mới - Sửa để khớp với backend
export const createDevice = async (device: CreateDeviceRequest): Promise<Device> => {
  try {
    console.log('=== CREATE DEVICE API CALL ===');
    console.log('Data being sent:', device);

    // Validate required fields trước khi gửi
    if (!device.name || !device.serialNumber || !device.category || !device.location) {
      throw new Error('Missing required fields');
    }

    // Prepare data theo format backend expect
    const deviceData = {
      name: device.name.trim(),
      serialNumber: device.serialNumber.trim(),
      category: device.category,
      location: device.location.trim(),
      description: device.description?.trim() || '',
      quantity: Number(device.quantity) || 1,
      availableQuantity: Number(device.quantity) || 1, // Default to quantity
      imageUrl: device.imageUrl?.trim() || '',
    };

    console.log('Processed device data:', deviceData);

    const response = await axios.post('/admin/devices', deviceData);

    console.log('Create device response:', response.data);

    let createdDevice = response.data?.data || response.data;

    return {
      ...createdDevice,
      id: createdDevice._id || createdDevice.id,
    };
  } catch (error: any) {
    console.error('=== CREATE DEVICE ERROR ===');
    console.error('Error:', error);
    console.error('Response data:', error.response?.data);

    // Provide specific error messages
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Dữ liệu không hợp lệ');
    } else if (error.response?.status === 409) {
      throw new Error('Mã số thiết bị đã tồn tại');
    }

    throw error;
  }
};

// Cập nhật thiết bị
export const updateDevice = async (id: string, device: UpdateDeviceRequest): Promise<Device> => {
  try {
    console.log('=== UPDATE DEVICE API CALL ===');
    console.log('Device ID:', id);
    console.log('Update data:', device);

    // Clean data
    const updateData: any = {};
    if (device.name) updateData.name = device.name.trim();
    if (device.serialNumber) updateData.serialNumber = device.serialNumber.trim();
    if (device.category) updateData.category = device.category;
    if (device.location) updateData.location = device.location.trim();
    if (device.description !== undefined) updateData.description = device.description?.trim() || '';
    if (device.quantity !== undefined) updateData.quantity = Number(device.quantity);
    if (device.imageUrl !== undefined) updateData.imageUrl = device.imageUrl?.trim() || '';
    if (device.status) updateData.status = device.status;

    console.log('Processed update data:', updateData);

    const response = await axios.put(`/admin/devices/${id}`, updateData);

    console.log('Update device response:', response.data);

    let updatedDevice = response.data?.data || response.data;

    return {
      ...updatedDevice,
      id: updatedDevice._id || updatedDevice.id,
    };
  } catch (error: any) {
    console.error('=== UPDATE DEVICE ERROR ===');
    console.error('Error:', error);
    console.error('Response data:', error.response?.data);

    if (error.response?.status === 404) {
      throw new Error('Không tìm thấy thiết bị');
    } else if (error.response?.status === 409) {
      throw new Error('Mã số thiết bị đã tồn tại');
    }

    throw error;
  }
};

// Xóa thiết bị
export const deleteDevice = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/admin/devices/${id}`);
  } catch (error) {
    throw error;
  }
};

// Thống kê thiết bị
export const getDeviceStatistics = async (): Promise<DeviceStatistics> => {
  try {
    let response;
    try {
      response = await axios.get('/admin/stats/devices');
    } catch (e) {
      try {
        response = await axios.get('/admin/devices/statistics');
      } catch (e2) {
        // Fallback: calculate from device list
        const devicesResponse = await getDevices();
        const devices = devicesResponse.data;

        return {
          total: devices.length,
          available: devices.filter(d => d.status === 'available').length,
          borrowed: devices.filter(d => d.status === 'borrowed').length,
          maintenance: devices.filter(d => d.status === 'maintenance').length,
          broken: devices.filter(d => d.status === 'broken').length,
          lost: devices.filter(d => d.status === 'lost').length,
        };
      }
    }

    let stats = {
      total: 0,
      available: 0,
      borrowed: 0,
      maintenance: 0,
      broken: 0,
      lost: 0,
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
    return {
      total: 0,
      available: 0,
      borrowed: 0,
      maintenance: 0,
      broken: 0,
      lost: 0,
    };
  }
};
