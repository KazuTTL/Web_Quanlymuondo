import React from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Space,
  Typography,
  Dropdown,
  MenuProps
} from 'antd';
import {
  MenuOutlined,
  HomeOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HistoryOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Link, useLocation, history } from 'umi';
import './BasicLayout.less';

const { Header, Content } = Layout;
const { Text } = Typography;

const BasicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: <Link to="/dashboard">Trang chủ</Link>,
    },
    {
      key: '/devices',
      icon: <AppstoreOutlined />,
      label: <Link to="/devices">Thiết bị</Link>,
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: <Link to="/history">Lịch sử</Link>,
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: <Link to="/statistics">Thống kê</Link>,
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Thông tin cá nhân</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        history.push('/user/login');
      },
    },
  ];

  return (
    <Layout className="main-layout">
      <Header className="navbar">
        <div className="navbar__container">
          {/* Logo */}
          <div className="navbar__logo">
            <Link to="/dashboard" className="navbar__logo-link">
              <div className="navbar__logo-circle">
                <AppstoreOutlined className="navbar__logo-icon" />
              </div>
              <Text className="navbar__logo-text">
                lendHUB
              </Text>
            </Link>
          </div>

          {/* Menu */}
          <div className="navbar__menu">
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              className="navbar__menu-items"
            />
          </div>

          {/* User Actions */}
          <div className="navbar__actions">
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space className="navbar__user">
                <Avatar size="small" icon={<UserOutlined />} />
                <Text className="navbar__user-name">
                  {localStorage.getItem('userName') || 'User'}
                </Text>
                <DownOutlined className="navbar__user-dropdown-icon" />
              </Space>
            </Dropdown>
          </div>
        </div>
      </Header>

      {/* Content */}
      <Content className="main-content">
        {children}
      </Content>
    </Layout>
  );
};

export default BasicLayout;
