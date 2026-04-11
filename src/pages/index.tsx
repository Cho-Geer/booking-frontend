import React from 'react';
import { useSelector } from 'react-redux';
import LoginPage from '@/components/pages/LoginPage';
import { RootState } from '@/store';
import { useTheme } from '@/hooks/useTheme';

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
