import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const MyRequests: React.FC = () => {
  return (
    <div>
      <Title level={2}>Yêu cầu của tôi</Title>
      <Card>
        <p>Danh sách yêu cầu mượn thiết bị của tôi (đang phát triển)</p>
      </Card>
    </div>
  );
};

export default MyRequests;
