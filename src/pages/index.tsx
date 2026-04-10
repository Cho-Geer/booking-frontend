import React from 'react';
import { useSelector } from 'react-redux';
import LoginPage from '@/components/pages/LoginPage';
import { RootState } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { useEffect } from 'react';

/**
 * 首页路由
 * 根据用户登录状态显示不同内容：
 * - 未登录用户：显示登录表单（居中显示）
 * - 已登录用户：重定向到预约页面
 * 
 * 遵循UI设计系统规范中的页面布局规范
 * 
 * @returns 首页组件
 */
function HomeRoute() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { isDark } = useTheme();

  // 已登录用户重定向到预约页面
  useEffect(() => {
    if (currentUser) {
      // 检查是否有 role_changed 标志，如果有则不重定向，让用户看到登录页
      const urlParams = new URLSearchParams(window.location.search);
      const isRoleChanged = urlParams.get('role_changed') === 'true';
        
      if (isRoleChanged) {
        // 角色变更，不清除认证数据，让用户重新登录
        return;
      }
        
      // 使用 window.location 进行完全重定向，避免 Next.js 路由状态问题
      window.location.href = currentUser?.userType === 'admin' ? '/admin/bookings' : '/bookings';
    }
  }, [currentUser]);

  // 未登录用户显示登录表单
  if (!currentUser) {
    return <LoginPage />;
  }

  // 登录状态检查中显示加载状态
  return (
    <div id="home-loading-container" className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
      <div id="loading-content" className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto`}></div>
        <p className={`mt-4 ${isDark ? 'text-text-dark-secondary' : 'text-gray-600'}`}>加载中...</p>
      </div>
    </div>
  );
}

// 首页不需要认证保护，因为本身就是登录页
export default HomeRoute;
