import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/compat/router';
import { useDispatch, useSelector } from 'react-redux';
import RegisterPageOrganism from '@/components/organisms/RegisterPage';
import { registerUser, sendCode, clearError, setShowCodeInput } from '@/store/userSlice';
import { AppDispatch, RootState } from '@/store';
import { RegisterFormData } from '@/components/molecules/RegisterForm';
import { useUI } from '@/contexts/UIContext';

/**
 * 页面组件：注册页面
 */
const RegisterPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { setLoading } = useUI();
  
  // 清除错误信息当组件卸载或跳转时
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(setShowCodeInput(false));
    };
  }, [dispatch]);

  const { loading, error, currentUser, showCodeInput } = useSelector((state: RootState) => state.user);
  const [countdown, setCountdown] = useState(0);
  
    // 倒计时效果
    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      }
      return () => clearTimeout(timer);
    }, [countdown]);

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
    setLoading(true);
    dispatch(registerUser(data)).finally(() => {
      setLoading(false);
    });
  };

  /**
   * 处理发送验证码
   */
  const handleSendCode = (phoneNumber: string) => {
    dispatch(sendCode({ phoneNumber, type: 'register' }));
    setCountdown(60);
  };

  return (
    <RegisterPageOrganism
      onSubmit={handleRegister}
      onSendCode={handleSendCode}
      loading={loading}
      countdown={countdown}
      showCodeInput={showCodeInput}
      error={error || undefined}
    />
  );
};

export default RegisterPage;