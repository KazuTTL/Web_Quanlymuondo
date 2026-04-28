import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Descriptions,
  Form,
  DatePicker,
  Typography,
  message,
  Image,
  InputNumber
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { getDevices, Device } from '@/services/device.service';
import { createBorrowRequest } from '@/services/borrow-request.service';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal states
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchDevices = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        current: page,
        pageSize,
        ...(searchText && { search: searchText }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      };

      const response = await getDevices(params);

      if (response && response.data) {
        setDevices(response.data);
        setPagination({
          current: response.current || page,
          pageSize: response.pageSize || pageSize,
          total: response.total || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      message.error('Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleSearch = () => {
    fetchDevices(1, pagination.pageSize);
  };

  const handleTableChange = (newPagination: any) => {
    fetchDevices(newPagination.current, newPagination.pageSize);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'available':
        return <Tag color="success">Có sẵn</Tag>;
      case 'borrowed':
        return <Tag color="processing">Đang mượn</Tag>;
      case 'maintenance':
        return <Tag color="warning">Bảo trì</Tag>;
      case 'broken':
        return <Tag color="error">Hỏng</Tag>;
      case 'lost':
        return <Tag color="red">Mất</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const handleViewDetail = (device: Device) => {
    setSelectedDevice(device);
    setIsDetailModalVisible(true);
  };

  const handleBorrowSubmit = async (values: any) => {
    if (!selectedDevice) return;

    try {
      setSubmitting(true);
      const [borrowDate, returnDate] = values.dateRange;

      // Validate dates
      if (borrowDate.isAfter(returnDate)) {
        message.error('Ngày trả phải sau ngày mượn');
        return;
      }

      // Validate borrow duration (max 7 days)
      const duration = returnDate.diff(borrowDate, 'day');
      if (duration > 7) {
        message.error('Thời gian mượn không được quá 7 ngày');
        return;
      }

      await createBorrowRequest({
        deviceId: selectedDevice._id || selectedDevice.id,
        borrowDate: borrowDate.format('YYYY-MM-DD'),
        returnDate: returnDate.format('YYYY-MM-DD'),
        purpose: values.purpose,
      });

      message.success('Gửi yêu cầu mượn thành công! Yêu cầu đang chờ duyệt.');
      setIsDetailModalVisible(false);
      form.resetFields();

      // Refresh device list to update status if needed
      fetchDevices(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error('Borrow request error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể gửi yêu cầu mượn';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (imageUrl: string, record: Device) => (
        <Image
          width={50}
          height={50}
          src={imageUrl}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYSFW..."
          alt={record.name}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      key: 'name',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: Device) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Mã số',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Laptop', value: 'Laptop' },
        { text: 'Camera', value: 'Camera' },
        { text: 'Projector', value: 'Projector' },
        { text: 'Microphone', value: 'Microphone' },
        { text: 'Monitor', value: 'Monitor' },
        { text: 'Other', value: 'Other' },
      ],
      filteredValue: categoryFilter ? [categoryFilter] : null,
      onFilter: (value: any, record: Device) => record.category === value,
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_, record: Device) => (
        <Space direction="vertical" size="small">
          <Tag color="blue">Tổng: {record.quantity || 1}</Tag>
          <Tag color={(record.availableQuantity || 0) > 0 ? 'green' : 'red'}>
            Còn: {record.availableQuantity || 0}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Có sẵn', value: 'available' },
        { text: 'Đang mượn', value: 'borrowed' },
        { text: 'Bảo trì', value: 'maintenance' },
        { text: 'Hỏng', value: 'broken' },
        { text: 'Mất', value: 'lost' },
      ],
      filteredValue: statusFilter ? [statusFilter] : null,
      onFilter: (value: any, record: Device) => record.status === value,
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Device) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="Tìm kiếm thiết bị..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
              suffix={<SearchOutlined />}
            />
            <Select
              placeholder="Chọn trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: 150 }}
            >
              <Option value="available">Có sẵn</Option>
              <Option value="borrowed">Đang mượn</Option>
              <Option value="maintenance">Bảo trì</Option>
              <Option value="broken">Hỏng</Option>
              <Option value="lost">Mất</Option>
            </Select>
            <Select
              placeholder="Chọn danh mục"
              value={categoryFilter}
              onChange={setCategoryFilter}
              allowClear
              style={{ width: 150 }}
            >
              <Option value="Laptop">Laptop</Option>
              <Option value="Camera">Camera</Option>
              <Option value="Projector">Projector</Option>
              <Option value="Microphone">Microphone</Option>
              <Option value="Monitor">Monitor</Option>
              <Option value="Other">Other</Option>
            </Select>
            <Button type="primary" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={devices}
          rowKey={(record) => record._id || record.id}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} thiết bị`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Detail Modal with Borrow Form */}
      <Modal
        title="Chi tiết thiết bị"
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedDevice && (
          <div>
            {/* Device Image Section */}
            {selectedDevice.imageUrl && (
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Image
                  width={300}
                  src={selectedDevice.imageUrl}
                  alt={selectedDevice.name}
                  style={{ borderRadius: 8 }}
                />
              </div>
            )}

            {/* Device Details Section */}
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Tên thiết bị" span={2}>
                {selectedDevice.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mã số">
                {selectedDevice.serialNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {selectedDevice.category}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedDevice.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Vị trí">
                {selectedDevice.location}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng tổng">
                <Tag color="blue">{selectedDevice.quantity || 1} thiết bị</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng có sẵn">
                <Tag color={(selectedDevice.availableQuantity || 0) > 0 ? 'green' : 'red'}>
                  {selectedDevice.availableQuantity || 0} thiết bị
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {selectedDevice.description || 'Không có mô tả'}
              </Descriptions.Item>
            </Descriptions>

            {/* Borrow Form Section */}
            {selectedDevice.status === 'available' && (selectedDevice.availableQuantity || 0) > 0 ? (
              <div>
                <Typography.Title level={4} style={{ marginBottom: 16 }}>
                  Đăng ký mượn thiết bị
                </Typography.Title>
                <Form form={form} onFinish={handleBorrowSubmit} layout="vertical">
                  <Form.Item
                    label="Thời gian mượn"
                    name="dateRange"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng chọn thời gian mượn',
                      },
                    ]}
                  >
                    <RangePicker
                      style={{ width: '100%' }}
                      disabledDate={(current) => {
                        return current && current < dayjs().startOf('day');
                      }}
                      placeholder={['Ngày mượn', 'Ngày trả']}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Số lượng mượn"
                    name="quantity"
                    initialValue={1}
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập số lượng',
                      },
                      {
                        type: 'number',
                        min: 1,
                        max: selectedDevice.availableQuantity || 1,
                        message: `Số lượng phải từ 1 đến ${selectedDevice.availableQuantity || 1}`,
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={selectedDevice.availableQuantity || 1}
                      style={{ width: '100%' }}
                      placeholder="Nhập số lượng thiết bị cần mượn"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Mục đích sử dụng"
                    name="purpose"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập mục đích sử dụng',
                      },
                      {
                        min: 10,
                        message: 'Mục đích sử dụng phải có ít nhất 10 ký tự',
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Mô tả chi tiết mục đích sử dụng thiết bị..."
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={submitting}
                      size="large"
                      style={{ marginTop: 8 }}
                    >
                      Đăng ký mượn ngay
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Typography.Text type="secondary">
                  Thiết bị này hiện không khả dụng để mượn
                  {(selectedDevice.availableQuantity || 0) === 0 && ' (Hết số lượng)'}
                </Typography.Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeviceManagement;
