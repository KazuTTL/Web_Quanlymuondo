import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'umi';
import { Layout, Card, Form, Input, DatePicker, Button, InputNumber, Typography, message, Descriptions, Spin, Result } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { getDeviceById, Device } from '@/services/User/device.service';
import { createBorrowRequest, CreateBorrowRequestData } from '@/services/User/borrow-request.service';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Content } = Layout;

const BorrowPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const history = useHistory();
  const [form] = Form.useForm();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const data = await getDeviceById(deviceId);
        setDevice(data);
      } catch (error) {
        message.error('Không tải được thông tin thiết bị');
        history.push('/app/devices');
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [deviceId]);

  const onFinish = async (values: any) => {
    if (!device) return;
    
    setSubmitting(true);
    try {
      const requestData: CreateBorrowRequestData = {
        deviceId: deviceId,
        borrowDate: values.dates[0].format('YYYY-MM-DD'),
        returnDate: values.dates[1].format('YYYY-MM-DD'),
        quantity: values.quantity,
        purpose: values.purpose || '',
      };

      await createBorrowRequest(requestData);
      setSuccess(true);
      message.success('Gửi yêu cầu mượn thành công!');
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Không thể gửi yêu cầu mượn');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Content style={{ padding: 24, textAlign: 'center', marginTop: 100 }}>
        <Spin size="large" />
      </Content>
    );
  }

  if (success) {
    return (
      <Content style={{ padding: 24 }}>
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="Gửi yêu cầu mượn thành công!"
          subTitle="Yêu cầu của bạn đã được gửi đến quản trị viên. Vui lòng chờ duyệt."
          extra={[
            <Button type="primary" key="myrequests" onClick={() => history.push('/app/my-requests')}>
              Xem yêu cầu của tôi
            </Button>,
            <Button key="devices" onClick={() => history.push('/app/devices')}>
              Tiếp tục mượn thiết bị khác
            </Button>,
          ]}
        />
      </Content>
    );
  }

  if (!device) {
    return null;
  }

  return (
    <Content style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => history.push('/app/devices')}
        style={{ marginBottom: 16, padding: 0 }}
      >
        Quay lại danh sách thiết bị
      </Button>

      <Card>
        <Title level={3}>Yêu cầu mượn thiết bị</Title>

        <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Thiết bị">{device.name}</Descriptions.Item>
          <Descriptions.Item label="Mã số">{device.serialNumber}</Descriptions.Item>
          <Descriptions.Item label="Danh mục">{device.category}</Descriptions.Item>
          <Descriptions.Item label="Số lượng khả dụng">
            <Text strong style={{ color: device.quantity > 0 ? '#52c41a' : '#ff4d4f' }}>
              {device.quantity}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Vị trí">{device.location}</Descriptions.Item>
        </Descriptions>

        {device.quantity <= 0 ? (
          <Result
            status="warning"
            title="Thiết bị hiện không có sẵn"
            subTitle="Xin vui lòng quay lại sau hoặc chọn thiết bị khác."
          />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ quantity: 1 }}
          >
            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng' },
                { type: 'number', min: 1, max: device.quantity, message: `Tối đa ${device.quantity} thiết bị` }
              ]}
            >
              <InputNumber min={1} max={device.quantity} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Ngày mượn - Ngày trả dự kiến"
              name="dates"
              rules={[{ required: true, message: 'Vui lòng chọn ngày mượn và ngày trả' }]}
            >
              <RangePicker 
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
disabledDate={(current: Dayjs) => {
                return current && current < dayjs().startOf('day');
              }}
              />
            </Form.Item>

            <Form.Item
              label="Mục đích sử dụng"
              name="purpose"
              rules={[{ required: true, message: 'Vui lòng nhập mục đích' }]}
            >
              <TextArea rows={3} placeholder="Nhập mục đích sử dụng thiết bị..." />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} block size="large">
                Gửi yêu cầu mượn
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </Content>
  );
};

export default BorrowPage;