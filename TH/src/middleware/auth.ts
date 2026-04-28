import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import { message, Spin } from 'antd';

const Auth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      const currentPath = window.location.pathname;

      // Nếu không có token, chuyển về trang đăng nhập
      if (!token) {
        message.error('Vui lòng đăng nhập để tiếp tục!');
        history.push('/auth/login');
        return;
      }

      // Kiểm tra quyền truy cập admin
      if (currentPath.startsWith('/admin') && userRole !== 'admin') {
        message.error('Bạn không có quyền truy cập trang này!');
        history.push('/app/dashboard');
        return;
      }

      // Kiểm tra admin cố truy cập trang user
      if (currentPath.startsWith('/app') && userRole === 'admin') {
        message.error('Admin vui lòng sử dụng trang quản trị!');
        history.push('/admin/dashboard');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return React.createElement(Spin, {
      size: 'large',
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }
    });
  }

  return React.createElement(React.Fragment, null, children);
};

export default Auth;
