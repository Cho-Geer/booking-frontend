import React from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import RegisterPageOrganism from '@/components/organisms/RegisterPage';
import { registerUser, sendCode } from '@/store/userSlice';
import { AppDispatch, RootState } from '@/store';
import { RegisterFormData } from '@/components/molecules/RegisterForm';

/**
 * 页面组件：注册页面
 * 集成注册功能的页面组件，处理注册逻辑和状态管理
 * 
 * @component
 */
const RegisterPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, currentUser, countdown } = useSelector((state: RootState) => state.user);

  // 注册成功后跳转
  React.useEffect(() => {
    if (currentUser) {
      router.push('/bookings');
    }
  }, [currentUser, router]);

  /**
   * 处理用户注册
   */
  const handleRegister = (data: RegisterFormData) => {
    dispatch(registerUser(data));
  };

  /**
   * 处理发送验证码
   */
  const handleSendCode = (phone: string) => {
    dispatch(sendCode(phone));
  };

  return (
    <RegisterPageOrganism
      onSubmit={handleRegister}
      onSendCode={handleSendCode}
      loading={loading}
      countdown={countdown}
      error={error || undefined}
    />
  );
};

export default RegisterPage;