// import React from 'react';
// import { Layout } from 'antd';
// import { Card, Typography, Row, Col, Space, Button, Divider } from 'antd';
// import {
//   TeamOutlined,
//   SafetyCertificateOutlined,
//   ClockCircleOutlined,
//   LaptopOutlined,
//   MailOutlined,
//   PhoneOutlined,
//   GlobalOutlined
// } from '@ant-design/icons';
// import styles from './index.less';

// const { Title, Paragraph, Text } = Typography;
// const { Content } = Layout;

// const features = [
//   {
//     icon: <TeamOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
//     title: 'Quản lý tập trung',
//     description: 'Hệ thống quản lý thiết bị tập trung, dễ dàng theo dõi và kiểm soát',
//   },
//   {
//     icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
//     title: 'An toàn và bảo mật',
//     description: 'Đảm bảo an toàn thông tin và bảo mật dữ liệu người dùng',
//   },
//   {
//     icon: <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />,
//     title: 'Tiết kiệm thời gian',
//     description: 'Quy trình mượn trả thiết bị nhanh chóng, hiệu quả',
//   },
//   {
//     icon: <LaptopOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
//     title: 'Đa dạng thiết bị',
//     description: 'Hỗ trợ nhiều loại thiết bị khác nhau phục vụ nhu cầu học tập và nghiên cứu',
//   },
// ];

// const contactInfo = {
//   email: 'support@example.com',
//   phone: '0123 456 789',
//   address: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
//   website: 'www.example.com',
// };

// const AboutPage: React.FC = () => {
//   return (
//     <Content className={styles.content}>
//       {/* Hero Section */}
//       <Card className="hero-section" style={{
//         background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
//         color: 'white',
//         textAlign: 'center',
//         padding: '48px 24px',
//         marginBottom: 48,
//       }}>
//         <Title level={2} style={{ color: 'white' }}>
//           Hệ thống quản lý mượn thiết bị
//         </Title>
//         <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
//           Giải pháp quản lý thiết bị thông minh, giúp việc mượn trả thiết bị trở nên dễ dàng và hiệu quả
//         </Paragraph>
//       </Card>

//       {/* Features Section */}
//       <Title level={3} style={{ textAlign: 'center', marginBottom: 48 }}>
//         Tính năng nổi bật
//       </Title>
//       <Row gutter={[24, 24]}>
//         {features.map((feature, index) => (
//           <Col xs={24} sm={12} md={6} key={index}>
//             <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
//               <Space direction="vertical" size="large" style={{ width: '100%' }}>
//                 {feature.icon}
//                 <Title level={4}>{feature.title}</Title>
//                 <Paragraph>{feature.description}</Paragraph>
//               </Space>
//             </Card>
//           </Col>
//         ))}
//       </Row>

//       <Divider style={{ margin: '48px 0' }} />
// }};

// export default AboutPage;
