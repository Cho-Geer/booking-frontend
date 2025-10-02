import React from 'react';
import LoginForm from '../molecules/LoginForm';
import { useUI } from '../../contexts/UIContext';
import { motion } from 'framer-motion';

interface LoginPageProps {
  onSendCode: (phone: string) => void;
  onVerifyCode: (phone: string, code: string) => void;
  loading: boolean;
  codeSent?: boolean;
  countdown?: number;
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
  error = ''
}) => {
  const { uiState, setTheme } = useUI();
  const isDarkTheme = uiState.theme === 'dark';



  return (
    // 外层容器 - 确保表单在页面中居中，符合authFormLayoutStyles.outerContainer规范
    <motion.div
      id="login-page-container"
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDarkTheme ? 'bg-background-dark text-text-dark-primary' : 'bg-gray-50 text-gray-900'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 内层容器 - 表单卡片，符合authFormLayoutStyles.innerContainer规范 */}
      <motion.div
        id="login-page-card"
        className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-md ${isDarkTheme ? 'bg-gray-50 text-gray-900' : 'bg-background-dark text-text-dark-primary'}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* 页面标题，符合authFormLayoutStyles.title规范 */}
        <motion.div 
          className="text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className={`text-3xl font-extrabold mb-2 ${isDarkTheme ? 'text-primary' : 'text-primary'}`}>预约系统</h1>
          <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>登录您的账号以继续</p>
        </motion.div>



        {/* 表单容器，符合authFormLayoutStyles.formContainer规范 */}
        <div id="login-page-form-container" className="mt-8 space-y-6">
          <LoginForm
            onSubmit={onVerifyCode}
            onSendCode={onSendCode}
            loading={loading}
            countdown={countdown}
            error={error}
          />
        </div>

        {/* 页脚版权信息 */}
        <motion.div 
          className={`mt-6 text-center text-sm ${isDarkTheme ? 'text-text-dark-disabled' : 'text-gray-500'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          © 2025 预约系统 版权所有
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;