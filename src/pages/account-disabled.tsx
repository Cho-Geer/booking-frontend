/**
 * 用户账户禁用错误页面组件
 * 用于显示 INACTIVE 和 BLOCKED 状态用户的错误信息
 */
import React from 'react';
import { useRouter } from 'next/router';
import { AlertCircle, Home, LogIn } from 'lucide-react';

/**
 * 账户禁用错误页面
 * 
 * 当用户账户状态为 INACTIVE 或 BLOCKED 时显示此页面
 * 提供清晰的错误信息和操作指引
 */
const AccountDisabledPage: React.FC = () => {
  const router = useRouter();
  const { reason } = router.query;

  /**
   * 获取错误信息的标题和描述
   * @returns 标题和描述对象
   */
  const getErrorInfo = (): { title: string; description: string } => {
    // 优先从 sessionStorage 获取原因（由 api.ts 设置）
    const storedReason = typeof window !== 'undefined' 
      ? sessionStorage.getItem('accountDisabledReason') 
      : null;
    
    const effectiveReason = reason as string || storedReason || 'INACTIVE';
    
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
    
    // 默认为 INACTIVE 或其他原因
    return {
      title: '账户已停用',
      description: '您的账户当前处于停用状态，无法继续使用本系统。\n请联系管理员或重新注册新账户。',
    };
  };

  const { title, description } = getErrorInfo();

  /**
   * 清除所有认证相关的 Cookie 和存储
   * 注意：保留 accountDisabledReason 以便页面显示正确的错误信息
   * 重要：HttpOnly cookies 无法通过 JavaScript 清除，需要后端 logout 接口清除
   */
  const clearAuthData = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      // 保存账户禁用原因
      const disabledReason = sessionStorage.getItem('accountDisabledReason');
      
      // 清除所有可通过 JavaScript 访问的 Cookie
      // 注意：HttpOnly cookies (access_token, refresh_token) 不会被清除
      document.cookie.split('; ').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });

      // 清除 sessionStorage（但保留账户禁用原因）
      sessionStorage.clear();
      if (disabledReason) {
        sessionStorage.setItem('accountDisabledReason', disabledReason);
      }

      // 清除 localStorage 中的认证相关数据
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    }
  }, []);

  /**
   * 处理返回首页
   */
  const handleGoHome = React.useCallback(() => {
    clearAuthData();
    // 添加 cleared_from_disabled_page 参数，告知 middleware 这是从禁用页面来的
    if (typeof window !== 'undefined') {
      window.location.href = '/?cleared_from_disabled_page=true';
    } else {
      router.push('/');
    }
  }, [clearAuthData, router]);

  /**
   * 处理重新登录
   */
  const handleLogin = React.useCallback(() => {
    clearAuthData();
    // 添加 cleared_from_disabled_page 和 role_changed 参数，告知 middleware 这是从禁用页面来的且角色已变更
    if (typeof window !== 'undefined') {
      window.location.href = '/login?cleared_from_disabled_page=true&role_changed=true';
    } else {
      router.push('/login');
    }
  }, [clearAuthData, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        {/* 错误卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-red-200 dark:border-red-800">
          {/* 错误图标 */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* 错误标题 */}
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {title}
          </h1>

          {/* 错误描述 */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line text-center leading-relaxed">
              {description}
            </p>
          </div>

          {/* 提示信息 */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6">
            <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
              ⚠️ 为确保账户安全，系统已自动清除您的登录信息
            </p>
          </div>

          {/* 操作按钮 */}
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

        {/* 底部帮助信息 */}
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
