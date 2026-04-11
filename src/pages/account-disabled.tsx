/**
 * 用户账户禁用错误页面组件
 * 用于显示 INACTIVE 和 BLOCKED 状态用户的错误信息
 */
import React, { useCallback } from 'react';
import { useRouter } from 'next/compat/router';
import { useDispatch } from 'react-redux';
import { AlertCircle, Home, LogIn } from 'lucide-react';
import { navigate } from '@/utils/navigation';
import { logoutUser, logout } from '@/store/userSlice';
import { AppDispatch } from '@/store';

const AccountDisabledPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { reason = undefined } = router?.query || {};

  const getErrorInfo = (): { title: string; description: string } => {
    const storedReason = typeof window !== 'undefined'
      ? sessionStorage.getItem('accountDisabledReason')
      : null;
    const effectiveReason = (reason as string) || storedReason || 'INACTIVE';

    if (effectiveReason === 'BLOCKED') {
      return {
        title: '账户已被封禁',
        description: '您的账户因违反服务条款已被永久封禁。\n如有异议，请联系客服申诉。',
      };
    }
    if (effectiveReason === 'ROLE_CHANGED_FROM_ADMIN') {
      return {
        title: '管理员权限已撤销',
        description: '您的管理员权限已被撤销，当前无法访问管理控制系统。\n您的账户已变更为普通用户，请使用普通用户身份访问预约服务。',
      };
    }
    if (effectiveReason === 'ROLE_UPGRADED_TO_ADMIN') {
      return {
        title: '您的账户已升级为管理员',
        description: '您的账户已被升级为管理员，当前页面将关闭。\n请重新登录以使用管理员身份访问管理控制台。',
      };
    }
    return {
      title: '账户已停用',
      description: '您的账户当前处于停用状态，无法继续使用本系统。\n请联系管理员或重新注册新账户。',
    };
  };

  const { title, description } = getErrorInfo();

  // 完整登出流程：清除服务端 Cookie + 清空 Redux + 清理本地存储
  const performFullLogout = useCallback(async () => {
    // 1. 调用登出 API 清除 HttpOnly cookies
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // 即使失败也继续清理客户端状态
    }
    // 2. 清空 Redux 中的用户状态
    dispatch(logout());
    // 3. 清除本地存储和可访问 Cookie
    if (typeof window !== 'undefined') {
      document.cookie.split('; ').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
      sessionStorage.clear();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    }
  }, [dispatch]);

  const handleGoHome = useCallback(async () => {
    await performFullLogout();
    navigate('/?cleared_from_disabled_page=true');
  }, [performFullLogout]);

  const handleLogin = useCallback(async () => {
    await performFullLogout();
    navigate('/login?cleared_from_disabled_page=true&role_changed=true');
  }, [performFullLogout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-red-200 dark:border-red-800">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line text-center leading-relaxed">
              {description}
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6">
            <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
              ⚠️ 为确保账户安全，系统已自动清除您的登录信息
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <LogIn className="w-5 h-5" />
              返回登录页
            </button>
            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              <Home className="w-5 h-5" />
              返回首页
            </button>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            如有疑问，请联系客服或技术支持
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountDisabledPage;