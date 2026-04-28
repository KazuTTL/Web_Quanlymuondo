import React, { useState, useRef } from 'react';
import { Button, Popconfirm, message, Modal, DatePicker, Avatar, Tag } from 'antd';
import { ProTable, ProColumns, ActionType, PageContainer } from '@ant-design/pro-components';
import { getAllBorrowRecords, updateState } from '@/services/admin/borrow-record.service';
import { EyeOutlined } from '@ant-design/icons';
import styles from './index.less';
import type { Dayjs } from 'dayjs';
// XÓA: Bỏ import SortOrder không dùng đến
// import type { SortOrder } from 'antd/lib/table/interface';

const { RangePicker } = DatePicker;

// Định nghĩa kiểu dữ liệu cho một bản ghi
interface BorrowRecordItem {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: {
      url: string;
    };
  };
  device: {
    _id: string;
    name: string;
  };
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  state: 'BORROWING' | 'RETURNED' | 'OVERDUE' | 'PENDING' | 'REJECTED';
}

// Định nghĩa kiểu cho params từ ProTable để bao gồm cả các trường tìm kiếm
// Thêm [key: string]: any để linh hoạt hơn
type TableQueryParams = {
  current?: number;
  pageSize?: number;
  'user.name'?: string;
  'device.name'?: string;
  [key: string]: any;
};


const OverdueBorrowRecords = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecordItem | null>(null);
  const actionRef = useRef<ActionType>();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const showModal = (record: BorrowRecordItem) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleReturnDevice = async (recordId: string) => {
    try {
      await updateState(recordId, { state: 'RETURNED' });
      message.success('Đã xác nhận trả thiết bị thành công!');
      actionRef.current?.reload();
    } catch (error) {
      message.error('Xác nhận trả thiết bị thất bại!');
    }
  };

  const columns: ProColumns<BorrowRecordItem>[] = [
    {
      title: 'STT',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: 'Ảnh',
      dataIndex: ['user', 'avatar', 'url'],
      render: (_: unknown, record: BorrowRecordItem) => <Avatar src={record.user?.avatar?.url} />,
      search: false,
    },
    {
      title: 'Người mượn',
      dataIndex: 'user.name',
    },
    {
      title: 'Thiết bị',
      dataIndex: 'device.name',
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowedAt',
      valueType: 'date',
      sorter: true,
      search: false,
    },
    {
      title: 'Hạn trả',
      dataIndex: 'dueDate',
      valueType: 'date',
      sorter: true,
      search: false,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'state',
      valueEnum: {
        OVERDUE: { text: 'Quá hạn', status: 'Error' },
        BORROWING: { text: 'Đang mượn', status: 'Processing' },
        RETURNED: { text: 'Đã trả', status: 'Success' },
        PENDING: { text: 'Chờ duyệt', status: 'Warning' },
        REJECTED: { text: 'Từ chối', status: 'Default' },
      },
    },
    {
      title: 'Tùy chọn',
      valueType: 'option',
      key: 'option',
      render: (_: unknown, record: BorrowRecordItem) => [
        <Button key="view" type="primary" icon={<EyeOutlined />} onClick={() => showModal(record)}>
          Xem
        </Button>,
        <Popconfirm
          key="return"
          title="Xác nhận người dùng đã trả thiết bị này?"
          onConfirm={() => handleReturnDevice(record._id)}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Button type="primary">Xác nhận trả</Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<BorrowRecordItem, TableQueryParams>
        columns={columns}
        actionRef={actionRef}
        request={async (params: TableQueryParams, sort: Record<string, 'ascend' | 'descend' | null>, _filter: Record<string, (string | number)[] | null>) => {
        const query: { [key: string]: any } = {
        page: params.current,
        limit: params.pageSize,
        state: 'OVERDUE',
        'user.name_like': params['user.name'],
        'device.name_like': params['device.name'],
        };

        if (dateRange) {
        query.borrowedAt_gte = dateRange[0].startOf('day').toISOString();
        query.borrowedAt_lte = dateRange[1].endOf('day').toISOString();
        }

        if (sort) {
        for (const key in sort) {
            if (sort[key]) {
            query.sort = sort[key] === 'ascend' ? key : `-${key}`;
            }
        }
        }

        // Dùng `any` để bỏ qua lỗi type checking không nhất quán
        const res: any = await getAllBorrowRecords(query);

        // Dùng optional chaining (?.) để truy cập an toàn vào dữ liệu lồng nhau
        // Dựa trên phân tích, cấu trúc đúng là res.data.docs
        const records = res?.data?.docs || [];
        const total = res?.data?.totalDocs || 0;

        return {
        data: records,
        success: true,
        total: total,
        };
    }}
        rowKey="_id"
        headerTitle="Danh sách mượn đồ quá hạn"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <RangePicker onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)} />,
        ]}
      />
      {selectedRecord && (
        <Modal
          title="Chi tiết mượn đồ"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[<Button key="back" onClick={handleCancel}>Đóng</Button>]}
          width={800}
        >
          <div className={styles.modalContent}>
            <p><strong>Người mượn:</strong> {selectedRecord.user.name}</p>
            <p><strong>Thiết bị:</strong> {selectedRecord.device.name}</p>
            <p><strong>Ngày mượn:</strong> {new Date(selectedRecord.borrowedAt).toLocaleDateString()}</p>
            <p><strong>Hạn trả:</strong> {new Date(selectedRecord.dueDate).toLocaleDateString()}</p>
            <p><strong>Trạng thái:</strong> <Tag color="red">Quá hạn</Tag></p>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default OverdueBorrowRecords;
