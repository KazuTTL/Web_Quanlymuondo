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
  Descriptions,
  Image,
} from 'antd';
import {
  EyeOutlined,
  ReloadOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getAllBorrowRequests,
  getBorrowRequestById,
  returnDevice,
  BorrowRequest,
  BorrowRequestParams,
} from '@/services/admin/borrow-request.service';

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const ApprovedBorrowRequests: React.FC = () => {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch approved requests với validation
  const fetchRequests = async () => {
    setLoading(true);
    console.log('=== FETCHING APPROVED REQUESTS ===');

    try {
      // Validate auth
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || role !== 'admin') {
        message.error('Không có quyền truy cập');
        return;
      }

      const params: BorrowRequestParams = {
        current: pagination.current,
        pageSize: pagination.pageSize,
        status: 'approved', // Chỉ lấy approved requests
        keyword: searchKeyword.trim() || undefined,
      };

      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const response = await getAllBorrowRequests(params);

      if (!response || !Array.isArray(response.data)) {
        throw new Error('Invalid response from server');
      }

      // Filter approved requests
      const approvedRequests = response.data.filter(req => req.status === 'approved');

      setRequests(approvedRequests);
      setPagination(prev => ({
        ...prev,
        total: response.total || approvedRequests.length,
      }));

      if (approvedRequests.length === 0) {
        message.info('Không có yêu cầu đã duyệt nào');
      }

    } catch (error: any) {
      console.error('Error fetching approved requests:', error);
      setRequests([]);
      setPagination(prev => ({ ...prev, total: 0 }));
      message.error('Không thể tải danh sách yêu cầu đã duyệt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchRequests, 100);
    return () => clearTimeout(timer);
  }, [pagination.current, pagination.pageSize, searchKeyword, dateRange]);

  // Get status tag
  const getStatusTag = (status: BorrowRequest['status']) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Chờ duyệt' },
      approved: { color: 'green', text: 'Đã duyệt' },
      rejected: { color: 'red', text: 'Từ chối' },
      cancelled: { color: 'gray', text: 'Đã hủy' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Get overdue status
  const getOverdueStatus = (returnDate: string) => {
    const today = new Date();
    const returnDay = new Date(returnDate);
    const diffDays = Math.ceil((today.getTime() - returnDay.getTime()) / (1000 * 3600 * 24));

    if (diffDays > 0) {
      return <Tag color="red">Quá hạn {diffDays} ngày</Tag>;
    } else if (diffDays === 0) {
      return <Tag color="orange">Hôm nay phải trả</Tag>;
    } else if (diffDays >= -3) {
      return <Tag color="yellow">Sắp đến hạn</Tag>;
    }
    return null;
  };

  // Table columns
  const columns: ColumnsType<BorrowRequest> = [
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
      title: 'Ngày trả',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date, record) => (
        <div>
          <div>{new Date(date).toLocaleDateString('vi-VN')}</div>
          {getOverdueStatus(date)}
        </div>
      ),
    },
    {
      title: 'Mục đích',
      dataIndex: 'purpose',
      key: 'purpose',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày duyệt',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: true,
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 180,
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
          <Popconfirm
            title={
              <>
                Xác nhận trả thiết bị?
                <br />
                Bạn có chắc chắn thiết bị đã được trả?
              </>
            }
            onConfirm={() => handleReturnDevice(record._id)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              size="small"
              icon={<UndoOutlined />}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Trả thiết bị
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Handle functions
  const handleViewDetail = async (request: BorrowRequest) => {
    try {
      const detailRequest = await getBorrowRequestById(request._id);
      setSelectedRequest(detailRequest);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('Không thể tải chi tiết yêu cầu');
    }
  };

  const handleReturnDevice = async (id: string) => {
    try {
      await returnDevice(id);
      message.success('Đã xác nhận trả thiết bị thành công');
      fetchRequests();
    } catch (error) {
      message.error('Không thể xác nhận trả thiết bị');
    }
  };

  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Calculate statistics
  const overdueCount = requests.filter(r => {
    const today = new Date();
    const returnDay = new Date(r.returnDate);
    return today > returnDay;
  }).length;

  const dueSoonCount = requests.filter(r => {
    const today = new Date();
    const returnDay = new Date(r.returnDate);
    const diffDays = Math.ceil((returnDay.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  const handleReject = async (id: string) => {
    try {
      await rejectRequest(id);
      message.success('Đã từ chối yêu cầu mượn');
      fetchRequests();
    } catch (error) {
      message.error('Không thể từ chối yêu cầu');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveRequest(id);
      message.success('Đã duyệt yêu cầu mượn thành công');
      fetchRequests();
    } catch (error) {
      message.error('Không thể duyệt yêu cầu');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Yêu cầu đã duyệt</Title>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đã duyệt"
              value={pagination.total}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={overdueCount}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sắp đến hạn"
              value={dueSoonCount}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang mượn"
              value={pagination.total - overdueCount}
              valueStyle={{ color: '#1890ff' }}
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
            <Col span={8}>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRequests}
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
          dataSource={requests}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu đã duyệt"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedRequest && (
            <Popconfirm
              key="return"
              title={
                <>
                  Xác nhận trả thiết bị?
                  <br />
                  Bạn có chắc chắn thiết bị đã được trả?
                </>
              }
              onConfirm={() => {
                handleReturnDevice(selectedRequest._id);
                setDetailModalVisible(false);
              }}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button type="primary" icon={<UndoOutlined />}>
                Trả thiết bị
              </Button>
            </Popconfirm>
          ),
        ]}
        width={800}
      >
        {selectedRequest && (
          <Descriptions title="Thông tin yêu cầu" bordered column={2}>
            <Descriptions.Item label="Trạng thái" span={2}>
              {getStatusTag(selectedRequest.status)}
              {getOverdueStatus(selectedRequest.returnDate)}
            </Descriptions.Item>

            <Descriptions.Item label="Người mượn">
              {selectedRequest.user.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedRequest.user.email}
            </Descriptions.Item>

            <Descriptions.Item label="Số điện thoại">
              {selectedRequest.user.phone || 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Mã sinh viên">
              {selectedRequest.user.studentId || 'Chưa có'}
            </Descriptions.Item>

            <Descriptions.Item label="Thiết bị" span={2}>
              <Space>
                {selectedRequest.device.imageUrl && (
                  <Image
                    src={selectedRequest.device.imageUrl}
                    alt={selectedRequest.device.name}
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 500 }}>{selectedRequest.device.name}</div>
                  <div style={{ color: '#666' }}>Mã: {selectedRequest.device.serialNumber}</div>
                  <div style={{ color: '#666' }}>Loại: {selectedRequest.device.category}</div>
                </div>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Ngày mượn">
              {new Date(selectedRequest.borrowDate).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày trả">
              {new Date(selectedRequest.returnDate).toLocaleDateString('vi-VN')}
            </Descriptions.Item>

            <Descriptions.Item label="Mục đích" span={2}>
              {selectedRequest.purpose}
            </Descriptions.Item>

            {selectedRequest.note && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedRequest.note}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày duyệt">
              {new Date(selectedRequest.updatedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ApprovedBorrowRequests;
