import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Row, Statistic } from 'antd';
import React, { useEffect, useState } from 'react';
import { getOverviewStatistics, OverviewStatistics, getUserStatistics, UserStatistics } from '@/services/statistics.service';
import { getDevices } from '@/services/device.service';
import { Device } from '@/services/device.service';

const HomePage: React.FC = () => {
  const [overviewStatistics, setOverviewStatistics] = useState<OverviewStatistics>();
  const [userStatistics, setUserStatistics] = useState<UserStatistics>();
  const [recentDevices, setRecentDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewStats, userStats, devices] = await Promise.all([
          getOverviewStatistics(),
          getUserStatistics(),
          getDevices({ pageSize: 5, current: 1 }),
        ]);
        setOverviewStatistics(overviewStats);
        setUserStatistics(userStats);
        setRecentDevices(devices.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng số thiết bị"
              value={overviewStatistics?.totalDevices}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Thiết bị có sẵn"
              value={overviewStatistics?.availableDevices}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Thiết bị đang mượn"
              value={overviewStatistics?.borrowedDevices}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Yêu cầu đang chờ"
              value={overviewStatistics?.pendingRequests}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Thiết bị gần đây" loading={loading}>
            {recentDevices.map((device) => (
              <Card.Grid key={device.id} style={{ width: '100%', padding: '12px' }}>
                <div>
                  <h4>{device.name}</h4>
                  <p>Mã số: {device.serialNumber}</p>
                  <p>Trạng thái: {device.status}</p>
                </div>
              </Card.Grid>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Thống kê người dùng" loading={loading}>
            <Statistic
              title="Tổng số người dùng"
              value={userStatistics?.totalUsers}
              valueStyle={{ color: '#3f8600' }}
            />
            <Statistic
              title="Yêu cầu mượn tổng cộng"
              value={userStatistics?.totalBorrows}
              valueStyle={{ color: '#faad14' }}
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default HomePage;
