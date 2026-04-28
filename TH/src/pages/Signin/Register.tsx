import React, { useState } from 'react';
import { message } from 'antd';
import { history, useDispatch } from 'umi';
import RegisterForm from '@/components/AuthForm/RegisterForm';

const Register: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onFinish = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      await dispatch({
        type: 'user/register',
        payload: {
          name: values.name,
          username: values.username,
          password: values.password,
        },
      });
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      if (onSuccess) onSuccess();
      history.push('/auth/login');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Đăng ký thất bại!');
    }
    setLoading(false);
  };

  return <RegisterForm loading={loading} onFinish={onFinish} />;
};

export default Register;
