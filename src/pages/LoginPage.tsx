import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendCode, verifyCode } from '../store/userSlice';
import { AppDispatch, RootState } from '../store';
import Button from '../components/atoms/Button';
import { useUI } from '../contexts/UIContext';

/**
 * 登录页面组件
 */
const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  // 从Redux store获取状态
  const { loading, error, countdown, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );
  
  // 从UI Context获取主题切换功能
  const { toggleTheme } = useUI();

  // 本地状态
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        dispatch({ type: 'user/decrementCountdown' });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, dispatch]);

  // 如果已认证，跳转到首页
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  /**
   * 处理发送验证码
   */
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      alert('请输入手机号');
      return;
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    const result = await dispatch(sendCode(phone));
    if (sendCode.fulfilled.match(result)) {
      setShowCodeInput(true);
    }
  };

  /**
   * 处理验证验证码
   */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      alert('请输入验证码');
      return;
    }

    const result = await dispatch(verifyCode({ phone, code }));
    if (verifyCode.fulfilled.match(result)) {
      // 登录成功，跳转到首页
      router.push('/');
    }
  };

  return (
    <div id="login-page-container" className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-background-dark text-text-dark-primary">
      <div id="login-form-wrapper" className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-md bg-background-dark text-text-dark-primary">
        <div id="login-header">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            预约系统登录
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            使用手机号登录以继续
          </p>
        </div>
        
        {/* 主题切换按钮 */}
        <button 
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 text-gray-700"
          onClick={toggleTheme}
          aria-label="切换主题"
        >
          🌙
        </button>
        
        <form className="mt-8 space-y-6" onSubmit={showCodeInput ? handleVerifyCode : handleSendCode}>
          <div id="input-fields-wrapper" className="rounded-md shadow-sm -space-y-px">
            <div id="phone-input-container">
              <label htmlFor="phone" className="sr-only">
                手机号
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={showCodeInput || loading}
              />
            </div>
            
            {showCodeInput && (
              <div id="code-input-container">
                <label htmlFor="code" className="sr-only">
                  验证码
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {error && (
            <div id="error-message" className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div id="submit-button-container">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              disabled={loading}
            >
              {showCodeInput ? '登录' : '发送验证码'}
            </Button>
          </div>

          {showCodeInput && countdown > 0 && (
            <div id="countdown-message" className="text-center text-sm text-gray-600">
              {countdown}秒后可重新发送验证码
            </div>
          )}

          {showCodeInput && countdown === 0 && (
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={handleSendCode}
            >
              重新发送验证码
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;