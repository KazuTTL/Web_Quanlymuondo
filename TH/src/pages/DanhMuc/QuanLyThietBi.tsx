import React, { useState } from 'react';
import { Button, Space } from 'antd';
import Register from '@/pages/user/Register';
import Login from '@/pages/user/Login';
import { useModel } from 'umi';


const QuanLyThietBi: React.FC = () => {
  const [show, setShow] = useState<'register' | 'login' | null>(null);

  return (
    <div style={{ padding: 32 }}>
      <h2>Quản lý thiết bị</h2>
      <Space>
        <Button type="primary" onClick={() => setShow('register')}>Đăng ký</Button>
        <Button onClick={() => setShow('login')}>Đăng nhập</Button>
      </Space>
      <div style={{ marginTop: 24 }}>
        {show === 'register' && <Register onSuccess={() => setShow('login')} />}
        {show === 'login' && <Login />}
      </div>
      {/* Thêm các chức năng quản lý thiết bị ở đây */}
    </div>
  );
};

export default QuanLyThietBi;
