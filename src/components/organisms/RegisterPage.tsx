import React from 'react';
import RegisterForm, { RegisterFormData } from '../molecules/RegisterForm';
import { useUI } from '../../contexts/UIContext';
import { motion } from 'framer-motion';

interface RegisterPageProps {
  onSubmit: (data: RegisterFormData) => void;
  onSendCode: (phone: string) => void;
  loading: boolean;
  countdown?: number;
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
  error = ''
}) => {
  const { uiState, setTheme } = useUI();
  const isDarkTheme = uiState.theme === 'dark';



  return (
    // 外层容器 - 确保表单在页面中居中，符合authFormLayoutStyles.outerContainer规范
    <motion.div
      id="register-page-container"
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDarkTheme ? 'bg-background-dark text-text-dark-primary' : 'bg-gray-50 text-gray-900'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 内层容器 - 表单卡片，符合authFormLayoutStyles.innerContainer规范 */}
      <motion.div
        id="register-form-card"
        className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-md ${isDarkTheme ? 'bg-gray-50 text-gray-900' : 'bg-background-dark text-text-dark-primary'}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* 页面标题，符合authFormLayoutStyles.title规范 */}
        <motion.div 
          id="register-header"
          className="text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className={`text-3xl font-extrabold mb-2 text-primary`}>注册账号</h1>
          <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>创建您的预约系统账号</p>
        </motion.div>



        {/* 表单容器，符合authFormLayoutStyles.formContainer规范 */}
        <div id="register-form-container" className="mt-8 space-y-6">
          <RegisterForm
            onSubmit={onSubmit}
            onSendCode={onSendCode}
            loading={loading}
            countdown={countdown}
            error={error}
          />
        </div>

        {/* 页脚版权信息 */}
        <motion.div 
          id="register-footer"
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

export default RegisterPage;