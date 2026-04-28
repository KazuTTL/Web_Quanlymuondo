import React, { useState } from 'react';
import { message } from 'antd';
import { history, useDispatch } from 'umi';
import LoginForm from '@/components/AuthForm/LoginForm';

interface LoginResponse {
  role?: string;
  access_token?: string;
  [key: string]: any;
}

const Login: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Sử dụng phương thức loginUnified từ model user
      const response = await dispatch({
        type: 'user/loginUnified',
        payload: values,
      }) as LoginResponse;

      // Get role from localStorage (already saved by the model)
      const storedRole = localStorage.getItem('role') || response?.role;

      // Ensure role is saved to localStorage if not already saved
      if (storedRole && !localStorage.getItem('role')) {
        localStorage.setItem('role', storedRole);
      }

      // Redirect based on role after successful login
      if (storedRole === 'admin') {
        message.success('Đăng nhập thành công với quyền Admin!');
        history.push('/admin/dashboard');
      } else {
        message.success('Đăng nhập thành công!');
        history.push('/app/dashboard');
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      message.error(err?.message || 'Tài khoản hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm loading={loading} onFinish={onFinish} />;
};

export default Login;
