import React, { useState, useEffect, useRef } from 'react';
import { Layout } from 'antd';
import {
  Card,
  Tag,
  Space,
  Button,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Row,
  Col,
  Pagination,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  LaptopOutlined,
  CameraOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  Device,
  DeviceListParams,
  DeviceListResponse,
} from '@/services/User/device.service';
import { history } from 'umi';

// Create a simple styles object instead of importing
const styles = {
  content: {
    padding: '24px',
    background: '#fff',
    minHeight: '100vh'
  }
};

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Content } = Layout;
const { Search } = Input;

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDevices = async (params: DeviceListParams = {}) => {
    try {
      setLoading(true);
      const response: DeviceListResponse = await getDevices({
        current: params.current || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
        keyword: params.keyword || searchText,
      });
      console.log('API Response for Devices Page:', response);

      // Only update state if component is still mounted
      if (isMounted.current) {
        // Ensure response.data is an array
        const devicesData = Array.isArray(response.data) ? response.data : [];

        // Ensure all required fields are present and have default values
        const processedDevices = devicesData.map(device => ({
          id: device.id || '',
          name: device.name || 'Không có tên',
          serialNumber: device.serialNumber || 'Không có mã số',
          category: device.category || 'Other',
          status: device.status || 'available',
          quantity: typeof device.quantity === 'number' ? device.quantity : 0,
          location: device.location || 'Không có vị trí',
          description: device.description || 'Không có mô tả',
          imageUrl: device.imageUrl || '',
          rating: typeof device.rating === 'number' ? device.rating : 0,
          borrowCount: typeof device.borrowCount === 'number' ? device.borrowCount : 0,
          createdAt: device.createdAt || new Date().toISOString(),
          updatedAt: device.updatedAt || new Date().toISOString(),
        }));

        console.log('Processed Devices before setting state:', processedDevices);
        setDevices(processedDevices);
        setPagination({
          current: typeof response.current === 'number' ? response.current : 1,
          pageSize: typeof response.pageSize === 'number' ? response.pageSize : 10,
          total: typeof response.total === 'number' ? response.total : 0,
        });
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      if (isMounted.current) {
        message.error('Không thể tải danh sách thiết bị');
        setDevices([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || prev.pageSize }));
    fetchDevices({ current: page, pageSize: pageSize || pagination.pageSize, keyword: searchText });
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'available':
        return <Tag icon={<CheckCircleOutlined />} color="success">Sẵn sàng</Tag>;
      case 'borrowed':
        return <Tag icon={<ClockCircleOutlined />} color="processing">Đang sử dụng</Tag>;
      case 'broken':
        return <Tag icon={<CloseCircleOutlined />} color="error">Hỏng</Tag>;
      case 'maintenance':
        return <Tag icon={<ClockCircleOutlined />} color="warning">Bảo trì</Tag>;
      case 'lost':
        return <Tag icon={<CloseCircleOutlined />} color="red">Mất</Tag>;
      default:
        return null;
    }
  };

  const handleViewDetail = (device: Device) => {
    setSelectedDevice(device);
    setIsDetailModalVisible(true);
  };

  console.log('Current pagination state:', pagination);

  return (
    <Content style={styles.content}>
      <Card>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>Quản lý thiết bị</Title>
          <Search
            placeholder="Tìm kiếm thiết bị..."
            enterButton
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </div>

        <Spin spinning={loading}>
          {(!devices || devices.length === 0) && !loading ? (
            <Paragraph>Không tìm thấy thiết bị nào.</Paragraph>
          ) : (
            <Row gutter={[24, 24]}>
              {devices?.map((device) => (
                <Col xs={24} sm={12} md={8} lg={6} xl={6} key={device.id}>
                  <Card
                    hoverable
                    className="device-card"
                    onClick={() => handleViewDetail(device)}
                  >
                    <div className="device-card-content">
                      <div className="device-image-wrapper">
                        {device.imageUrl ? (
                          <img src={device.imageUrl} alt={device.name} className="device-image" />
                        ) : (
                          <div className="device-icon-placeholder">
                            {device.category === 'Laptop' && <LaptopOutlined />}
                            {device.category === 'Camera' && <CameraOutlined />}
                            {device.category === 'Projector' && <VideoCameraOutlined />}
                            {device.category === 'Microphone' && <AudioOutlined />}
                            {device.category === 'Monitor' && <AppstoreOutlined />}
                            {device.category === 'Other' && <AppstoreOutlined />}
                            {!device.category && <AppstoreOutlined />}
                          </div>
                        )}
                      </div>
                      <div className="device-info">
                        <h3>{device.name}</h3>
                        <Paragraph className="device-description">{device.description || 'Không có mô tả'}</Paragraph>
                        <div className="device-stats">
                          {getStatusTag(device.status)}
                          <Tag color="blue">SL: {device.quantity}</Tag>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>

        <Pagination
          current={typeof pagination.current === 'number' ? pagination.current : 1}
          pageSize={typeof pagination.pageSize === 'number' ? pagination.pageSize : 10}
          total={typeof pagination.total === 'number' ? pagination.total : 0}
          onChange={handlePageChange}
          showSizeChanger
          style={{ marginTop: 24, textAlign: 'right' }}
        />

      </Card>

      <Modal
        title="Chi tiết thiết bị"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedDevice && (
          <Card>
            <p><strong>Tên thiết bị:</strong> {selectedDevice.name}</p>
            <p><strong>Mã số:</strong> {selectedDevice.serialNumber}</p>
            <p><strong>Danh mục:</strong> {selectedDevice.category}</p>
            <p><strong>Trạng thái:</strong> {getStatusTag(selectedDevice.status)}</p>
            <p><strong>Vị trí:</strong> {selectedDevice.location}</p>
            <p><strong>Mô tả:</strong> {selectedDevice.description || 'Không có mô tả'}</p>
            <p><strong>Số lượng:</strong> {selectedDevice.quantity}</p>
            <Button type="primary" block style={{ marginTop: 20 }} onClick={() => history.push(`/borrow/${selectedDevice.id}`)}>
              Mượn ngay
            </Button>
          </Card>
        )}
      </Modal>
    </Content>
  );
};

export default DevicesPage;
