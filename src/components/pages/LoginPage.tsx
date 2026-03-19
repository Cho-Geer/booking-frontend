import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import LoginPageOrganism from '@/components/organisms/LoginPage';
import { sendCode, verifyCode, clearError, setShowCodeInput } from '@/store/userSlice';
import { AppDispatch, RootState } from '@/store';
import { useUI } from '@/contexts/UIContext';

/**
 * 页面组件：登录页面
 * 集成登录功能的页面组件，处理登录逻辑和状态管理
 * 
 * @component
 */
const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, currentUser, showCodeInput } = useSelector((state: RootState) => state.user);
  const { setLoading } = useUI();
  
  const [countdown, setCountdown] = useState(0);

  // 清除错误信息当组件卸载或跳转时
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(setShowCodeInput(false));
    };
  }, [dispatch]);

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
      router.push(currentUser.userType === 'admin' ? '/admin/bookings' : '/bookings');
    }
  }, [currentUser, router]);

  /**
   * 发送验证码
   */
  const handleSendCode = (phoneNumber: string, type: 'login') => {
    dispatch(sendCode({ phoneNumber, type }));
    setCountdown(60);
  };

  /**
   * 验证验证码
   */
  const handleVerifyCode = (phoneNumber: string, code: string) => {
    setLoading(true);
    dispatch(verifyCode({ phoneNumber, code })).finally(() => {
      setLoading(false);
    });
  };

  return (
    <LoginPageOrganism
      onSendCode={handleSendCode}
      onVerifyCode={handleVerifyCode}
      loading={loading}
      countdown={countdown}
      showCodeInput={showCodeInput}
      error={error || undefined}
    />
  );
};

export default LoginPage;