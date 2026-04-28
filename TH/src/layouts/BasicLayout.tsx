import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  HistoryOutlined,
  UserOutlined,
  BarChartOutlined,
  DashboardOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, useLocation, history } from 'umi';
import { logoutUser } from '@/services/User/user';
import styles from './BasicLayout.less';

const { Header, Sider, Content } = Layout;

const BasicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string>('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role') || '';
    setUserRole(role);
  }, []);

  const isAdmin = userRole === 'admin';
  const isUser = userRole === 'user';

  // Menu items for user (navbar)
  const userMenuItems = [
    {
      key: '/app/dashboard',
      icon: <HomeOutlined />,
      label: <Link to="/app/dashboard">Trang chủ</Link>,
    },
    {
      key: '/app/devices',
      icon: <AppstoreOutlined />,
      label: <Link to="/app/devices">Thiết bị</Link>,
    },
    {
      key: '/app/my-requests',
      icon: <FileTextOutlined />,
      label: <Link to="/app/my-requests">Yêu cầu của tôi</Link>,
    },
    {
      key: '/app/history',
      icon: <HistoryOutlined />,
      label: <Link to="/app/history">Lịch sử</Link>,
    },
    {
      key: '/app/profile',
      icon: <UserOutlined />,
      label: <Link to="/app/profile">Thông tin cá nhân</Link>,
    },
    {
      key: '/app/statistics',
      icon: <BarChartOutlined />,
      label: <Link to="/app/statistics">Thống kê</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  // Menu items for admin (sidebar)
  const adminMenuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">Bảng điều khiển</Link>,
    },
    {
      key: '/admin/devices',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/devices">Quản lý thiết bị</Link>,
    },
    {
      key: '/admin/borrow-requests',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/borrow-requests">Yêu cầu mượn</Link>,
    },
    {
      key: '/admin/borrow-history',
      icon: <HistoryOutlined />,
      label: <Link to="/admin/borrow-history">Lịch sử mượn trả</Link>,
    },
    {
      key: '/admin/statistics',
      icon: <BarChartOutlined />,
      label: <Link to="/admin/statistics">Thống kê</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API fails
      localStorage.clear();
      history.push('/auth/login');
    }
  }

  const getSelectedKey = () => {
    return location.pathname;
  };

  if (isUser) {
    // User layout: No sidebar, only navbar at top
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{
          background: '#001529',
          padding: '0 16px',
          height: '48px',
          lineHeight: '48px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
              Hệ thống mượn thiết bị
            </div>
            <Menu
              mode="horizontal"
              selectedKeys={[getSelectedKey()]}
              items={userMenuItems}
              style={{
                background: 'transparent',
                border: 'none',
                flex: 1,
                justifyContent: 'flex-end',
                lineHeight: '48px'
              }}
              theme="dark"
            />
          </div>
        </Header>
        <Content style={{ padding: '16px', overflow: 'initial' }}>
          {children}
        </Content>
      </Layout>
    );
  }

  if (isAdmin) {
    // Admin layout: Only sidebar, no navbar
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{ background: '#001529' }}
          width={250}
        >
          <div style={{
            height: 40,
            margin: '16px 8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {collapsed ? 'Admin' : 'Admin Panel'}
          </div>
          <Menu
            theme="dark"
            selectedKeys={[getSelectedKey()]}
            mode="inline"
            items={adminMenuItems}
            style={{ borderRight: 0 }}
          />
        </Sider>
        <Layout>
          <Content style={{
            margin: '16px',
            padding: '16px',
            background: '#fff',
            borderRadius: '6px',
            minHeight: 'calc(100vh - 32px)'
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    );
  }

  // Default layout if role is not determined
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '16px', overflow: 'initial' }}>
        {children}
      </Content>
    </Layout>
  );
};

export default BasicLayout;
