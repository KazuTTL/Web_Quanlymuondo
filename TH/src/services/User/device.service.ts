import axios from '@/utils/axios';

export interface Device {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  status: 'available' | 'borrowed' | 'maintenance' | 'broken' | 'lost';
  location: string;
  description?: string;
  quantity: number;
  rating?: number;
  borrowCount?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const mapDeviceFromBE = (device: any): Device => {
  return {
    id: device.id || device._id || device.DeviceID || '',
    name: device.name || device.TenThietBi || '',
    serialNumber: device.serialNumber || device.SerialNumber || '',
    category: device.category || device.DanhMuc || device.TenDanhMuc || 'Other',
    status: device.status || device.TrangThai || 'available',
    location: device.location || device.ViTri || '',
    description: device.description || device.MoTa || '',
    quantity: device.quantity || device.availableQuantity || device.SoLuongKhaDung || 0,
    rating: device.rating || 0,
    borrowCount: device.borrowCount || device.SoLuotMuon || 0,
    imageUrl: device.imageUrl || device.HinhAnh || '',
    createdAt: device.createdAt || device.NgayTao || new Date().toISOString(),
    updatedAt: device.updatedAt || device.NgayCapNhat || new Date().toISOString(),
  };
};

export interface DeviceListParams {
  current?: number;
  pageSize?: number;
  keyword?: string;
}

export interface DeviceListResponse {
  data: Device[];
  current: number;
  pageSize: number;
  total: number;
}

export interface DeviceStatistics {
  total: number;
  available: number;
  borrowed: number;
  maintenance: number;
  broken: number;
}

export const getDevices = async (params: DeviceListParams = {}): Promise<DeviceListResponse> => {
  const axiosResponse = await axios.get('/user/devices', { params });
  const rawData = Array.isArray(axiosResponse.data) ? axiosResponse.data : [];
  const data = rawData.map(mapDeviceFromBE);

  const total = data.length;
  const current = params.current || 1;
  const pageSize = params.pageSize || 10;

  return {
    data: data,
    current: current,
    pageSize: pageSize,
    total: total,
  };
};

export const getDeviceById = async (id: string): Promise<Device> => {
  const response = await axios.get(`/user/devices/${id}`);
  return mapDeviceFromBE(response.data);
};

export const getDeviceStatistics = async (): Promise<DeviceStatistics> => {
  const response = await axios.get('/user/devices/statistics');
  return response.data;
};

export const createDevice = async (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<Device> => {
  const response = await axios.post('/user/devices', device);
  return response.data;
};

export const updateDevice = async (id: string, device: Partial<Omit<Device, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Device> => {
  const response = await axios.put(`/user/devices/${id}`, device);
  return response.data;
};

export const deleteDevice = async (id: string): Promise<void> => {
  await axios.delete(`/user/devices/${id}`);
};
