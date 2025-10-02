import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import LoginPageOrganism from '@/components/organisms/LoginPage';
import { sendCode, verifyCode } from '@/store/userSlice';
import { AppDispatch, RootState } from '@/store';

/**
 * 页面组件：登录页面
 * 集成登录功能的页面组件，处理登录逻辑和状态管理
 * 
 * @component
 */
const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, currentUser } = useSelector((state: RootState) => state.user);
  
  const [countdown, setCountdown] = useState(0);

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 登录成功后跳转
  useEffect(() => {
    if (currentUser) {
      router.push('/bookings');
    }
  }, [currentUser, router]);

  /**
   * 发送验证码
   */
  const handleSendCode = (phone: string) => {
    dispatch(sendCode(phone));
    setCountdown(60);
  };

  /**
   * 验证验证码
   */
  const handleVerifyCode = (phone: string, code: string) => {
    dispatch(verifyCode({ phone, code }));
  };

  return (
    <LoginPageOrganism
      onSendCode={handleSendCode}
      onVerifyCode={handleVerifyCode}
      loading={loading}
      countdown={countdown}
      error={error || undefined}
    />
  );
};

export default LoginPage;