import React from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AppLayout from '@/components/templates/AppLayout';
import { store } from '../../store';
import { AuthLoading } from '@/components/atoms/AuthLoading';

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
  if (!authInitialized && router.pathname !== '/login' && router.pathname !== '/register') {
    return <AuthLoading message="Initializing authentication..." />;
  }
  
  // 不需要AppLayout的页面路径（登录/注册相关页面）
  // const noLayoutPages = ['/login', '/register', '/demo-ui'];
  
  // 检查当前页面是否需要AppLayout
  // const needsLayout = !noLayoutPages.includes(router.pathname);
  
  // 处理登出逻辑
  const handleLogout = async () => {
    const dispatch = getDispatch();
    // 导入logoutUser thunk
    const { logoutUser } = await import('../../store/userSlice');
    // 调用登出API
    await dispatch(logoutUser());
    // 重定向到注册页面
    router.push('/register');
  };
  
  // 如果页面需要布局包装
  // if (needsLayout) {
    return (
      <AppLayout
        isLoggedIn={!!currentUser && currentUser.status === 'ACTIVE'}
        onLogout={handleLogout}
        username={currentUser?.name}
        userType={currentUser?.userType}>
        <Component {...pageProps} />
      </AppLayout>
    );
  // }
  
  // 否则直接渲染页面组件
  // return <Component {...pageProps} />;
}