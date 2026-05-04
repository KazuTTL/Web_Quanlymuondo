import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Space, Button, message, Descriptions, Spin } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getUserBorrowRequests, BorrowRequest } from '@/services/User/borrow-request.service';

const { Title } = Typography;

const MyRequests: React.FC = () => {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getUserBorrowRequests({
        current: pagination.current,
        pageSize: pagination.pageSize,
      });
      
      console.log('My Requests Response:', response);
      setRequests(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total
      }));
    } catch (error) {
      console.error('Error fetching requests:', error);
      message.error('Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [pagination.current, pagination.pageSize]);

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Chờ duyệt' },
      approved: { color: 'green', text: 'Đã duyệt' },
      rejected: { color: 'red', text: 'Từ chối' },
    };
    const tag = config[status] || { color: 'default', text: status };
    return <Tag color={tag.color}>{tag.text}</Tag>;
  };

  const columns: ColumnsType<BorrowRequest> = [
    {
      title: 'Thiết bị',
      key: 'device',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.device?.name || 'Unknown'}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.device?.serialNumber}</div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Ngày trả',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedRequest(record);
            setDetailModalVisible(true);
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>Yêu cầu của tôi</Title>
          <Button icon={<ReloadOutlined />} onClick={fetchRequests}>
            Làm mới
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="_id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
            }}
            onChange={(newPagination) => {
              setPagination({
                ...pagination,
                current: newPagination.current || 1,
                pageSize: newPagination.pageSize || 10,
              });
            }}
            locale={{
              emptyText: loading ? 'Đang tải...' : 'Chưa có yêu cầu mượn nào',
            }}
          />
        </Spin>
      </Card>

      {selectedRequest && (
        <Card 
          title="Chi tiết yêu cầu mượn"
          style={{ marginTop: 16 }}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>
          ]}
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Thiết bị">
              {selectedRequest.device?.name} ({selectedRequest.device?.serialNumber})
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">{selectedRequest.quantity}</Descriptions.Item>
            <Descriptions.Item label="Ngày mượn">
              {selectedRequest.borrowDate ? new Date(selectedRequest.borrowDate).toLocaleDateString('vi-VN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày trả dự kiến">
              {selectedRequest.returnDate ? new Date(selectedRequest.returnDate).toLocaleDateString('vi-VN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedRequest.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Mục đích">{selectedRequest.purpose || '-'}</Descriptions.Item>
            {selectedRequest.note && (
              <Descriptions.Item label="Ghi chú">{selectedRequest.note}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default MyRequests;