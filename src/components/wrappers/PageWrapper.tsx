import React from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/compat/router';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import AppLayout from '@/components/templates/AppLayout';
import { store } from '../../store';
import { AuthLoading } from '@/components/atoms/AuthLoading';
import { navigate } from '@/utils/navigation';

// 获取store的dispatch方法
const getDispatch = () => {
  if (typeof window !== 'undefined') {
    return store.dispatch;
  }
  return () => {};
};

/**
 * 页面内容包装器
 * 根据页面路径决定是否使用AppLayout布局
 * 
 * @component
 * @param {AppProps} props - 组件属性
 * @returns {JSX.Element} 包装后的页面组件
 */
export default function PageWrapper({ Component, pageProps }: AppProps) {
  // 使用useRouter钩子获取路由信息，而不是直接使用props中的router
  // 这是为了更好地支持客户端导航和路由状态管理
  const router = useRouter();
  const { currentUser, authInitialized } = useSelector((state: RootState) => state.user);
  
  // Show loading screen while authentication is initializing
  // Exclude login, register, and account-disabled pages
  if (!authInitialized && router && router.pathname !== '/login' && router.pathname !== '/register' && router.pathname !== '/account-disabled') {
    return <AuthLoading message="Initializing authentication..." />;
  }
  
// 处理登出逻辑
const handleLogout = async () => {
  const dispatch = getDispatch() as AppDispatch;
  const { logoutUser, logout } = await import('../../store/userSlice');
  try {
    // 调用登出 API - 后端会清除 HttpOnly cookies
    await dispatch(logoutUser()).unwrap();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // 确保 Redux 状态被清空（即使 API 失败）
    dispatch(logout());
    // 清除前端存储
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    }
    // 客户端跳转到登录页
    navigate('/login');
  }
};
  
  // 如果页面需要布局包装
  return (
    <AppLayout
      isLoggedIn={!!currentUser && currentUser.status === 'ACTIVE'}
      onLogout={handleLogout}
      username={currentUser?.name}
      userType={currentUser?.userType}>
      <Component {...pageProps} />
    </AppLayout>
  );
}
