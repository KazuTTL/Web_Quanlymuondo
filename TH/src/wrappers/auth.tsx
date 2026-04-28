import React from 'react';
import { Redirect } from 'umi';
import { checkAuth } from '@/middleware/auth';

interface AuthWrapperProps {
  children: React.ReactNode;
  location: any;
  route: any;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, route }) => {
  const role = route.authority?.[0] || 'user';

  if (!checkAuth(role)) {
    return <Redirect to="/user/login" />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
