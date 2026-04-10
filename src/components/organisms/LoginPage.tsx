import React from 'react';
import LoginForm from '../molecules/LoginForm';
import { useUI } from '../../contexts/UIContext';
import { useTheme } from '@/hooks/useTheme';
import { AnimatedPage, AnimatedHeader, AnimatedFooter } from '@/components/atoms/motion';

interface LoginPageProps {
  onSendCode: (phoneNumber: string, type: 'login') => void;
  onVerifyCode: (phoneNumber: string, code: string) => void;
  loading: boolean;
  codeSent?: boolean;
  countdown?: number;
  showCodeInput: boolean;
  error?: string;
}

/**
 * 有机体组件：登录页面
 * 遵循UI设计系统规范中的登录和注册表单布局规范
 * 
 * @component
 * @example
 * <LoginPage
 *   onSendCode={handleSendCode}
 *   onVerifyCode={handleVerifyCode}
 *   loading={loading}
 * />
 */
const LoginPage: React.FC<LoginPageProps> = ({
  onSendCode,
  onVerifyCode,
  loading = false,
  countdown = 0,
  showCodeInput = false,
  error = ''
}) => {
  const { setTheme } = useUI();
  const { isDark: isDarkTheme } = useTheme();


  return (
    <AnimatedPage
      containerId="login-page-container"
      containerClassName={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDarkTheme ? 'bg-background-dark text-text-dark-primary' : 'bg-gray-50 text-gray-900'}`}
      innerId="login-page-card"
      innerClassName={`max-w-md w-full space-y-8 ${isDarkTheme ? 'text-gray-900' : 'text-text-dark-primary'}`}
    >
      <AnimatedHeader
        className="text-center"
        initial="hidden"
        animateState="visible"
      >
        <h1 className={`text-3xl font-extrabold mb-2 ${isDarkTheme ? 'text-primary' : 'text-primary'}`}>预约系统</h1>
        <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>登录您的账号以继续</p>
      </AnimatedHeader>

      <div id="login-page-form-container" className="mt-8 space-y-6">
        <LoginForm
          onSubmit={onVerifyCode}
          onSendCode={onSendCode}
          loading={loading}
          countdown={countdown}
          showCodeInput={showCodeInput}
          error={error}
        />
      </div>

      <AnimatedFooter
        className={`mt-6 text-center text-sm ${isDarkTheme ? 'text-text-dark-disabled' : 'text-gray-500'}`}
      >
        © 2025 预约系统 版权所有
      </AnimatedFooter>
    </AnimatedPage>
  );
};

export default LoginPage;