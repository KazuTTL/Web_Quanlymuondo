import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';

const { Title } = Typography;

const UserStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data since we don't have the service yet
    setTimeout(() => {
      setStatistics({
        totalRequests: 5,
        approvedRequests: 3,
        currentBorrows: 2,
        totalBorrows: 8,
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <PageContainer>
      <Title level={2}>Thống kê cá nhân</Title>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Yêu cầu đã gửi"
                value={statistics?.totalRequests || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã được duyệt"
                value={statistics?.approvedRequests || 0}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đang mượn"
                value={statistics?.currentBorrows || 0}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng lần mượn"
                value={statistics?.totalBorrows || 0}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </PageContainer>
  );
};

export default UserStatistics;
