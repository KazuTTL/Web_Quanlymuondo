import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons';
import { history } from 'umi';

const { Title, Text } = Typography;

interface AuthFormProps {
  type: 'login' | 'register';
  loading: boolean;
  onFinish: (values: any) => void;
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, loading, onFinish, onSuccess }) => {
  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập mật khẩu!'));
    }
    if (value.length < 8) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 8 ký tự!'));
    }
    if (!/[a-z]/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một chữ cái thường!'));
    }
    if (!/[A-Z]/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một chữ cái hoa!'));
    }
    if (!/[0-9]/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một số!'));
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một ký tự đặc biệt!'));
    }
    return Promise.resolve();
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      maxWidth: type === 'register' ? 450 : 400,
      margin: '40px auto',
      padding: 32,
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      <Title level={2} style={{ textAlign: 'center' }}>
        {type === 'login' ? 'Đăng nhập' : 'Đăng ký'}
      </Title>
      {type === 'register' && (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          Đăng ký tài khoản của bạn tại đây
        </Text>
      )}
      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        {type === 'register' && (
          <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
            <Input prefix={<IdcardOutlined />} placeholder="ex: Nguyễn Văn A" size="large" />
          </Form.Item>
        )}
        <Form.Item
          label={type === 'login' ? 'Email' : 'Email'}
          name="username"
          rules={[
            { required: true, message: type === 'login' ? 'Vui lòng nhập email!' : 'Vui lòng nhập email!' },
            {
              validator: (_, value) => {
                if (type === 'login') {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (emailRegex.test(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Vui lòng nhập email hợp lệ!'));
                } else {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  const phoneRegex = /^[0-9]{10}$/;
                  if (emailRegex.test(value) || phoneRegex.test(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Vui lòng nhập email hợp lệ!'));
                }
              }
            }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={type === 'login' ? 'ex: example@gmail.com' : 'ex: example@gmail.com'}
            size="large"
          />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { validator: validatePassword }
          ]}
          extra={type === 'register' ?  null : <Text type="secondary">Mật khẩu phải có ít nhất 8 ký tự, chứa ít nhất một chữ cái thường, một chữ cái hoa, một số và một ký tự đặc biệt!</Text>}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" size="large" />
        </Form.Item>
        {type === 'register' && (
          <Form.Item label="Xác nhận mật khẩu" name="confirmPassword" rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" size="large" />
          </Form.Item>
        )}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            style={{ background: '#FF3B00', border: 'none', borderRadius: 24, marginTop: 8 }}
          >
            {type === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </Button>
        </Form.Item>
        {type === 'register' && (
          <div style={{ textAlign: 'center' }}>
            <Text>Đã có tài khoản? </Text>
            <a onClick={() => history.push('/user/auth/login')}>Đăng nhập</a>
          </div>
        )}
      </Form>
    </div>
  );
};

export default AuthForm;
