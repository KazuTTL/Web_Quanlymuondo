import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Input, Tag, Spin, Space, Modal, Form, DatePicker, Descriptions, message, InputNumber } from 'antd';
import {
  RightOutlined,
  CameraOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  LaptopOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
  SolutionOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FormOutlined,
  CalendarOutlined,
  SwapOutlined,
  TeamOutlined,
  SettingOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Link, history } from 'umi';
import './index.less';
import { getDevices, Device } from '@/services/User/device.service';
import { createBorrowRequest } from '@/services/User/borrow-request.service';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [topDevices, setTopDevices] = useState<Device[]>([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTopDevices = async () => {
      setLoading(true);
      try {
        console.log('Attempting to fetch top devices...');
        const response = await getDevices({ pageSize: 6 });
        console.log('Raw API Response for Top Devices:', response);

        if (!response || !response.data) {
          console.warn('API Response or response.data is undefined/null for top devices.', response);
          setTopDevices([]); // Ensure topDevices is an empty array
          return;
        }

        const devicesWithMockData = (response.data || []).map(device => ({
          ...device,
          // Ensure rating and borrowCount are always numbers
          rating: typeof device.rating === 'number' ? device.rating : Math.floor(Math.random() * (50 - 40) + 40) / 10,
          borrowCount: typeof device.borrowCount === 'number' ? device.borrowCount : Math.floor(Math.random() * (300 - 50) + 50),
        }));
        console.log('Processed Top Devices:', devicesWithMockData);
        setTopDevices(devicesWithMockData);
      } catch (error) {
        console.error('Error fetching top devices:', error);
        setTopDevices([]); // Set empty array on error as well
      } finally {
        setLoading(false);
      }
    };

    fetchTopDevices();
  }, []);

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
        return null;
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
        deviceId: selectedDevice.id,
        borrowDate: borrowDate.format('YYYY-MM-DD'),
        returnDate: returnDate.format('YYYY-MM-DD'),
        quantity: values.quantity || 1,
        purpose: values.purpose,
      });

      message.success('Gửi yêu cầu mượn thành công! Yêu cầu đang chờ duyệt.');
      setIsDetailModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      console.error('Borrow request error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể gửi yêu cầu mượn';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-landing">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <Tag color="gold" className="hero-tag">Hệ thống quản lý mượn số 1</Tag>
          <h1>Quản Lý Mượn Đồ Dùng <span className="highlight">Dễ Dàng & Hiệu Quả</span></h1>
          <Paragraph className="hero-description">
            Hệ thống quản lý mượn thiết bị dành cho sinh viên và câu lạc bộ.
            Theo dõi tình trạng thiết bị, quản lý yêu cầu mượn và nhận thông báo tự động.
          </Paragraph>
          <div className="hero-cta">
            <Button type="primary" size="large" className="cta-button">
              Đăng Ký Miễn Phí
            </Button>
            <Input placeholder="Nhập email của bạn" className="email-input" />
          </div>
        </div>
        <div className="hero-images">
          {/* Placeholder for floating device cards */}
          <div className="floating-card ipad-pro">
            <Card>
              <VideoCameraOutlined />
              <p>iPad Pro</p>
              <span>Available</span>
            </Card>
          </div>
          <div className="floating-card projector">
            <Card>
              <AppstoreOutlined />
              <p>Projector</p>
              <span>Available</span>
            </Card>
          </div>
          <div className="floating-card printer">
            <Card>
              <SolutionOutlined />
              <p>Printer</p>
              <span>Available</span>
            </Card>
          </div>
          <div className="floating-card camera">
            <Card>
              <CameraOutlined />
              <p>Camera</p>
              <span>Available</span>
            </Card>
          </div>
          <div className="floating-card headphone">
            <Card>
              <AudioOutlined />
              <p>Headphone</p>
              <span>Available</span>
            </Card>
          </div>
        </div>
      </div>

      {/* Thiết Bị Được Mượn Nhiều Nhất */}
      <div className="section most-borrowed-devices">
        <h2>Thiết Bị Được Mượn Nhiều Nhất</h2>
        <Paragraph className="section-description">
          Khám phá những thiết bị được sinh viên và cán bộ sử dụng thường xuyên nhất.
        </Paragraph>
        <Spin spinning={loading}>
          <Row gutter={[24, 24]}>
            {topDevices.map((device) => (
              <Col xs={24} sm={12} md={8} lg={8} xl={8} key={device.id}>
                <Card
                  hoverable
                  className="device-card"
                  cover={
                    device.imageUrl ? (
                      <img
                        alt={device.name}
                        src={device.imageUrl}
                        className="device-image"
                        style={{ height: 200,paddingTop:15,width: '100%',paddingLeft: 15,paddingRight: 15,objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f5f5f5',
                        }}
                      >
                        {device.category === 'Laptop' && <LaptopOutlined style={{ fontSize: 48 }} />}
                        {device.category === 'Camera' && <CameraOutlined style={{ fontSize: 48 }} />}
                        {device.category === 'Projector' && <VideoCameraOutlined style={{ fontSize: 48 }} />}
                        {device.category === 'Microphone' && <AudioOutlined style={{ fontSize: 48 }} />}
                        {device.category === 'Monitor' && <AppstoreOutlined style={{ fontSize: 48 }} />}
                        {!device.category && <AppstoreOutlined style={{ fontSize: 48 }} />}
                      </div>
                    )
                  }
                >
                  <h3>{device.name}</h3>
                  <Paragraph className="device-description" ellipsis={{ rows: 2 }}>
                    {device.description}
                  </Paragraph>
                  <div className="device-stats">
                    <Tag color="gold">⭐ {device.rating || 'N/A'}</Tag>
                    <Tag color="blue">{device.borrowCount || 'N/A'} lượt mượn</Tag>
                    {getStatusTag(device.status)}
                  </div>
                  <Button type="link" onClick={() => handleViewDetail(device)}>
                    Xem Chi Tiết
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </Spin>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link to="/devices">
            <Button className="view-all-button">
              <RightOutlined /> Xem Tất Cả Thiết Bị
            </Button>
          </Link>
        </div>
      </div>


      {/* Tính Năng Nổi Bật */}
      <div className="section features-section">
        <h2>Tính Năng Nổi Bật</h2>
        <Paragraph className="section-description">
          Khám phá những tính năng hiện đại giúp bạn quản lý thiết bị một cách dễ dàng.
        </Paragraph>
        <Row gutter={[24, 24]} className="feature-grid" justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="feature-card">
              <div className="feature-icon-wrapper bg-blue">
                <AppstoreOutlined />
              </div>
              <h3>Quản Lý Thiết Bị</h3>
              <p>Xem danh sách thiết bị có sẵn với thông tin chi tiết về số lượng và tình trạng.</p>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="feature-card">
              <div className="feature-icon-wrapper bg-green">
                <FormOutlined />
              </div>
              <h3>Yêu Cầu Mượn</h3>
              <p>Gửi yêu cầu mượn thiết bị với ngày mượn và trả cụ thể, chờ phê duyệt.</p>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="feature-card">
              <div className="feature-icon-wrapper bg-purple">
                <HistoryOutlined />
              </div>
              <h3>Theo Dõi Lịch Sử</h3>
              <p>Xem lịch sử mượn trả của bản thân và theo dõi tình trạng các yêu cầu.</p>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="feature-card">
              <div className="feature-icon-wrapper bg-orange">
                <BellOutlined />
              </div>
              <h3>Thông Báo Tự Động</h3>
              <p>Nhận email thông báo khi yêu cầu được duyệt hoặc sắp đến hạn trả.</p>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="feature-card">
              <div className="feature-icon-wrapper bg-red">
                <UserOutlined />
              </div>
              <h3>Quản Trị Viên</h3>
              <p>Công cụ quản lý dành cho admin để phê duyệt yêu cầu và theo dõi thiết bị.</p>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="feature-card">
              <div className="feature-icon-wrapper bg-blue">
                <TeamOutlined />
              </div>
              <h3>Dành Cho Sinh Viên</h3>
              <p>Giao diện thân thiện, dễ sử dụng dành riêng cho sinh viên và câu lạc bộ.</p>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Cách Hoạt Động */}
      <div className="section how-it-works-section">
        <h2>Cách Hoạt Động</h2>
        <Paragraph className="section-description">
          Chỉ với 3 bước đơn giản, bạn có thể mượn thiết bị một cách dễ dàng.
        </Paragraph>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={8}>
            <Card className="step-card">
              <div className="step-number">1</div>
              <h3>Duyệt Thiết Bị</h3>
              <p>Xem danh sách thiết bị có sẵn với thông tin chi tiết về số lượng và tình trạng.</p>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="step-card">
              <div className="step-number">2</div>
              <h3>Gửi Yêu Cầu</h3>
              <p>Điền thông tin và gửi yêu cầu mượn thiết bị để chờ phê duyệt.</p>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="step-card">
              <div className="step-number">3</div>
              <h3>Nhận & Trả</h3>
              <p>Nhận thiết bị tại phòng quản lý, trả đúng hạn.</p>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Kêu gọi hành động (CTA) bottom */}
      <div className="section cta-bottom-section">
        <h2>Sẵn Sàng Bắt Đầu?</h2>
        <Paragraph className="section-description">
          Tham gia hệ thống quản lý mượn đồ dùng hiện đại và tiện lợi ngay hôm nay.
        </Paragraph>
        <div className="cta-input-group">
          <Button type="primary" size="large" className="cta-button">
            Đăng Ký Miễn Phí
          </Button>
          <Input placeholder="Nhập email của bạn" className="email-input" />
        </div>
      </div>

      {/* Về Hệ Thống */}
      <div className="section about-system-section">
        <h2>Về Hệ Thống</h2>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card className="about-card">
              <h3>Dành Cho Sinh Viên</h3>
              <ul>
                <li>Đăng nhập và xem thiết bị có sẵn</li>
                <li>Gửi yêu cầu mượn</li>
                <li>Theo dõi lịch sử mượn</li>
                <li>Nhận thông báo qua email</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="about-card">
              <h3>Dành Cho Quản Trị Viên</h3>
              <ul>
                <li>Phê duyệt yêu cầu</li>
                <li>Quản lý thiết bị</li>
                <li>Thống kê sử dụng</li>
                <li>Phân quyền</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Chân trang (Footer) */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-column">
            <div className="logo-text">Lenhub</div>
            <p className="slogan">Giải pháp quản lý thiết bị hiện đại dành cho sinh viên và câu lạc bộ.</p>
          </div>
          <div className="footer-column">
            <h3>Liên Kết</h3>
            <ul>
              <li><Link to="/user/login">Đăng Nhập</Link></li>
              <li><Link to="/user/register">Đăng Ký</Link></li>
              <li><Link to="/features">Tính Năng</Link></li>
              <li><Link to="/about">Giới Thiệu</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Hỗ Trợ</h3>
            <p>Email: support@example.com</p>
            <p>Điện thoại: (84) 0123-456-789</p>
            <p>Thời gian: 8:00 - 17:00</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 lendHUB. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>

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
                <img
                  src={selectedDevice.imageUrl}
                  alt={selectedDevice.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0'
                  }}
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
                <Tag color={selectedDevice.quantity > 0 ? 'green' : 'red'}>
                  {selectedDevice.quantity || 0} thiết bị
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {selectedDevice.description || 'Không có mô tả'}
              </Descriptions.Item>
            </Descriptions>

            {/* Borrow Form Section */}
            {selectedDevice.status === 'available' && (selectedDevice.quantity || 1) > 0 ? (
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
                        max: selectedDevice.quantity || 1,
                        message: `Số lượng phải từ 1 đến ${selectedDevice.quantity || 1}`,
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={selectedDevice.quantity || 1}
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
                  {(selectedDevice.quantity || 0) === 0 && ' (Hết số lượng)'}
                </Typography.Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;
