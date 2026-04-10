import React from 'react';
import RegisterForm, { RegisterFormData } from '../molecules/RegisterForm';
import { useUI } from '../../contexts/UIContext';
import { useTheme } from '@/hooks/useTheme';
import { AnimatedPage, AnimatedHeader, AnimatedFooter } from '@/components/atoms/motion';

interface RegisterPageProps {
  onSubmit: (data: RegisterFormData) => void;
  onSendCode: (phone: string) => void;
  loading: boolean;
  countdown?: number;
  showCodeInput?: boolean;
  error?: string;
}

/**
 * 有机体组件：注册页面
 * 遵循UI设计系统规范中的登录和注册表单布局规范
 * 
 * @component
 * @example
 * <RegisterPage
 *   onSubmit={handleRegister}
 *   onSendCode={handleSendCode}
 *   loading={loading}
 *   countdown={countdown}
 * />
 */
const RegisterPage: React.FC<RegisterPageProps> = ({
  onSubmit,
  onSendCode,
  loading = false,
  countdown = 0,
  showCodeInput = false,
  error = ''
}) => {
  const { setTheme } = useUI();
  const { isDark: isDarkTheme } = useTheme();



  return (
    <AnimatedPage
      containerId="register-page-container"
      containerClassName={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDarkTheme ? 'bg-background-dark text-text-dark-primary' : 'bg-gray-50 text-gray-900'}`}
      innerId="register-form-card"
      innerClassName={`max-w-md w-full space-y-8 ${isDarkTheme ? 'text-gray-900' : 'text-text-dark-primary'}`}
    >
      <AnimatedHeader
        id="register-header"
        className="text-center"
        initial="hidden"
        animateState="visible"
      >
        <h1 className={`text-3xl font-extrabold mb-2 text-primary`}>注册账号</h1>
        <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>创建您的预约系统账号</p>
      </AnimatedHeader>

      <div id="register-form-container" className="mt-8 space-y-6">
        <RegisterForm
          onSubmit={onSubmit}
          onSendCode={onSendCode}
          loading={loading}
          countdown={countdown}
          showCodeInput={showCodeInput}
          error={error}
        />
      </div>

      <AnimatedFooter
        id="register-footer"
        className={`mt-6 text-center text-sm ${isDarkTheme ? 'text-text-dark-disabled' : 'text-gray-500'}`}
      >
        © 2025 预约系统 版权所有
      </AnimatedFooter>
    </AnimatedPage>
  );
};

export default RegisterPage;