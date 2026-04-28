import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Typography, Card, Layout, Button, message } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer } from '@ant-design/pro-layout';
import { getUserBorrowRequests, cancelBorrowRequest, type BorrowRequest } from '@/services/User/borrow-request.service';
import dayjs from 'dayjs';
import styles from './index.less';

const { Title } = Typography;
const { Content } = Layout;

const getStatusTag = (status: string) => {
  switch (status) {
    case 'pending':
      return <Tag icon={<ClockCircleOutlined />} color="processing">Đang chờ duyệt</Tag>;
    case 'approved':
      return <Tag icon={<CheckCircleOutlined />} color="success">Đã duyệt</Tag>;
    case 'rejected':
      return <Tag icon={<CloseCircleOutlined />} color="error">Từ chối</Tag>;
    case 'returned':
      return <Tag icon={<CheckCircleOutlined />} color="default">Đã trả</Tag>;
    default:
      return null;
  }
};

const HistoryPage: React.FC = () => {
  const [data, setData] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchBorrowRequests = async (params: any = {}) => {
    try {
      setLoading(true);
      const response = await getUserBorrowRequests({
        current: params.current || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
      });

      setData(response.data);
      setPagination({
        current: response.current,
        pageSize: response.pageSize,
        total: response.total,
      });
    } catch (error) {
      console.error('Error fetching borrow requests:', error);
      message.error('Không thể tải lịch sử mượn thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowRequests();
  }, []);

  const handleTableChange = (paginationParams: any) => {
    fetchBorrowRequests({
      current: paginationParams.current,
      pageSize: paginationParams.pageSize,
    });
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelBorrowRequest(id);
      message.success('Hủy yêu cầu thành công');
      fetchBorrowRequests();
    } catch (error) {
      message.error('Không thể hủy yêu cầu');
    }
  };

  const columns: ColumnsType<BorrowRequest> = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => id.substring(0, 8),
    },
    {
      title: 'Tên thiết bị',
      dataIndex: ['device', 'name'],
      key: 'deviceName',
      width: 200,
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày trả',
      dataIndex: 'returnDate',
      key: 'returnDate',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: BorrowRequest) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleCancel(record.id)}
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Content className={styles.content}>
      <PageContainer>
        <div className={styles.container}>
          <Card className={styles.historyCard}>
            <Title level={2} className={styles.title}>Lịch sử mượn thiết bị</Title>
            <Table
              columns={columns}
              dataSource={data}
              loading={loading}
              rowKey="id"
              className={styles.table}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} bản ghi`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </div>
      </PageContainer>
    </Content>
  );
};

export default HistoryPage;
