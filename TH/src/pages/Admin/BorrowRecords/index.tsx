import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Typography,
  Input,
  DatePicker,
  Select,
  Descriptions,
  Image,
  Tooltip,
  Alert,
} from 'antd';
import {
  EyeOutlined,
  ReloadOutlined,
  UndoOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getAllBorrowRecords,
  getBorrowRecordById,
  confirmReturnDevice,
  getBorrowRecordStatistics,
  sendReminderEmail,
  BorrowRecord,
  BorrowRecordQuery,
  BorrowRecordStatistics,
} from '@/services/admin/borrow-record.service';
import { approveRequest, rejectRequest } from '@/services/admin/borrow-request.service';

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const BorrowRecordsManagement: React.FC = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [statistics, setStatistics] = useState<BorrowRecordStatistics>({
    totalBorrowed: 0,
    totalReturned: 0,
    totalOverdue: 0,
    dueSoon: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch records and statistics với validation
  const fetchRecords = async () => {
    setLoading(true);
    console.log('=== FETCHING BORROW RECORDS ===');

    try {
      // Validate auth
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token) {
        message.error('Phiên đăng nhập đã hết hạn');
        return;
      }

      if (role !== 'admin') {
        message.error('Không có quyền truy cập');
        return;
      }

      const params: BorrowRecordQuery = {
        current: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchKeyword.trim() || undefined,
        status: statusFilter || undefined,
      };

      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      console.log('Fetching borrow records with params:', params);

      const response = await getAllBorrowRecords(params);

      console.log('Borrow records response:', response);
      console.log('Records data:', response.data);

      if (!response || !Array.isArray(response.data)) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }

      setRecords(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
      }));

      // Set statistics from response
      if (response.statistics) {
        console.log('Using provided statistics:', response.statistics);
        setStatistics(response.statistics);
      }

      if (response.data.length === 0) {
        message.info('Không có bản ghi mượn trả nào');
      }

    } catch (error: any) {
      console.error('Error fetching borrow records:', error);

      // Reset state on error
      setRecords([]);
      setPagination(prev => ({ ...prev, total: 0 }));
      setStatistics({
        totalBorrowed: 0,
        totalReturned: 0,
        totalOverdue: 0,
        dueSoon: 0,
      });

      if (error.message?.includes('token')) {
        message.error('Phiên đăng nhập đã hết hạn');
      } else {
        message.error('Không thể lấy danh sách mượn trả: ' + (error.message || 'Lỗi không xác định'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchRecords, 100);
    return () => clearTimeout(timer);
  }, [pagination.current, pagination.pageSize, searchKeyword, dateRange, statusFilter]);

  // Get status tag
  const getStatusTag = (status: BorrowRecord['status'], returnDate: string) => {
    const today = new Date();
    const dueDate = new Date(returnDate);
    const diffDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));

    switch (status) {
      case 'returned':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Đã trả</Tag>;
      case 'overdue':
        return <Tag color="red" icon={<ExclamationCircleOutlined />}>Quá hạn {diffDays} ngày</Tag>;
      case 'borrowed':
        if (diffDays > 0) {
          return <Tag color="red" icon={<ExclamationCircleOutlined />}>Quá hạn {diffDays} ngày</Tag>;
        } else if (diffDays === 0) {
          return <Tag color="orange" icon={<ClockCircleOutlined />}>Hôm nay phải trả</Tag>;
        } else if (diffDays >= -3) {
          return <Tag color="yellow" icon={<WarningOutlined />}>Sắp đến hạn</Tag>;
        }
        return <Tag color="blue" icon={<ClockCircleOutlined />}>Đang mượn</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Table columns
  const columns: ColumnsType<BorrowRecord> = [
    {
      title: 'Người mượn',
      dataIndex: ['user', 'name'],
      key: 'userName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.user.studentId || record.user.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Thiết bị',
      dataIndex: ['device', 'name'],
      key: 'deviceName',
      render: (text, record) => (
        <Space>
          {record.device.imageUrl && (
            <Image
              src={record.device.imageUrl}
              alt={text}
              width={40}
              height={40}
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {record.device.serialNumber}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: true,
    },
    {
      title: 'Ngày trả dự kiến',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: true,
    },
    {
      title: 'Ngày trả thực tế',
      dataIndex: 'actualReturnDate',
      key: 'actualReturnDate',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa trả',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => getStatusTag(status, record.returnDate),
      filters: [
        { text: 'Đang mượn', value: 'borrowed' },
        { text: 'Đã trả', value: 'returned' },
        { text: 'Quá hạn', value: 'overdue' },
      ],
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>

          {record.status !== 'returned' && (
            <>
              <Tooltip title="Gửi email nhắc nhở">
                <Button
                  size="small"
                  icon={<MailOutlined />}
                  onClick={() => handleSendReminder(record._id)}
                >
                  Nhắc nhở
                </Button>
              </Tooltip>

              <Popconfirm
                title="Bạn có chắc chắn thiết bị đã được trả?"
                onConfirm={() => handleConfirmReturn(record._id)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button type="link">Xác nhận trả</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Handle functions
  const handleViewDetail = async (record: BorrowRecord) => {
    try {
      const detailRecord = await getBorrowRecordById(record._id);
      setSelectedRecord(detailRecord);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('Không thể tải chi tiết bản ghi');
    }
  };

  const handleConfirmReturn = async (id: string) => {
    try {
      await confirmReturnDevice(id);
      message.success('Đã xác nhận trả thiết bị thành công. Số lượng thiết bị đã được cập nhật.');
      fetchRecords();
    } catch (error) {
      message.error('Không thể xác nhận trả thiết bị');
    }
  };

  const handleSendReminder = async (id: string) => {
    try {
      await sendReminderEmail(id);
      message.success('Đã gửi email nhắc nhở thành công');
    } catch (error) {
      message.error('Không thể gửi email nhắc nhở');
    }
  };

  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });

    if (filters.status) {
      setStatusFilter(filters.status[0] || '');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý bản ghi mượn trả</Title>

      {/* Alert for overdue items - Safe check */}
      {statistics && statistics.totalOverdue > 0 && (
        <Alert
          message={`Có ${statistics.totalOverdue} thiết bị đang quá hạn trả!`}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" danger>
              Xem chi tiết
            </Button>
          }
        />
      )}

      {/* Statistics - Safe rendering */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đang mượn"
              value={statistics?.totalBorrowed || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã trả"
              value={statistics?.totalReturned || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={statistics?.totalOverdue || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sắp đến hạn"
              value={statistics?.dueSoon || 0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Search
                placeholder="Tìm kiếm theo tên người dùng, thiết bị..."
                allowClear
                onSearch={setSearchKeyword}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={8}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Từ ngày', 'Đến ngày']}
                onChange={(dates) => setDateRange(dates || [])}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Trạng thái"
                allowClear
                style={{ width: '100%' }}
                onChange={setStatusFilter}
              >
                <Option value="borrowed">Đang mượn</Option>
                <Option value="returned">Đã trả</Option>
                <Option value="overdue">Quá hạn</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRecords}
                style={{ width: '100%' }}
              >
                Làm mới
              </Button>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={records}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          rowClassName={(record) => {
            const today = new Date();
            const dueDate = new Date(record.returnDate);
            const diffDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));

            if (record.status !== 'returned' && diffDays > 0) {
              return 'overdue-row';
            }
            return '';
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết bản ghi mượn trả"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedRecord && selectedRecord.status !== 'returned' && (
            <Space key="actions">
              <Button
                icon={<MailOutlined />}
                onClick={() => {
                  handleSendReminder(selectedRecord._id);
                  setDetailModalVisible(false);
                }}
              >
                Gửi nhắc nhở
              </Button>
              <Popconfirm
                title="Xác nhận trả thiết bị?"
                onConfirm={() => {
                  handleConfirmReturn(selectedRecord._id);
                  setDetailModalVisible(false);
                }}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button type="primary" icon={<UndoOutlined />}>
                  Xác nhận trả
                </Button>
              </Popconfirm>
            </Space>
          ),
        ]}
        width={800}
      >
        {selectedRecord && (
          <Descriptions title="Thông tin bản ghi" bordered column={2}>
            <Descriptions.Item label="Trạng thái" span={2}>
              {getStatusTag(selectedRecord.status, selectedRecord.returnDate)}
            </Descriptions.Item>

            <Descriptions.Item label="Người mượn">
              {selectedRecord.user.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedRecord.user.email}
            </Descriptions.Item>

            <Descriptions.Item label="Số điện thoại">
              {selectedRecord.user.phone || 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Mã sinh viên">
              {selectedRecord.user.studentId || 'Chưa có'}
            </Descriptions.Item>

            <Descriptions.Item label="Thiết bị" span={2}>
              <Space>
                {selectedRecord.device.imageUrl && (
                  <Image
                    src={selectedRecord.device.imageUrl}
                    alt={selectedRecord.device.name}
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 500 }}>{selectedRecord.device.name}</div>
                  <div style={{ color: '#666' }}>Mã: {selectedRecord.device.serialNumber}</div>
                  <div style={{ color: '#666' }}>Loại: {selectedRecord.device.category}</div>
                </div>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Ngày mượn">
              {new Date(selectedRecord.borrowDate).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày trả dự kiến">
              {new Date(selectedRecord.returnDate).toLocaleDateString('vi-VN')}
            </Descriptions.Item>

            {selectedRecord.actualReturnDate && (
              <Descriptions.Item label="Ngày trả thực tế" span={2}>
                {new Date(selectedRecord.actualReturnDate).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Mục đích" span={2}>
              {selectedRecord.borrowRequest.purpose}
            </Descriptions.Item>

            {selectedRecord.note && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedRecord.note}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedRecord.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {new Date(selectedRecord.updatedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <style>
        {`
          .overdue-row {
            background-color: #fff2f0 !important;
          }
          .overdue-row:hover {
            background-color: #ffebe6 !important;
          }
        `}
      </style>
    </div>
  );
};

export default BorrowRecordsManagement;
